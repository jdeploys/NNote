import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { openDatabase } from '../../src/main/db/database'
import { MeetingRepository } from '../../src/main/db/meetingRepository'
import { completedPartPath, manifestPath, pendingPartPath } from '../../src/main/recording/recordingPaths'
import { RecordingService } from '../../src/main/recording/recordingService'
import { RecoveryService } from '../../src/main/recording/recoveryService'
import { writeSessionManifest } from '../../src/main/recording/sessionManifest'
import type { Meeting } from '../../src/shared/contracts/meeting'

const roots: string[] = []

function meeting(id: string, status: Meeting['status']): Meeting {
  return {
    id,
    title: id,
    createdAt: '2026-07-14T12:00:00.000Z',
    updatedAt: '2026-07-14T12:00:00.000Z',
    durationMs: status === 'recorded' ? 2_000 : 0,
    status,
    audioPolicy: 'keep',
    audioPath: status === 'recorded' ? 'normal.webm' : null,
    audioByteCount: status === 'recorded' ? 3 : 0,
    selectedTemplateId: null,
  }
}

function harness() {
  const root = mkdtempSync(join(tmpdir(), 'nnote-recovery-'))
  roots.push(root)
  const recordings = join(root, 'recordings')
  mkdirSync(recordings, { recursive: true })
  const database = openDatabase(join(root, 'nnote.sqlite'))
  const meetings = new MeetingRepository(database)
  const recording = new RecordingService(meetings, recordings)
  return { root, recordings, database, meetings, recording, recovery: new RecoveryService(meetings, recording, recordings) }
}

async function interrupted(h: ReturnType<typeof harness>, id = 'interrupted') {
  h.meetings.create(meeting(id, 'recording'))
  writeFileSync(pendingPartPath(h.recordings, id, 0), Buffer.from([1, 2, 3]))
  await writeSessionManifest(h.recordings, {
    version: 1, meetingId: id, activePartIndex: 0, totalBytes: 3, durationMs: 2_000,
    parts: [{ partIndex: 0, lastChunkIndex: 0, byteCount: 3, durationMs: 2_000, completed: false }],
  })
  h.meetings.updateRecordingProgress(id, 3, 2_000)
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('RecoveryService', () => {
  it('marks an interrupted recording recoverable and continues from its persisted cursor', async () => {
    const h = harness()
    await interrupted(h)

    const items = await h.recovery.scan()
    expect(items).toEqual([expect.objectContaining({ meetingId: 'interrupted', kind: 'recoverable', durationMs: 2_000, byteCount: 3 })])
    expect(h.meetings.requireById('interrupted').status).toBe('recoverable')

    const progress = await h.recovery.recover('interrupted')
    expect(progress).toMatchObject({ activePartIndex: 0, nextChunkIndex: 1, totalBytes: 3 })
    expect(h.meetings.requireById('interrupted').status).toBe('recording')
    await h.recording.close()
    h.database.close()
  })

  it('leaves a normal recorded meeting and its audio unchanged', async () => {
    const h = harness()
    h.meetings.create(meeting('normal', 'recorded'))
    writeFileSync(join(h.recordings, 'normal.webm'), Buffer.from([7, 8, 9]))

    expect(await h.recovery.scan()).toEqual([])
    expect(h.meetings.requireById('normal')).toMatchObject({ status: 'recorded', audioPath: 'normal.webm', audioByteCount: 3 })
    expect(readFileSync(join(h.recordings, 'normal.webm'))).toEqual(Buffer.from([7, 8, 9]))
    h.database.close()
  })

  it('does not let renderer recovery actions target an unscanned active recording', async () => {
    const h = harness()
    h.meetings.create(meeting('active', 'recording'))

    await expect(h.recovery.recover('active')).rejects.toThrow(/startup recovery/i)
    await expect(h.recovery.discard('active', { explicitDelete: true })).rejects.toThrow(/startup recovery/i)
    expect(h.meetings.requireById('active').status).toBe('recording')
    h.database.close()
  })

  it('keeps recoverable bytes as a finalized recording idempotently', async () => {
    const h = harness()
    await interrupted(h)
    await h.recovery.scan()

    await h.recovery.keepAsFile('interrupted')
    await h.recovery.keepAsFile('interrupted')

    const completed = completedPartPath(h.recordings, 'interrupted', 0)
    expect(readFileSync(completed)).toEqual(Buffer.from([1, 2, 3]))
    expect(h.meetings.requireById('interrupted')).toMatchObject({ status: 'recorded', audioPath: basename(completed), audioByteCount: 3 })
    await expect(stat(manifestPath(h.recordings, 'interrupted'))).rejects.toMatchObject({ code: 'ENOENT' })
    h.database.close()
  })

  it('requires explicit deletion and makes confirmed discard retry-safe', async () => {
    const h = harness()
    await interrupted(h)
    await h.recovery.scan()

    await expect(h.recovery.discard('interrupted', { explicitDelete: false })).rejects.toThrow(/explicit/i)
    expect(readFileSync(pendingPartPath(h.recordings, 'interrupted', 0))).toEqual(Buffer.from([1, 2, 3]))
    await h.recovery.discard('interrupted', { explicitDelete: true })
    await h.recovery.discard('interrupted', { explicitDelete: true })
    expect(h.meetings.requireById('interrupted').status).toBe('deleted')
    await expect(stat(pendingPartPath(h.recordings, 'interrupted', 0))).rejects.toMatchObject({ code: 'ENOENT' })
    h.database.close()
  })

  it('preserves corrupt-manifest bytes and exposes exportOnly', async () => {
    const h = harness()
    h.meetings.create(meeting('corrupt', 'recording'))
    const pending = pendingPartPath(h.recordings, 'corrupt', 0)
    writeFileSync(pending, Buffer.from([4, 5, 6, 7]))
    writeFileSync(manifestPath(h.recordings, 'corrupt'), '{ definitely not json')

    const items = await h.recovery.scan()

    expect(items).toEqual([expect.objectContaining({ meetingId: 'corrupt', kind: 'exportOnly', byteCount: 4 })])
    expect(readFileSync(pending)).toEqual(Buffer.from([4, 5, 6, 7]))
    await expect(h.recovery.recover('corrupt')).rejects.toThrow(/cannot be resumed/i)
    expect(readFileSync(pending)).toEqual(Buffer.from([4, 5, 6, 7]))
    h.database.close()
  })
})

import { readdir, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { MeetingRepository } from '../db/meetingRepository'
import type { RecoveryItem } from '../../shared/contracts/recovery'
import type { RecordingProgress } from '../../shared/contracts/recording'
import {
  completedPartPath,
  manifestPath,
  pendingPartPath,
  recordingFilePrefix,
  temporaryManifestPath,
} from './recordingPaths'
import type { RecordingService } from './recordingService'
import { readSessionManifest, type SessionManifest } from './sessionManifest'

type RecoveryKind = RecoveryItem['kind']

export class RecoveryService {
  private readonly inspected = new Map<string, RecoveryKind>()

  constructor(
    private readonly meetings: MeetingRepository,
    private readonly recording: RecordingService,
    private readonly recordingsDirectory: string,
  ) {}

  async scan(): Promise<RecoveryItem[]> {
    const candidates = this.meetings.listByStatuses(['recording', 'recoverable'])
    const items: RecoveryItem[] = []
    for (const meeting of candidates) {
      const inspection = await this.inspect(meeting.id)
      if (meeting.status === 'recording') {
        this.meetings.transitionRecordingStatus(meeting.id, 'recoverable')
      }
      this.inspected.set(meeting.id, inspection.kind)
      items.push({
        meetingId: meeting.id,
        createdAt: meeting.createdAt,
        durationMs: inspection.durationMs ?? meeting.durationMs,
        byteCount: inspection.byteCount,
        kind: inspection.kind,
      })
    }
    return items
  }

  async recover(meetingId: string): Promise<RecordingProgress> {
    this.requireStartupRecovery(meetingId, 'recoverable')
    const meeting = this.meetings.requireById(meetingId)
    if (meeting.status === 'recording') return this.recording.start(meetingId)
    if (meeting.status !== 'recoverable') throw new Error(`Meeting ${meetingId} is not recoverable`)
    const inspection = await this.inspect(meetingId)
    if (inspection.kind !== 'recoverable') throw new Error('This recording cannot be resumed; its bytes are export-only')

    this.meetings.transitionRecordingStatus(meetingId, 'recording')
    try {
      return await this.recording.start(meetingId)
    } catch (error) {
      this.meetings.transitionRecordingStatus(meetingId, 'recoverable')
      throw error
    }
  }

  async keepAsFile(meetingId: string): Promise<void> {
    const meeting = this.meetings.requireById(meetingId)
    if (meeting.status === 'recorded') return
    this.requireStartupRecovery(meetingId, 'recoverable')
    if (meeting.status !== 'recording' && meeting.status !== 'recoverable') {
      throw new Error(`Meeting ${meetingId} cannot be kept as a file`)
    }
    const inspection = await this.inspect(meetingId)
    if (inspection.kind !== 'recoverable') throw new Error('This recording is export-only')
    await this.recording.start(meetingId)
    await this.recording.stop(meetingId)
    this.inspected.delete(meetingId)
  }

  async discard(meetingId: string, options: { explicitDelete: boolean }): Promise<void> {
    if (options.explicitDelete !== true) throw new Error('Recovery deletion requires explicitDelete true')
    const meeting = this.meetings.requireById(meetingId)
    if (meeting.status === 'deleted') return
    this.requireStartupRecovery(meetingId)
    if (meeting.status !== 'recording' && meeting.status !== 'recoverable') {
      throw new Error(`Meeting ${meetingId} is not an interrupted recording`)
    }
    const prefix = recordingFilePrefix(meetingId)
    let entries: string[] = []
    try {
      entries = await readdir(this.recordingsDirectory)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
    await Promise.all(
      entries.filter((entry) => entry.startsWith(prefix)).map((entry) => rm(join(this.recordingsDirectory, entry), { force: true })),
    )
    await rm(manifestPath(this.recordingsDirectory, meetingId), { force: true })
    await rm(temporaryManifestPath(this.recordingsDirectory, meetingId), { force: true })
    this.meetings.discardRecording(meetingId)
    this.inspected.delete(meetingId)
  }

  private async inspect(meetingId: string): Promise<{ kind: RecoveryKind; byteCount: number; durationMs?: number }> {
    try {
      const manifest = await readSessionManifest(this.recordingsDirectory, meetingId)
      if (manifest === null) return { kind: 'exportOnly', byteCount: await this.preservedByteCount(meetingId) }
      await this.assertReconciliable(manifest)
      return { kind: 'recoverable', byteCount: manifest.totalBytes, durationMs: manifest.durationMs }
    } catch {
      return { kind: 'exportOnly', byteCount: await this.preservedByteCount(meetingId) }
    }
  }

  private requireStartupRecovery(meetingId: string, requiredKind?: RecoveryKind): void {
    const kind = this.inspected.get(meetingId)
    if (kind === undefined) {
      throw new Error(`Meeting ${meetingId} is not an eligible startup recovery`)
    }
    if (requiredKind !== undefined && kind !== requiredKind) {
      throw new Error('This recording cannot be resumed; its bytes are export-only')
    }
  }

  private async assertReconciliable(manifest: SessionManifest): Promise<void> {
    const seen = new Set<number>()
    let totalBytes = 0
    for (const part of manifest.parts) {
      if (seen.has(part.partIndex)) throw new Error('Duplicate recording part')
      seen.add(part.partIndex)
      totalBytes += part.byteCount
      const pending = await this.fileSize(pendingPartPath(this.recordingsDirectory, manifest.meetingId, part.partIndex))
      const completed = await this.fileSize(completedPartPath(this.recordingsDirectory, manifest.meetingId, part.partIndex))
      if (pending !== null && completed !== null) throw new Error('Recording part exists twice')
      const actual = pending ?? completed
      if (actual === null || actual < part.byteCount) throw new Error('Recording part does not agree with manifest')
      if (part.completed && completed === null && pending === null) throw new Error('Completed part is missing')
    }
    if (totalBytes !== manifest.totalBytes) throw new Error('Recording total does not agree with manifest')
  }

  private async preservedByteCount(meetingId: string): Promise<number> {
    const prefix = recordingFilePrefix(meetingId)
    try {
      const entries = await readdir(this.recordingsDirectory)
      let total = 0
      for (const entry of entries) {
        if (!entry.startsWith(prefix) || (!entry.endsWith('.webm') && !entry.endsWith('.webm.part'))) continue
        total += (await stat(join(this.recordingsDirectory, entry))).size
      }
      return total
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 0
      throw error
    }
  }

  private async fileSize(path: string): Promise<number | null> {
    try { return (await stat(path)).size } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }
  }
}

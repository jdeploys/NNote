import { describe, expect, it, vi } from 'vitest'
import { registerRecoveryHandlers } from '../../src/main/ipc/registerRecoveryHandlers'

describe('recovery IPC', () => {
  it('accepts meeting ids but never renderer filesystem paths', async () => {
    const handlers = new Map<string, (...args: unknown[]) => unknown>()
    const service = {
      scan: vi.fn(async () => []), recover: vi.fn(), keepAsFile: vi.fn(), discard: vi.fn(),
    }
    registerRecoveryHandlers(
      { handle: (channel, listener) => handlers.set(channel, listener) },
      service,
    )

    await handlers.get('recovery:recover')!({}, 'meeting-1')
    expect(service.recover).toHaveBeenCalledWith('meeting-1')
    await expect(Promise.resolve().then(() => handlers.get('recovery:recover')!({}, { meetingId: 'meeting-1', path: 'C:\\secret.webm' }))).rejects.toThrow()
  })

  it('requires explicitDelete true at the IPC boundary', async () => {
    const handlers = new Map<string, (...args: unknown[]) => unknown>()
    const service = {
      scan: vi.fn(), recover: vi.fn(), keepAsFile: vi.fn(), discard: vi.fn(),
    }
    registerRecoveryHandlers(
      { handle: (channel, listener) => handlers.set(channel, listener) },
      service,
    )

    await expect(Promise.resolve().then(() => handlers.get('recovery:discard')!({}, 'meeting-1', { explicitDelete: false }))).rejects.toThrow(/explicit/i)
    expect(service.discard).not.toHaveBeenCalled()
    await handlers.get('recovery:discard')!({}, 'meeting-1', { explicitDelete: true })
    expect(service.discard).toHaveBeenCalledWith('meeting-1', { explicitDelete: true })
  })
})

import { describe, expect, it, vi } from 'vitest'
import { publishWhisperProgressToLiveWindows } from '../../src/main/window/publishWhisperProgress'

const progress = { modelId: 'base' as const, receivedBytes: 1, totalBytes: 10 }

describe('Whisper model progress forwarding', () => {
  it('sends progress only to a live window with live webContents', () => {
    const send = vi.fn()
    publishWhisperProgressToLiveWindows([
      { isDestroyed: () => false, webContents: { isDestroyed: () => false, send } },
    ], progress)
    expect(send).toHaveBeenCalledWith('settings:whisper-model-progress', progress)
  })

  it('skips destroyed windows and destroyed webContents', () => {
    const destroyedWindowSend = vi.fn()
    const destroyedContentsSend = vi.fn()
    publishWhisperProgressToLiveWindows([
      { isDestroyed: () => true, webContents: { isDestroyed: () => false, send: destroyedWindowSend } },
      { isDestroyed: () => false, webContents: { isDestroyed: () => true, send: destroyedContentsSend } },
    ], progress)
    expect(destroyedWindowSend).not.toHaveBeenCalled()
    expect(destroyedContentsSend).not.toHaveBeenCalled()
  })

  it('continues to other live windows when one send races with destruction', () => {
    const healthySend = vi.fn()
    publishWhisperProgressToLiveWindows([
      { isDestroyed: () => false, webContents: { isDestroyed: () => false, send: () => { throw new Error('destroyed') } } },
      { isDestroyed: () => false, webContents: { isDestroyed: () => false, send: healthySend } },
    ], progress)
    expect(healthySend).toHaveBeenCalledWith('settings:whisper-model-progress', progress)
  })
})

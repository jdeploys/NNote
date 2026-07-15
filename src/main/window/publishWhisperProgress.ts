import type { WhisperModelProgress } from '../../shared/contracts/settings'

interface ProgressWebContents {
  isDestroyed(): boolean
  send(channel: string, progress: WhisperModelProgress): void
}

interface ProgressWindow {
  isDestroyed(): boolean
  webContents: ProgressWebContents
}

export function publishWhisperProgressToLiveWindows(
  windows: readonly ProgressWindow[],
  progress: WhisperModelProgress,
): void {
  for (const window of windows) {
    if (!window.isDestroyed() && !window.webContents.isDestroyed()) {
      try {
        window.webContents.send('settings:whisper-model-progress', progress)
      } catch {
        // Destruction can race the checks; another live window should still receive progress.
      }
    }
  }
}

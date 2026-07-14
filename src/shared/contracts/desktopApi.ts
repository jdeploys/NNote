import type { SettingsApi } from './settings'
import type { RecordingApi } from './recording'
import type { RecoveryApi } from './recovery'
import type { TemplatesApi } from './template'

export interface DesktopApi {
  readonly settings: SettingsApi
  readonly recording: RecordingApi
  readonly recovery: RecoveryApi
  readonly templates: TemplatesApi
}

declare global {
  interface Window {
    desktopApi: DesktopApi
  }
}

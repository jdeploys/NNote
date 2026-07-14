import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { OpenAiKeyValidator } from './ai/openAiKeyValidator'
import { KeyringCredentialStore } from './credentials/keyringCredentialStore'
import { openDatabase } from './db/database'
import { MeetingRepository } from './db/meetingRepository'
import { TemplateRepository } from './db/templateRepository'
import { registerRecordingHandlers } from './ipc/registerRecordingHandlers'
import { registerRecoveryHandlers } from './ipc/registerRecoveryHandlers'
import { registerSettingsHandlers } from './ipc/registerSettingsHandlers'
import { registerTemplateHandlers } from './ipc/registerTemplateHandlers'
import { RecordingService } from './recording/recordingService'
import { RecoveryService } from './recording/recoveryService'
import { createMainWindow } from './window/createMainWindow'
import { TemplateService } from './templates/templateService'

registerSettingsHandlers(ipcMain, new KeyringCredentialStore(), new OpenAiKeyValidator())

app.whenReady().then(() => {
  const userDataDirectory = app.getPath('userData')
  const database = openDatabase(join(userDataDirectory, 'nnote.sqlite'))
  const recordingService = new RecordingService(
    new MeetingRepository(database),
    join(userDataDirectory, 'recordings'),
  )
  const templateService = new TemplateService(new TemplateRepository(database))
  templateService.seedDefault()
  registerTemplateHandlers(ipcMain, templateService)
  registerRecordingHandlers(ipcMain, recordingService)
  registerRecoveryHandlers(
    ipcMain,
    new RecoveryService(new MeetingRepository(database), recordingService, join(userDataDirectory, 'recordings')),
  )

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

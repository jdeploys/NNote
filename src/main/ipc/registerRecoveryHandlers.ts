import { z } from 'zod'
import type { RecoveryService } from '../recording/recoveryService'

interface RecoveryIpcMain {
  handle(channel: string, listener: (event: unknown, ...args: unknown[]) => Promise<unknown> | unknown): void
}

type RecoveryServicePort = Pick<RecoveryService, 'scan' | 'recover' | 'keepAsFile' | 'discard'>
const MeetingIdSchema = z.string().trim().min(1)
const ExplicitDeleteSchema = z.object({ explicitDelete: z.literal(true, { error: 'explicitDelete true is required' }) }).strict()

export function registerRecoveryHandlers(ipcMain: RecoveryIpcMain, service: RecoveryServicePort): void {
  ipcMain.handle('recovery:scan', () => service.scan())
  ipcMain.handle('recovery:recover', (_event, meetingId) => service.recover(MeetingIdSchema.parse(meetingId)))
  ipcMain.handle('recovery:keep-as-file', (_event, meetingId) => service.keepAsFile(MeetingIdSchema.parse(meetingId)))
  ipcMain.handle('recovery:discard', (_event, meetingId, options) =>
    service.discard(MeetingIdSchema.parse(meetingId), ExplicitDeleteSchema.parse(options)),
  )
}

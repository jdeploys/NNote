import { z } from 'zod'

export interface ApiKeyStatus {
  configured: boolean
  lastValidatedAt: string | null
}

export const TranscriptionProviderIdSchema = z.enum(['openai', 'local_whisper'])
export const SummaryProviderIdSchema = z.enum(['openai', 'codex_cli'])
export const ProcessingProviderSettingsSchema = z.object({
  transcriptionProvider: TranscriptionProviderIdSchema,
  summaryProvider: SummaryProviderIdSchema,
  localWhisperModel: z.enum(['base', 'small']),
}).strict()

export type ProcessingProviderSettings = z.infer<typeof ProcessingProviderSettingsSchema>

export interface SettingsApi {
  saveApiKey(value: string): Promise<void>
  getApiKeyStatus(): Promise<ApiKeyStatus>
  deleteApiKey(): Promise<void>
  getProcessingProviders(): Promise<ProcessingProviderSettings>
  updateProcessingProviders(input: ProcessingProviderSettings): Promise<ProcessingProviderSettings>
}

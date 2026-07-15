import { z } from 'zod'

export interface ApiKeyStatus {
  configured: boolean
  lastValidatedAt: string | null
}

export const TranscriptionProviderIdSchema = z.enum(['openai', 'local_whisper'])
export const SummaryProviderIdSchema = z.enum(['openai', 'codex_cli'])
export type TranscriptionProviderId = z.infer<typeof TranscriptionProviderIdSchema>
export type SummaryProviderId = z.infer<typeof SummaryProviderIdSchema>

export const ProviderAvailabilitySchema = z.object({
  available: z.boolean(),
  code: z.string().nullable(),
  message: z.string().nullable(),
}).strict()
export const ProviderDescriptorSchema = z.object({
  id: z.union([TranscriptionProviderIdSchema, SummaryProviderIdSchema]),
  stage: z.enum(['transcription', 'summary']),
  displayName: z.string(),
  availability: ProviderAvailabilitySchema,
  privacy: z.enum(['audio_cloud', 'text_cloud', 'local']),
  capabilities: z.array(z.enum(['api_key', 'model_manager', 'cli_status', 'speaker_diarization'])).readonly(),
}).strict()
export type ProcessingProviderDescriptor = z.infer<typeof ProviderDescriptorSchema>
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
  listProcessingProviderDescriptors(): Promise<ProcessingProviderDescriptor[]>
}

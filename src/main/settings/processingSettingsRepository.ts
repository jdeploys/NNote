import type Database from 'better-sqlite3'
import {
  ProcessingProviderSettingsSchema,
  type ProcessingProviderSettings,
} from '../../shared/contracts/settings'

const defaultProcessingProviderSettings: ProcessingProviderSettings = {
  transcriptionProvider: 'openai',
  summaryProvider: 'openai',
  localWhisperModel: 'base',
}

export class ProcessingSettingsRepository {
  constructor(private readonly database: Database.Database) {}

  get(): ProcessingProviderSettings {
    const row = this.database.prepare('SELECT value_json FROM app_settings WHERE key = ?')
      .get('processing_providers') as { value_json: string } | undefined
    let stored: unknown = null
    try {
      stored = row === undefined ? null : JSON.parse(row.value_json)
    } catch {
      stored = null
    }
    const parsed = ProcessingProviderSettingsSchema.safeParse(stored)
    return parsed.success ? parsed.data : defaultProcessingProviderSettings
  }

  update(input: ProcessingProviderSettings): ProcessingProviderSettings {
    const value = ProcessingProviderSettingsSchema.parse(input)
    this.database.prepare(`
      INSERT INTO app_settings(key, value_json) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json
    `).run('processing_providers', JSON.stringify(value))
    return value
  }
}

import { join } from 'node:path'

const LEGACY_USER_DATA_DIRECTORY = 'Nnote'

export function legacyUserDataDirectory(appDataDirectory: string): string {
  return join(appDataDirectory, LEGACY_USER_DATA_DIRECTORY)
}

export function shouldUseLegacyUserDataDirectory(argv: readonly string[]): boolean {
  return !argv.some((argument) => argument.startsWith('--user-data-dir='))
}

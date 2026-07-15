export interface SafeProviderError {
  readonly code: string
  readonly message: string
  readonly retryable: boolean
}

export class ProviderError extends Error implements SafeProviderError {
  constructor(
    readonly code: string,
    message: string,
    readonly retryable: boolean,
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

export function safeProviderError(
  code: string,
  message: string,
  retryable: boolean,
): ProviderError {
  return new ProviderError(code, message, retryable)
}

export function toProviderError(error: unknown): ProviderError {
  if (typeof error === 'object' && error !== null) {
    const value = error as { code?: unknown; message?: unknown; retryable?: unknown }
    if (
      typeof value.code === 'string' &&
      typeof value.message === 'string' &&
      typeof value.retryable === 'boolean'
    ) {
      return safeProviderError(value.code, value.message, value.retryable)
    }
  }
  return safeProviderError('TRANSCRIPTION_PROVIDER_UNKNOWN', 'Transcription provider failed.', false)
}

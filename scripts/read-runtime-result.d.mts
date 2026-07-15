export interface RuntimeResult {
  ok: boolean
  error?: string
  signals?: Record<string, boolean>
}

export function readRuntimeResult(
  resultPath: string,
  options?: { timeoutMs?: number; pollMs?: number },
): Promise<RuntimeResult>

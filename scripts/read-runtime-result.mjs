import { readFile } from 'node:fs/promises'

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export async function readRuntimeResult(resultPath, options = {}) {
  const timeoutMs = options.timeoutMs ?? 5_000
  const pollMs = options.pollMs ?? 50
  const deadline = Date.now() + timeoutMs
  let lastError

  do {
    try {
      return JSON.parse(await readFile(resultPath, 'utf8'))
    } catch (error) {
      lastError = error
      if (!(error instanceof SyntaxError) && error?.code !== 'ENOENT') throw error
      if (Date.now() >= deadline) break
      await delay(pollMs)
    }
  } while (true)

  throw new Error(`Runtime result did not become complete JSON within ${timeoutMs}ms`, { cause: lastError })
}

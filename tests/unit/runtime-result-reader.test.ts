import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { readRuntimeResult } from '../../scripts/read-runtime-result.mjs'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('runtime result reader', () => {
  it('waits for an Intel macOS runtime result file to become complete JSON', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'nnote-runtime-result-'))
    directories.push(directory)
    const resultPath = join(directory, 'result.json')
    await writeFile(resultPath, '')
    const completeWrite = new Promise<void>((resolve) => {
      setTimeout(() => void writeFile(resultPath, JSON.stringify({ ok: true, signals: { main: true } })).then(() => resolve()), 25)
    })

    await expect(readRuntimeResult(resultPath, { timeoutMs: 500, pollMs: 10 })).resolves.toMatchObject({ ok: true })
    await completeWrite
  })

  it('rejects permanently malformed runtime JSON instead of accepting it', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'nnote-runtime-result-'))
    directories.push(directory)
    const resultPath = join(directory, 'result.json')
    await writeFile(resultPath, '{')

    await expect(readRuntimeResult(resultPath, { timeoutMs: 30, pollMs: 5 })).rejects.toThrow('complete JSON')
  })
})

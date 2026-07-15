import { createHash } from 'node:crypto'
import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  collectRuntimeVerificationSignals,
  verifyLocalRuntimePayload,
} from '../../src/main/app/runtimePackageVerification'

const roots: string[] = []
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))))

async function payload(platform: 'win32' | 'darwin' = 'win32', arch = 'x64') {
  const resourcesPath = await mkdtemp(join(tmpdir(), 'nnote-packaged-runtime-'))
  roots.push(resourcesPath)
  const directory = join(resourcesPath, 'local-runtime', `${platform}-${arch}`)
  await mkdir(directory, { recursive: true })
  const names = platform === 'win32' ? ['whisper-cli.exe', 'ffmpeg.exe'] : ['whisper-cli', 'ffmpeg']
  const files = [...names, 'THIRD_PARTY_NOTICES.md', 'LICENSE.whisper.cpp', 'LICENSE.FFmpeg']
  const entries: Record<string, { size: number; sha256: string }> = {}
  for (const name of files) {
    const contents = Buffer.from(`verified ${name}`)
    await writeFile(join(directory, name), contents)
    if (platform === 'darwin' && names.includes(name)) await chmod(join(directory, name), 0o755)
    entries[name] = { size: contents.length, sha256: createHash('sha256').update(contents).digest('hex') }
  }
  await writeFile(join(directory, 'runtime-manifest.json'), JSON.stringify({
    schemaVersion: 1, platform, arch,
    whisperCpp: 'v1.9.1', whisperCppCommit: 'f049fff95a089aa9969deb009cdd4892b3e74916',
    ffmpeg: 'n8.1.2', ffmpegCommit: '1c2c67c0b9f7f66ab32c19dcf7f227bcd290aa4c', files: entries,
  }))
  return { resourcesPath, directory, names }
}

describe('local runtime payload verification', () => {
  it('accepts a contained regular payload whose bytes match the pinned manifest', async () => {
    const fixture = await payload()
    await expect(verifyLocalRuntimePayload({
      resourcesPath: fixture.resourcesPath, platform: 'win32', arch: 'x64',
    })).resolves.toEqual({ whisper: true, ffmpeg: true, notices: true })
  })

  it('rejects the nearest invalid payload with a safe component name', async () => {
    const fixture = await payload()
    await writeFile(join(fixture.directory, 'ffmpeg.exe'), 'tampered path canary')
    const failure = await verifyLocalRuntimePayload({
      resourcesPath: fixture.resourcesPath, platform: 'win32', arch: 'x64',
    }).catch((error: unknown) => error)
    expect(String(failure)).toContain('localRuntime.ffmpeg')
    expect(String(failure)).not.toContain('canary')
    expect(String(failure)).not.toContain(fixture.resourcesPath)
  })
})

describe('packaged runtime verification', () => {
  it('checks main, native modules, local runtime, preload, and renderer through runtime ports', async () => {
    const close = vi.fn()
    const signals = await collectRuntimeVerificationSignals({
      checkSqlite: () => ({ value: 1, close }),
      checkKeyring: () => true,
      checkLocalRuntime: async () => ({ whisper: true, ffmpeg: true, notices: true }),
      checkRenderer: async () => ({ title: 'Nnote', desktopApiAvailable: true, dashboardVisible: true }),
    })

    expect(signals).toEqual({
      main: true, sqlite: true, keyring: true, localRuntime: true, preload: true, renderer: true,
    })
    expect(close).toHaveBeenCalledOnce()
  })

  it('preserves renderer failure attribution independently of local runtime success', async () => {
    await expect(collectRuntimeVerificationSignals({
      checkSqlite: () => ({ value: 1, close: () => undefined }),
      checkKeyring: () => true,
      checkLocalRuntime: async () => ({ whisper: true, ffmpeg: true, notices: true }),
      checkRenderer: async () => ({ title: 'wrong', desktopApiAvailable: true, dashboardVisible: true }),
    })).rejects.toThrow('renderer')
  })
})

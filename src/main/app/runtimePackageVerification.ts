import { createHash } from 'node:crypto'
import { constants } from 'node:fs'
import { lstat, open, readFile, realpath, writeFile } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { BrowserWindow, app, ipcMain } from 'electron'
import { Entry } from '@napi-rs/keyring'
import { openDatabase } from '../db/database'
import { getWindowWebPreferences } from '../window/createMainWindow'

interface SqliteCheck { value: number; close(): void }
interface RendererCheck { title: string; desktopApiAvailable: boolean; dashboardVisible: boolean }
export interface LocalRuntimeCheck { whisper: true; ffmpeg: true; notices: true }

interface RuntimeManifestFile { size: number; sha256: string }
interface RuntimeManifest {
  schemaVersion: 1
  platform: NodeJS.Platform
  arch: string
  whisperCpp: 'v1.9.1'
  whisperCppCommit: 'f049fff95a089aa9969deb009cdd4892b3e74916'
  ffmpeg: 'n8.1.2'
  ffmpegCommit: '1c2c67c0b9f7f66ab32c19dcf7f227bcd290aa4c'
  files: Record<string, RuntimeManifestFile>
}

export interface LocalRuntimeVerificationOptions {
  resourcesPath: string
  platform: NodeJS.Platform
  arch: string
}

interface RuntimeVerificationPorts {
  checkSqlite(): SqliteCheck
  checkKeyring(): boolean
  checkLocalRuntime(): Promise<LocalRuntimeCheck>
  checkRenderer(): Promise<RendererCheck>
}

export interface RuntimeVerificationSignals {
  main: true
  sqlite: true
  keyring: true
  localRuntime: true
  preload: true
  renderer: true
}

function failure(component: string, cause?: unknown): Error {
  const detail = cause instanceof Error ? `: ${cause.message}` : ''
  return new Error(`Package runtime verification failed: ${component}${detail}`, { cause })
}

function localRuntimeFailure(component: string): Error {
  return failure(`localRuntime.${component}`)
}

function isOwned(root: string, candidate: string): boolean {
  const fromRoot = relative(root, candidate)
  return fromRoot !== '..' && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot)
}

function isManifest(value: unknown): value is RuntimeManifest {
  if (typeof value !== 'object' || value === null) return false
  const manifest = value as Partial<RuntimeManifest>
  if (manifest.schemaVersion !== 1 || manifest.whisperCpp !== 'v1.9.1'
    || manifest.whisperCppCommit !== 'f049fff95a089aa9969deb009cdd4892b3e74916'
    || manifest.ffmpeg !== 'n8.1.2'
    || manifest.ffmpegCommit !== '1c2c67c0b9f7f66ab32c19dcf7f227bcd290aa4c') return false
  if (typeof manifest.platform !== 'string' || typeof manifest.arch !== 'string') return false
  return typeof manifest.files === 'object' && manifest.files !== null && !Array.isArray(manifest.files)
}

async function digestOwnedFile(
  root: string,
  name: string,
  expected: RuntimeManifestFile | undefined,
  executable: boolean,
): Promise<void> {
  const component = name.startsWith('whisper-cli') ? 'whisper'
    : name.startsWith('ffmpeg') ? 'ffmpeg' : 'notices'
  if (expected === undefined || !Number.isSafeInteger(expected.size) || expected.size < 0
    || !/^[a-f0-9]{64}$/.test(expected.sha256)) throw localRuntimeFailure(component)
  const candidate = join(root, name)
  let handle
  try {
    const pathDetails = await lstat(candidate)
    if (!pathDetails.isFile() || pathDetails.isSymbolicLink()) throw localRuntimeFailure(component)
    const canonical = await realpath(candidate)
    if (!isOwned(root, canonical)) throw localRuntimeFailure(component)
    handle = await open(candidate, constants.O_RDONLY | constants.O_NOFOLLOW)
    const opened = await handle.stat()
    if (!opened.isFile() || opened.size !== expected.size) throw localRuntimeFailure(component)
    if (executable && (opened.mode & 0o111) === 0) throw localRuntimeFailure(component)
    const hash = createHash('sha256')
    const buffer = Buffer.allocUnsafe(1024 * 1024)
    let offset = 0
    while (offset < opened.size) {
      const { bytesRead } = await handle.read(buffer, 0, Math.min(buffer.length, opened.size - offset), offset)
      if (bytesRead === 0) throw localRuntimeFailure(component)
      hash.update(buffer.subarray(0, bytesRead))
      offset += bytesRead
    }
    if (hash.digest('hex') !== expected.sha256) throw localRuntimeFailure(component)
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes(`localRuntime.${component}`)) throw cause
    throw localRuntimeFailure(component)
  } finally {
    await handle?.close().catch(() => undefined)
  }
}

export async function verifyLocalRuntimePayload(
  options: LocalRuntimeVerificationOptions,
): Promise<LocalRuntimeCheck> {
  const target = `${options.platform}-${options.arch}`
  if (!['win32-x64', 'darwin-x64', 'darwin-arm64'].includes(target)) throw localRuntimeFailure('target')
  const requestedRoot = join(options.resourcesPath, 'local-runtime', target)
  let root: string
  try {
    const rootDetails = await lstat(requestedRoot)
    if (!rootDetails.isDirectory() || rootDetails.isSymbolicLink()) throw localRuntimeFailure('directory')
    root = await realpath(requestedRoot)
    if (root !== resolve(requestedRoot)) throw localRuntimeFailure('directory')
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes('localRuntime.directory')) throw cause
    throw localRuntimeFailure('directory')
  }

  let manifest: RuntimeManifest
  try {
    const manifestPath = join(root, 'runtime-manifest.json')
    const details = await lstat(manifestPath)
    if (!details.isFile() || details.isSymbolicLink() || details.size > 128 * 1024) throw localRuntimeFailure('manifest')
    const parsed: unknown = JSON.parse(await readFile(manifestPath, 'utf8'))
    if (!isManifest(parsed) || parsed.platform !== options.platform || parsed.arch !== options.arch) {
      throw localRuntimeFailure('manifest')
    }
    manifest = parsed
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes('localRuntime.manifest')) throw cause
    throw localRuntimeFailure('manifest')
  }

  const windows = options.platform === 'win32'
  const whisper = windows ? 'whisper-cli.exe' : 'whisper-cli'
  const ffmpeg = windows ? 'ffmpeg.exe' : 'ffmpeg'
  await digestOwnedFile(root, whisper, manifest.files[whisper], !windows)
  await digestOwnedFile(root, ffmpeg, manifest.files[ffmpeg], !windows)
  await digestOwnedFile(root, 'THIRD_PARTY_NOTICES.md', manifest.files['THIRD_PARTY_NOTICES.md'], false)
  await digestOwnedFile(root, 'LICENSE.whisper.cpp', manifest.files['LICENSE.whisper.cpp'], false)
  await digestOwnedFile(root, 'LICENSE.FFmpeg', manifest.files['LICENSE.FFmpeg'], false)
  return { whisper: true, ffmpeg: true, notices: true }
}

export async function collectRuntimeVerificationSignals(
  ports: RuntimeVerificationPorts,
): Promise<RuntimeVerificationSignals> {
  let sqlite: SqliteCheck
  try {
    sqlite = ports.checkSqlite()
    if (sqlite.value !== 1) throw new Error('unexpected query result')
  } catch (cause) {
    throw failure('sqlite', cause)
  }
  sqlite.close()

  try {
    if (!ports.checkKeyring()) throw new Error('native module unavailable')
  } catch (cause) {
    throw failure('keyring', cause)
  }

  try {
    const localRuntime = await ports.checkLocalRuntime()
    if (!localRuntime.whisper || !localRuntime.ffmpeg || !localRuntime.notices) throw new Error('invalid payload')
  } catch (cause) {
    throw failure('localRuntime', cause)
  }

  let renderer: RendererCheck
  try {
    renderer = await ports.checkRenderer()
  } catch (cause) {
    throw failure('renderer', cause)
  }
  if (!renderer.desktopApiAvailable) throw failure('preload')
  if (renderer.title !== 'Nnote' || !renderer.dashboardVisible) throw failure('renderer')

  return { main: true, sqlite: true, keyring: true, localRuntime: true, preload: true, renderer: true }
}

async function checkRenderer(): Promise<RendererCheck> {
  const window = new BrowserWindow({
    show: false,
    webPreferences: getWindowWebPreferences(join(__dirname, '../preload/index.js')),
  })
  try {
    ipcMain.handle('recovery:scan', () => [])
    ipcMain.handle('meetings:list', () => [])
    await window.loadFile(join(__dirname, '../renderer/index.html'))
    await window.webContents.executeJavaScript(`new Promise((resolve) => {
      const done = () => resolve(Boolean([...document.querySelectorAll('h1')].find((node) => node.textContent === '새 회의')))
      if (document.readyState === 'complete') setTimeout(done, 50)
      else addEventListener('load', () => setTimeout(done, 50), { once: true })
    })`)
    return await window.webContents.executeJavaScript(`({
      title: document.title,
      desktopApiAvailable: typeof window.desktopApi === 'object' && typeof window.desktopApi.meetings?.list === 'function',
      dashboardVisible: Boolean([...document.querySelectorAll('h1')].find((node) => node.textContent === '새 회의'))
    })`) as RendererCheck
  } finally {
    ipcMain.removeHandler('recovery:scan')
    ipcMain.removeHandler('meetings:list')
    window.destroy()
  }
}

export async function runPackageRuntimeVerification(resultPath: string): Promise<void> {
  try {
    const signals = await collectRuntimeVerificationSignals({
      checkSqlite: () => {
        const database = openDatabase(join(app.getPath('userData'), 'verify.sqlite'))
        const row = database.prepare('SELECT 1 AS value').get() as { value: number }
        return {
          value: Number(row.value),
          close: () => database.close(),
        }
      },
      checkKeyring: () => {
        const entry = new Entry('Nnote Runtime Verification', 'module-load-only')
        return typeof entry.getPassword === 'function'
      },
      checkLocalRuntime: () => verifyLocalRuntimePayload({
        resourcesPath: process.resourcesPath,
        platform: process.platform,
        arch: process.arch,
      }),
      checkRenderer,
    })
    await writeFile(resultPath, `${JSON.stringify({ ok: true, signals })}\n`, { encoding: 'utf8', flag: 'wx' })
    app.exit(0)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Package runtime verification failed: unknown'
    await writeFile(resultPath, `${JSON.stringify({ ok: false, error: message })}\n`, { encoding: 'utf8', flag: 'wx' })
      .catch(() => undefined)
    app.exit(1)
  }
}

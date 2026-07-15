import { createHash } from 'node:crypto'
import { constants } from 'node:fs'
import { lstat, open, realpath, writeFile } from 'node:fs/promises'
import { basename, isAbsolute, join, relative, resolve, sep } from 'node:path'

const [, , directoryArgument, platform, arch] = process.argv
const target = `${platform}-${arch}`
if (!directoryArgument || !['win32-x64', 'darwin-x64', 'darwin-arm64'].includes(target)) {
  throw new Error('Unsupported local runtime manifest target')
}
const directory = resolve(directoryArgument)
if (!isAbsolute(directory)) throw new Error('Local runtime output must be absolute')
const canonicalRoot = await realpath(directory)
if (canonicalRoot !== directory) throw new Error('Local runtime output must not be linked')

const executableNames = platform === 'win32' ? ['whisper-cli.exe', 'ffmpeg.exe'] : ['whisper-cli', 'ffmpeg']
const names = [...executableNames, 'THIRD_PARTY_NOTICES.md', 'LICENSE.whisper.cpp', 'LICENSE.FFmpeg']
const files = {}
for (const name of names) {
  if (basename(name) !== name) throw new Error('Invalid local runtime component')
  const candidate = join(canonicalRoot, name)
  const details = await lstat(candidate)
  const canonical = await realpath(candidate)
  const fromRoot = relative(canonicalRoot, canonical)
  if (!details.isFile() || details.isSymbolicLink() || fromRoot === '..'
    || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) throw new Error(`Invalid local runtime component: ${name}`)
  if (platform === 'darwin' && executableNames.includes(name) && (details.mode & 0o111) === 0) {
    throw new Error(`Local runtime component is not executable: ${name}`)
  }
  const handle = await open(candidate, constants.O_RDONLY | constants.O_NOFOLLOW)
  try {
    const hash = createHash('sha256')
    const buffer = Buffer.allocUnsafe(1024 * 1024)
    let offset = 0
    while (offset < details.size) {
      const { bytesRead } = await handle.read(buffer, 0, Math.min(buffer.length, details.size - offset), offset)
      if (bytesRead === 0) throw new Error(`Unexpected EOF: ${name}`)
      hash.update(buffer.subarray(0, bytesRead))
      offset += bytesRead
    }
    files[name] = { size: details.size, sha256: hash.digest('hex') }
  } finally {
    await handle.close()
  }
}

await writeFile(join(canonicalRoot, 'runtime-manifest.json'), `${JSON.stringify({
  schemaVersion: 1,
  platform,
  arch,
  whisperCpp: 'v1.9.1',
  whisperCppCommit: 'f049fff95a089aa9969deb009cdd4892b3e74916',
  ffmpeg: 'n8.1.2',
  ffmpegCommit: '1c2c67c0b9f7f66ab32c19dcf7f227bcd290aa4c',
  files,
}, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })

import { constants as fsConstants } from 'node:fs'
import { lstat, open, realpath, type FileHandle } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'

interface Identity { dev: bigint; ino: bigint }

export class OwnedTemporaryFileTooLargeError extends Error {}
export class OwnedTemporaryFileInvalidError extends Error {}

function sameIdentity(left: Identity, right: Identity): boolean {
  const sameDevice = left.dev === right.dev
    || (process.platform === 'win32' && (left.dev === 0n || right.dev === 0n))
  return sameDevice && left.ino === right.ino
}

function contained(root: string, candidate: string): boolean {
  const fromRoot = relative(root, candidate)
  return fromRoot !== '..' && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot)
}

async function readExact(handle: FileHandle, length: number, position: number): Promise<Buffer> {
  const buffer = Buffer.alloc(length)
  let offset = 0
  while (offset < length) {
    const result = await handle.read(buffer, offset, length - offset, position + offset)
    if (result.bytesRead === 0) throw new Error('Unexpected end of owned temporary file')
    offset += result.bytesRead
  }
  return buffer
}

export class OwnedTemporaryFiles {
  private constructor(
    readonly root: string,
    private readonly identity: Identity,
  ) {}

  static async capture(requestedRoot: string): Promise<OwnedTemporaryFiles> {
    const requested = resolve(requestedRoot)
    const initial = await lstat(requested, { bigint: true })
    if (!initial.isDirectory() || initial.isSymbolicLink()) throw new OwnedTemporaryFileInvalidError('Invalid temporary directory')
    const canonical = await realpath(requested)
    const canonicalStat = await lstat(canonical, { bigint: true })
    if (!canonicalStat.isDirectory() || canonicalStat.isSymbolicLink() || !sameIdentity(initial, canonicalStat)) {
      throw new OwnedTemporaryFileInvalidError('Invalid temporary directory')
    }
    return new OwnedTemporaryFiles(canonical, { dev: canonicalStat.dev, ino: canonicalStat.ino })
  }

  async readText(path: string, maximumBytes: number): Promise<string> {
    const opened = await this.openVerified(path, maximumBytes)
    try {
      return (await readExact(opened.handle, opened.size, 0)).toString('utf8')
    } finally {
      await opened.handle.close()
    }
  }

  async pcmDuration(path: string): Promise<number> {
    const opened = await this.openVerified(path)
    try {
      const { handle, size } = opened
      if (size < 12) throw new Error('Invalid PCM WAV')
      const riff = await readExact(handle, 12, 0)
      if (riff.toString('ascii', 0, 4) !== 'RIFF' || riff.toString('ascii', 8, 12) !== 'WAVE') {
        throw new Error('Invalid PCM WAV')
      }
      if (riff.readUInt32LE(4) + 8 !== size) throw new Error('Invalid PCM WAV')

      let offset = 12
      let formatSeen = false
      for (let chunks = 0; chunks < 1024 && offset + 8 <= size; chunks += 1) {
        const header = await readExact(handle, 8, offset)
        const id = header.toString('ascii', 0, 4)
        const chunkSize = header.readUInt32LE(4)
        const contentOffset = offset + 8
        const payloadEnd = contentOffset + chunkSize
        const paddedEnd = payloadEnd + (chunkSize % 2)
        if (!Number.isSafeInteger(paddedEnd) || payloadEnd > size || paddedEnd > size) throw new Error('Invalid PCM WAV')

        if (id === 'fmt ') {
          if (formatSeen || chunkSize < 16) throw new Error('Invalid PCM WAV')
          const format = await readExact(handle, 16, contentOffset)
          if (
            format.readUInt16LE(0) !== 1
            || format.readUInt16LE(2) !== 1
            || format.readUInt32LE(4) !== 16_000
            || format.readUInt32LE(8) !== 32_000
            || format.readUInt16LE(12) !== 2
            || format.readUInt16LE(14) !== 16
          ) throw new Error('Invalid PCM WAV')
          formatSeen = true
        } else if (id === 'data') {
          if (!formatSeen || chunkSize % 2 !== 0) throw new Error('Invalid PCM WAV')
          return chunkSize / 32_000
        }
        offset = paddedEnd
      }
      throw new Error('Invalid PCM WAV')
    } finally {
      await opened.handle.close()
    }
  }

  private async openVerified(path: string, maximumBytes = Number.MAX_SAFE_INTEGER): Promise<{
    handle: FileHandle
    size: number
  }> {
    await this.assertRoot()
    const candidate = resolve(path)
    if (!contained(this.root, candidate)) throw new OwnedTemporaryFileInvalidError('Temporary file escaped its owned directory')
    const pathStat = await lstat(candidate, { bigint: true })
    if (!pathStat.isFile() || pathStat.isSymbolicLink() || pathStat.nlink !== 1n) throw new OwnedTemporaryFileInvalidError('Invalid temporary file')
    const noFollow = typeof fsConstants.O_NOFOLLOW === 'number' ? fsConstants.O_NOFOLLOW : 0
    const handle = await open(candidate, fsConstants.O_RDONLY | noFollow)
    try {
      const handleStat = await handle.stat({ bigint: true })
      if (
        !handleStat.isFile() || handleStat.nlink !== 1n
        || !sameIdentity(pathStat, handleStat)
        || handleStat.size > BigInt(Number.MAX_SAFE_INTEGER)
      ) throw new OwnedTemporaryFileInvalidError('Invalid temporary file')
      if (handleStat.size > BigInt(maximumBytes)) throw new OwnedTemporaryFileTooLargeError()
      const canonical = await realpath(candidate)
      if (!contained(this.root, canonical)) throw new OwnedTemporaryFileInvalidError('Temporary file escaped its owned directory')
      await this.assertRoot()
      return { handle, size: Number(handleStat.size) }
    } catch (error) {
      await handle.close()
      throw error
    }
  }

  private async assertRoot(): Promise<void> {
    const current = await lstat(this.root, { bigint: true })
    if (
      !current.isDirectory() || current.isSymbolicLink()
      || !sameIdentity(current, this.identity)
      || await realpath(this.root) !== this.root
    ) throw new OwnedTemporaryFileInvalidError('Owned temporary directory changed')
  }
}

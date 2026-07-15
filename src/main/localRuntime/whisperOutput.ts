import type { NormalizedTranscription } from '../ai/providers/providerPorts'

const MAX_SEGMENTS = 100_000
const PINNED_TIMESTAMP = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/

interface PinnedWhisperOutput {
  result: { language: string }
  transcription: Array<{
    timestamps: { from: string; to: string }
    offsets: { from: number; to: number }
    text: string
  }>
}

function invalid(): never {
  throw new Error('Invalid pinned whisper.cpp output')
}

function timestampMilliseconds(value: string): number {
  const match = PINNED_TIMESTAMP.exec(value)
  if (match === null) return invalid()
  const [, hoursValue, minutesValue, secondsValue, millisValue] = match
  const hours = Number(hoursValue)
  const minutes = Number(minutesValue)
  const seconds = Number(secondsValue)
  const millis = Number(millisValue)
  if (minutes > 59 || seconds > 59) return invalid()
  return ((hours * 60 + minutes) * 60 + seconds) * 1_000 + millis
}

export function parseWhisperOutput(json: string, durationSeconds: number): NormalizedTranscription {
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) return invalid()
  let value: unknown
  try { value = JSON.parse(json) } catch { return invalid() }
  if (typeof value !== 'object' || value === null) return invalid()
  const output = value as Partial<PinnedWhisperOutput>
  if (
    typeof output.result !== 'object' || output.result === null
    || output.result.language !== 'ko'
    || !Array.isArray(output.transcription)
    || output.transcription.length > MAX_SEGMENTS
  ) return invalid()

  let previousStart = 0
  const segments = output.transcription.map((raw) => {
    if (
      typeof raw !== 'object' || raw === null
      || typeof raw.timestamps !== 'object' || raw.timestamps === null
      || typeof raw.timestamps.from !== 'string' || typeof raw.timestamps.to !== 'string'
      || typeof raw.offsets !== 'object' || raw.offsets === null
    ) return invalid()
    const { from, to } = raw.offsets
    const timestampFrom = timestampMilliseconds(raw.timestamps.from)
    const timestampTo = timestampMilliseconds(raw.timestamps.to)
    const text = typeof raw.text === 'string' ? raw.text.trim() : ''
    if (
      !Number.isSafeInteger(from) || !Number.isSafeInteger(to)
      || from < 0 || to < from || from !== timestampFrom || to !== timestampTo
      || from < previousStart || to / 1_000 > durationSeconds + 0.001
      || text.length === 0
    ) return invalid()
    previousStart = from
    return { speakerLabel: null, startSeconds: from / 1_000, endSeconds: to / 1_000, text }
  })
  return { durationSeconds, segments }
}

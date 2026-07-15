import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { hasTask10VisualBaseline } from '../visual/platformSupport'

describe('Task 10 visual baseline platform gate', () => {
  it('runs Windows and macOS comparisons and skips unsupported Linux', () => {
    expect(hasTask10VisualBaseline('win32')).toBe(true)
    expect(hasTask10VisualBaseline('darwin')).toBe(true)
    expect(hasTask10VisualBaseline('linux')).toBe(false)
  })

  it('uses the Linear-inspired dark token contract without legacy decoration', () => {
    const tokens = readFileSync(resolve('src/renderer/src/styles/tokens.css'), 'utf8')
    const styles = readFileSync(resolve('src/renderer/src/styles/app.css'), 'utf8')

    expect(tokens).toContain('--canvas: #010102')
    expect(tokens).toContain('--primary: #5e6ad2')
    expect(tokens).toContain('--surface-1: #0f1011')
    expect(`${tokens}\n${styles}`).not.toMatch(/Georgia|linear-gradient|#176c4f/i)
  })
})

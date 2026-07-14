import { describe, expect, it } from 'vitest'
import { hasTask10VisualBaseline } from '../visual/platformSupport'

describe('Task 10 visual baseline platform gate', () => {
  it('runs Windows comparisons and skips platforms without committed baselines', () => {
    expect(hasTask10VisualBaseline('win32')).toBe(true)
    expect(hasTask10VisualBaseline('darwin')).toBe(false)
    expect(hasTask10VisualBaseline('linux')).toBe(false)
  })
})

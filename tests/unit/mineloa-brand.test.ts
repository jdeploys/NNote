import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  legacyUserDataDirectory,
  shouldUseLegacyUserDataDirectory,
} from '../../src/main/app/userDataCompatibility'

describe('Mineloa brand compatibility', () => {
  it('keeps existing Nnote user data while exposing the new public identity', () => {
    expect(legacyUserDataDirectory(resolve('app-data'))).toBe(join(resolve('app-data'), 'Nnote'))
  })

  it('preserves an explicitly isolated user-data directory', () => {
    expect(shouldUseLegacyUserDataDirectory(['electron', '--user-data-dir=C:\\isolated'])).toBe(false)
    expect(shouldUseLegacyUserDataDirectory(['electron'])).toBe(true)
  })

  it('uses the Airbnb coral icon without the old gradient or decorative dot', () => {
    const icon = readFileSync(resolve('build/icons/icon.svg'), 'utf8')
    expect(icon).toContain('<title id="title">Mineloa</title>')
    expect(icon).toContain('#FF385C')
    expect(icon).toContain('class="brand-glyph"')
    expect(icon).not.toContain('linearGradient')
    expect(icon).not.toContain('<circle')
  })
})

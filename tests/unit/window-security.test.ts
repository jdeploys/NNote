import { describe, expect, it } from 'vitest'
import { getWindowWebPreferences } from '../../src/main/window/createMainWindow'

describe('desktop window security', () => {
  it('isolates the renderer and disables Node integration', () => {
    expect(getWindowWebPreferences('/tmp/preload.js')).toMatchObject({
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: '/tmp/preload.js',
    })
  })
})

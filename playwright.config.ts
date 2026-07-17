import { defineConfig } from '@playwright/test'

const visualPort = process.env.NNOTE_VISUAL_PORT ?? '5182'
const visualBaseUrl = `http://127.0.0.1:${visualPort}`

export default defineConfig({
  testDir: 'tests',
  testMatch: ['visual/**/*.pw.ts', 'e2e/**/*.spec.ts'],
  workers: 1,
  use: { baseURL: visualBaseUrl, viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
  webServer: {
    command: `npx vite tests/visual/harness --host 127.0.0.1 --port ${visualPort} --strictPort`,
    url: visualBaseUrl,
    reuseExistingServer: false,
  },
  snapshotPathTemplate: '{testDir}/visual/snapshots/{platform}/{arg}{ext}',
})

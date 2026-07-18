import { defineConfig } from '@playwright/test'

const visualPort = process.env.NNOTE_VISUAL_PORT ?? '5182'
const visualBaseUrl = `http://127.0.0.1:${visualPort}`

export default defineConfig({
  testDir: 'tests/docs',
  testMatch: '**/*.pw.ts',
  workers: 1,
  use: { baseURL: visualBaseUrl, viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 },
  webServer: {
    command: `npx vite tests/visual/harness --host 127.0.0.1 --port ${visualPort} --strictPort`,
    url: visualBaseUrl,
    reuseExistingServer: false,
  },
})

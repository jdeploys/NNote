import { _electron as electron, expect, test } from '@playwright/test'
import { resolve } from 'node:path'

const electronPath = require('electron') as string
const root = resolve(__dirname, '../..')

test('launches the real built app securely and records fake microphone audio', async () => {
  const app = await electron.launch({
    executablePath: electronPath,
    cwd: root,
    args: [
      `--user-data-dir=${test.info().outputPath('user-data')}`,
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-audio-capture=${resolve(root, 'tests/e2e/fixtures/fake-audio.wav')}`,
      '.',
    ],
  })
  try {
    const window = await app.firstWindow()
    await expect(window).toHaveTitle('Nnote')
    expect(await window.evaluate(() => typeof (window as unknown as { require?: unknown }).require)).toBe('undefined')
    await expect(window.getByRole('heading', { name: '새 회의' })).toBeVisible()
    await expect(window.getByRole('button', { name: '.nnote 가져오기' })).toBeVisible()
    await expect(window.getByLabel('요약 템플릿')).toBeVisible()
    await expect(window.getByLabel('원본 오디오')).toBeVisible()

    const electronBounds = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]!.getBounds())
    expect(electronBounds).toMatchObject({ width: 1200, height: 800 })
    expect(await window.evaluate(() => ({ outerWidth, outerHeight }))).toMatchObject({ outerWidth: 1200, outerHeight: 800 })

    await window.getByRole('button', { name: '설정', exact: true }).click()
    await expect(window.getByRole('heading', { name: '설정', exact: true })).toBeInViewport()
    expect(await window.evaluate(() => ({
      scrollY,
      theme: document.documentElement.dataset.theme,
      background: getComputedStyle(document.body).backgroundColor,
    }))).toMatchObject({
      scrollY: 0,
      theme: expect.stringMatching(/light|dark/),
      background: expect.not.stringMatching(/rgba\(0, 0, 0, 0\)|transparent/),
    })
    await expect(window.getByRole('button', { name: '전체 기록', exact: true })).toBeVisible()
    await window.getByRole('button', { name: '전체 기록', exact: true }).click()
    await expect(window.getByRole('heading', { name: '새 회의' })).toBeInViewport()

    await window.getByRole('button', { name: '녹음 시작' }).click()
    await expect(window.getByText('녹음 중')).toBeVisible()
    await window.waitForTimeout(500)
    await window.getByRole('button', { name: '종료', exact: true }).click()
    await expect(window.getByText('recorded')).toBeVisible()
    await window.getByText('recorded').click()
    await expect(window.getByRole('button', { name: '전사 및 요약 시작' })).toBeVisible()
    await expect(window.getByRole('button', { name: '.nnote 내보내기' })).toBeVisible()
    await expect(window.getByRole('button', { name: 'Markdown 내보내기' })).toBeVisible()
  } finally {
    await app.close()
  }
})

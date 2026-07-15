import { expect, test, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

test.skip(process.platform !== 'win32', 'Documentation screenshots use the reviewed Windows rendering.')

const output = (name: string) => resolve('docs', 'screenshots', 'after-linear', name)

test.beforeAll(async () => mkdir(resolve('docs', 'screenshots', 'after-linear'), { recursive: true }))

async function capture(page: Page, state: string, name: string, heading: string) {
  await page.goto(`/?state=${state}`)
  await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))))
  await page.waitForTimeout(150)
  await page.screenshot({ path: output(name), animations: 'disabled', fullPage: true, omitBackground: false })
}

test('documents the empty dashboard', async ({ page }) => capture(page, 'idle', '01-dashboard.png', '새 회의'))
test('documents active local recording', async ({ page }) => {
  await page.goto('/?state=active')
  await page.getByRole('button', { name: '녹음 시작' }).click()
  await expect(page.getByRole('button', { name: '종료', exact: true })).toBeVisible()
  await page.screenshot({ path: output('02-recording.png'), animations: 'disabled', fullPage: true, omitBackground: false })
})
test('documents crash recovery', async ({ page }) => capture(page, 'recoverable', '03-recovery.png', '최근 기록'))
test('documents a failed processing state', async ({ page }) => capture(page, 'failed', '04-processing-failed.png', '최근 기록'))
test('documents the completed meeting workspace', async ({ page }) => capture(page, 'completed', '05-meeting-detail.png', '제품 방향성 회의'))
test('documents summary template editing', async ({ page }) => capture(page, 'templates', '06-template-editor.png', '요약 템플릿'))
test('documents local API key settings', async ({ page }) => capture(page, 'settings', '07-api-key-settings.png', '설정'))

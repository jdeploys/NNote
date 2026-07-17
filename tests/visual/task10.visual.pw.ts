import { expect, test, type Page } from '@playwright/test'
import { hasTask10VisualBaseline } from './platformSupport'

test.skip(
  !hasTask10VisualBaseline(process.platform),
  `Task 10 visual comparisons support Windows and macOS, not ${process.platform}.`,
)

type FixtureTheme = 'light' | 'dark'

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await page.waitForTimeout(150)
}

async function openRoute(page: Page, state: string, theme: FixtureTheme = 'light') {
  await page.goto(`/?state=${state}&theme=${theme}`)

  if (state === 'active') await page.getByRole('button', { name: '녹음 시작' }).click()
  if (state === 'completed') await page.getByRole('button', { name: /제품 방향성 회의/ }).click()
  if (state === 'templates') await page.getByRole('button', { name: '요약 템플릿' }).click()
  if (state === 'settings' || state.startsWith('provider-') || state.startsWith('whisper-') || state.startsWith('codex-')) {
    await page.getByRole('button', { name: '설정', exact: true }).click()
  }

  await settle(page)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme)
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

test('real dashboard light route keeps its heading and primary action in the 1200x800 viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await openRoute(page, 'idle', 'light')
  await expect(page.getByRole('heading', { name: '새 회의' })).toBeInViewport()
  await expect(page.getByRole('button', { name: '녹음 시작' })).toBeInViewport()
  await expect(page).toHaveScreenshot('dashboard-idle-light.png', { animations: 'disabled', fullPage: false, omitBackground: false })
})

test('real dashboard dark route uses the warm-charcoal theme in the 1200x800 viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await openRoute(page, 'idle', 'dark')
  await expect(page.getByRole('heading', { name: '새 회의' })).toBeInViewport()
  await expect(page.getByRole('button', { name: '녹음 시작' })).toBeInViewport()
  await expect(page).toHaveScreenshot('dashboard-idle-dark.png', { animations: 'disabled', fullPage: false, omitBackground: false })
})

test('dashboard recording start remains button-driven through the real App', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await openRoute(page, 'active')
  await expect(page.getByText('녹음 중', { exact: true })).toBeInViewport()
  await expect(page.getByRole('button', { name: '종료', exact: true })).toBeInViewport()
  await expect(page).toHaveScreenshot('dashboard-active.png', { animations: 'disabled', fullPage: false, omitBackground: false })
})

test('meeting detail opens from the real meeting row and preserves a full-document baseline', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await openRoute(page, 'completed')
  await expect(page.getByRole('heading', { name: '제품 방향성 회의' })).toBeInViewport()
  await expect(page).toHaveScreenshot('meeting-detail-completed.png', { animations: 'disabled', fullPage: true, omitBackground: false })
})

for (const [state, snapshot] of [
  ['failed', 'dashboard-failed.png'],
  ['recoverable', 'dashboard-recoverable.png'],
] as const) {
  test(`real dashboard route visibly shows ${state} processing`, async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await openRoute(page, state)
    await expect(page.getByRole('heading', { name: '새 회의' })).toBeInViewport()
    await expect(page).toHaveScreenshot(snapshot, { animations: 'disabled', fullPage: false, omitBackground: false })
  })
}

test('real template route resets scroll and keeps its heading and save action in the 1200x800 viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await openRoute(page, 'templates')
  await expect(page.getByRole('heading', { name: '요약 템플릿', exact: true })).toBeInViewport()
  await page.getByRole('button', { name: '새 템플릿' }).click()
  await expect(page.getByLabel('템플릿 이름')).toHaveValue('새 템플릿')
  await expect(page.getByRole('button', { name: '템플릿 저장' })).toBeInViewport()
  await expect(page).toHaveScreenshot('templates-light.png', { animations: 'disabled', fullPage: false, omitBackground: false })
})

for (const width of [938, 640]) {
  test(`real dashboard has no horizontal overflow at ${width}x800`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await openRoute(page, 'failed')
    await expectNoHorizontalOverflow(page)
    if (width === 640) {
      await expect(page).toHaveScreenshot('dashboard-narrow-640.png', { animations: 'disabled', fullPage: false, omitBackground: false })
    }
  })
}

# Task 8 Report: Real-App Visual Harness and Electron Viewport

## Status

Implemented and verified on Windows. The visual harness now always renders the real `App` with deterministic `DesktopApi` and recording-controller fixtures, and route tests enter secondary screens through the App's own buttons or meeting rows.

## Locked scope

- Changed only the Task 8 visual/e2e harness, its reviewed Windows snapshots, and this report.
- Included `playwright.config.ts` as a controller-authorized test-infrastructure expansion: reserved port 4178 is no longer used; the default is 5182 and `NNOTE_VISUAL_PORT` can override it.
- Did not change renderer production code, APIs, IPC, recording behavior, template behavior, provider behavior, Main, Preload, shared contracts, or databases.
- Did not generate, delete, overwrite, or otherwise modify Darwin snapshots. They require a truthful macOS runner.

## TDD evidence

### RED

Added the route-driven visual contract before changing the harness, then ran:

```powershell
npx playwright test tests/visual/task10.visual.pw.ts -g "real template route resets" --reporter=line
```

The test failed for the expected missing behavior: the old harness rendered `TemplateEditor` directly and timed out waiting for the real App navigation button `getByRole('button', { name: '요약 템플릿' })`.

The initial two-file run also confirmed the expected old-baseline mismatch after the harness started navigating real routes: the existing snapshots were 1280×900/full-page component captures while actual route captures were 1200×800 viewports.

### GREEN

The harness now:

- imports the same Inter font and tokens/themes/globals/app CSS as the production renderer;
- mounts only `<App desktopApi={fixtureApi} recordingController={fixtureController} />`;
- keeps meeting, transcript, summary, template, provider, and model fixtures deterministic;
- implements deterministic recording subscription/start/stop/pause/resume behavior so recording is exercised through the real button;
- seeds `localStorage['nnote.theme']` from the test-only `theme=light|dark` query before App render;
- exposes route state through API fixture responses rather than directly returning feature components.

Fresh focused result without snapshot updates:

```text
npx playwright test tests/visual/task10.visual.pw.ts tests/visual/processing-settings.visual.pw.ts --reporter=line
19 passed
```

Paired regression coverage:

- Changed behavior: `real template route resets scroll and keeps its heading and save action in the 1200x800 viewport` and every settings route assert real navigation, `scrollY === 0`, and the requested theme.
- Nearest behavior preserved: `dashboard recording start remains button-driven through the real App` clicks the production recording action and verifies the active controls.
- Responsive pair: both dashboard and expanded settings assert real `documentElement.scrollWidth <= innerWidth` at 938×800 and 640×800; the desktop route captures retain their 1200×800 composition.

## Real Electron verification

`tests/e2e/app.spec.ts` now checks the built application's real `BrowserWindow` bounds and renderer outer dimensions are 1200×800. It navigates to settings through the App, verifies the settings heading is in the viewport at `scrollY = 0`, confirms the resolved root theme and a nontransparent body background, returns through the exact top navigation button, and continues the pre-existing fake-microphone recording smoke.

```text
npm run test:e2e
2 passed
```

The Electron rebuild changed the native module ABI. `npm rebuild better-sqlite3` restored the Node ABI, after which the full Vitest suite passed.

## Windows snapshot review

Every changed Windows PNG was opened at original resolution. Viewport baselines are 1200×800, the compact dashboard is 640×800, and the one intentionally long meeting document is 1200×1942. Provider snapshots use an actual viewport scroll to show the relevant provider section; no CSS width or fake viewport wrapper is used.

1. **Reported pixels:** dashboard light/dark/recording/error/recovery, template editing, settings light/dark, provider defaults/advanced, Whisper downloading/installed, Codex available/unavailable, and the complete meeting document.
2. **Rendering source:** the real `App`, `AppShell`, `Dashboard`, `MeetingDetail`, `TemplateEditor`, `AppearanceSettings`, `ApiKeySettings`, and `ProcessingProviderSettings`, rendered by `tokens.css`, `themes.css`, `globals.css`, and `app.css` through the visual harness.
3. **Verified visible change:** old isolated 1280×900/full-page Linear-era frames are replaced by real 1200×800 route viewports; headings and route actions are not clipped; dashboard light uses the white/coral hierarchy; dashboard/settings dark use the warm-charcoal theme; provider-state frames visibly contain their distinct state; 640px has no horizontal overflow.
4. **Regression tests:** the exact `real ... route` tests in `task10.visual.pw.ts` and `processing-settings.visual.pw.ts`, plus the actual Electron settings assertions in `app.spec.ts`.

The stale Windows `dashboard-idle.png` isolated baseline was removed and replaced by explicit `dashboard-idle-light.png` and `dashboard-idle-dark.png` real-App baselines.

## Truthful pixel concern preserved for separate scope

The settings-top baselines reveal an existing renderer defect: `globals.css` applies generic text-input width/min-height rules to radio inputs, while `app.css` has no `.theme-options input` override. The result is oversized centered radio circles with labels detached from their controls. Task 3 had already recorded Appearance fieldset/control styling as a later concern.

Task 8 intentionally preserves this actual-App output and does not mask or fix it. The controller reserved the production CSS fix for a separately scoped paired-regression task.

## Verification

- Focused visual, no snapshot update: 19/19 passed.
- Real built Electron E2E: 2/2 passed.
- Full Vitest after Node ABI restoration: 55 files passed; 550 passed, 1 skipped.
- `npm run typecheck`: passed both TypeScript projects.
- `npm run lint`: passed with zero warnings.
- `npm run build`: passed.
- `git diff --check`: passed.
- Scope review: no `src/**` changes and no Darwin snapshot changes.

## Platform note

Darwin snapshots cannot be truthfully regenerated or reviewed on Windows. No Darwin snapshot was fabricated, copied from Windows, deleted, or overwritten. A macOS runner must execute the same snapshot-update command and inspect the original pixels before committing Darwin baselines.

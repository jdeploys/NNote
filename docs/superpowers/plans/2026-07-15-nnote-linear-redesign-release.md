# Nnote Linear Redesign and 0.0.1 Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every Nnote Renderer screen with the installed Linear-inspired `DESIGN.md`, preserve paired Before/After screenshots, and publish verified Windows and macOS installers as GitHub prerelease `v0.0.1`.

**Architecture:** Keep Main, Preload, IPC contracts, domain behavior, and React state flows unchanged. Add semantic class names to existing Renderer components and centralize the visual system in `tokens.css` and `app.css`; use the existing deterministic visual harness for pixel coverage. Build release artifacts only on their target GitHub-hosted operating systems, verify unpacked runtime signals, then assemble one prerelease.

**Tech Stack:** Electron 43, React 19, TypeScript, CSS custom properties, Vitest, Playwright, electron-builder, GitHub Actions, GitHub CLI.

## Global Constraints

- Canvas `#010102`; primary `#5e6ad2`; surfaces `#0f1011`, `#141516`, `#18191a`.
- Use system sans; do not ship Linear proprietary fonts, logos, or product assets.
- Preserve all accessible names, keyboard flow, IPC contracts, storage behavior, and destructive confirmations.
- No light theme, new routing, data model, Main/Preload refactor, or feature expansion.
- Preserve the seven existing Before PNG files byte-for-byte.
- Generate seven After PNG files under `docs/screenshots/after-linear/` with the same fixtures and ordering.
- Release version is exactly `0.0.1`; tag is exactly `v0.0.1`.
- Release is unsigned and unnotarized; notes must state SmartScreen and Gatekeeper warnings.

---

### Task 1: Lock the visual contract and Before artifacts

**Files:**
- Create: `tests/unit/before-screenshots.test.ts`
- Modify: `tests/visual/feature-docs.pw.ts`
- Modify: `tests/visual/harness/src.tsx`

**Interfaces:**
- Consumes: existing visual harness `/?state=<state>`.
- Produces: immutable Before checksum test and explicit `captureSet=after-linear` output routing.

- [ ] **Step 1: Write the failing checksum test**

Create a Vitest table that hashes each Before image and expects these exact values:

```ts
const expected = {
  '01-dashboard.png': '4c5a6dd2db4dd112293eaaaae6cfe18692b3228f7387243fbf95a0f63fa6382d',
  '02-recording.png': 'f481e9751d2ab7898ff339013d0b7697d86e6e3084b7b1f685657642ba3f2593',
  '03-recovery.png': '1e3c38a81d9499a45b6f29b0f1b25cfdf372cbcf904bca4ede9f079352404ec6',
  '04-processing-failed.png': '5a678955bb78b0f1ee89c0c777d253b8f3f789b3989e80a2cda9244bceca03c0',
  '05-meeting-detail.png': '2b7819b106e40819f4b984834dc28eef125e482f131139ad61d2f4aef256643f',
  '06-template-editor.png': '722949a234ae92e0c81f4a05e4373a1ffc53b98754ef37c5a18184f0a5fedc5d',
  '07-api-key-settings.png': 'c30d9ce7244019a22ac327da97747b578fa356b6576d0d9de3a10bf66bc78b22',
}
```

Use `createHash('sha256').update(readFileSync(path)).digest('hex')` for the assertion.

- [ ] **Step 2: Run the checksum test and verify it passes against the existing artifacts**

Run: `npx vitest run tests/unit/before-screenshots.test.ts`

Expected: 7/7 checksum cases PASS. This is characterization coverage, so an immediate pass is intentional.

- [ ] **Step 3: Change the screenshot spec to write only to the After directory**

Replace the documentation output helper with:

```ts
const output = (name: string) => resolve('docs', 'screenshots', 'after-linear', name)
test.beforeAll(async () => mkdir(resolve('docs', 'screenshots', 'after-linear'), { recursive: true }))
```

Add assertions for the primary action on each screen so a blank shell cannot count as a screenshot.

- [ ] **Step 4: Run the feature screenshot spec and confirm it fails before styling baselines are accepted**

Run: `npx playwright test tests/visual/feature-docs.pw.ts`

Expected: screenshots are created under `after-linear`; the later pixel assertions are not yet present.

- [ ] **Step 5: Commit the artifact lock**

```powershell
git add tests/unit/before-screenshots.test.ts tests/visual/feature-docs.pw.ts tests/visual/harness/src.tsx
git commit -m "🧪 test: lock redesign screenshot contract"
```

### Task 2: Implement the Linear-inspired foundation

**Files:**
- Modify: `src/renderer/src/styles/tokens.css`
- Modify: `src/renderer/src/styles/app.css`
- Test: `tests/unit/visual-platform-gate.test.ts`
- Test: `tests/visual/task10.visual.pw.ts`

**Interfaces:**
- Produces CSS variables `--canvas`, `--surface-1`, `--surface-2`, `--surface-3`, `--ink`, `--ink-muted`, `--ink-subtle`, `--primary`, `--primary-hover`, `--hairline`, `--hairline-strong`, `--danger`, `--warning`, and `--success`.

- [ ] **Step 1: Add a failing token contract test**

Read `tokens.css` and assert exact presence of the design values and absence of `Georgia`, `linear-gradient`, and the old green `#176c4f`.

```ts
expect(css).toContain('--canvas: #010102')
expect(css).toContain('--primary: #5e6ad2')
expect(css).not.toMatch(/Georgia|linear-gradient|#176c4f/i)
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run tests/unit/visual-platform-gate.test.ts`

Expected: FAIL because the old cream/green tokens remain.

- [ ] **Step 3: Replace tokens and global controls**

Define the exact foundation:

```css
:root {
  color-scheme: dark;
  --canvas: #010102;
  --surface-1: #0f1011;
  --surface-2: #141516;
  --surface-3: #18191a;
  --ink: #f7f8f8;
  --ink-muted: #d0d6e0;
  --ink-subtle: #8a8f98;
  --primary: #5e6ad2;
  --primary-hover: #828fff;
  --hairline: #23252a;
  --hairline-strong: #34343a;
  --danger: #e5484d;
  --warning: #f5a524;
  --success: #27a644;
  --radius-control: 8px;
  --radius-card: 12px;
  --radius-panel: 16px;
}
```

In `app.css`, style body, buttons, inputs, selects, textareas, `:focus-visible`, disabled controls, headings, `.visually-hidden`, and `prefers-reduced-motion`. Do not use shadows or gradients.

- [ ] **Step 4: Verify GREEN and refresh visual candidates**

Run: `npm run lint && npm run typecheck && npx vitest run tests/unit/visual-platform-gate.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the foundation**

```powershell
git add src/renderer/src/styles/tokens.css src/renderer/src/styles/app.css tests/unit/visual-platform-gate.test.ts
git commit -m "🎨 feat: add Linear-inspired visual foundation"
```

### Task 3: Redesign dashboard, recording, recovery, and processing states

**Files:**
- Modify: `src/renderer/src/features/meetings/Dashboard.tsx`
- Modify: `src/renderer/src/features/recording/RecordingPanel.tsx`
- Modify: `src/renderer/src/features/recording/RecoveryDialog.tsx`
- Modify: `src/renderer/src/features/meetings/ProcessingStatus.tsx`
- Modify: `src/renderer/src/styles/app.css`
- Test: `tests/unit/dashboard.test.tsx`
- Test: `tests/unit/recording-panel.test.tsx`
- Test: `tests/unit/recovery-dialog.test.tsx`
- Test: `tests/unit/processing-status.test.tsx`

**Interfaces:**
- Preserves all component props and visible action names.
- Adds semantic classes only: `app-nav`, `recording-panel`, `metric-grid`, `metric`, `button-primary`, `button-danger`, `recovery-overlay`, `recovery-panel`, `processing-panel`.

- [ ] **Step 1: Write paired failing assertions**

Assert the new semantic classes are present while existing actions remain reachable:

```ts
expect(screen.getByRole('button', { name: '녹음 시작' })).toHaveClass('button-primary')
expect(screen.getByRole('button', { name: '.nnote 가져오기' })).toBeEnabled()
expect(screen.getByRole('dialog', { name: '중단된 녹음 복구' })).toHaveClass('recovery-panel')
```

- [ ] **Step 2: Verify RED**

Run the four unit test files. Expected: new class assertions FAIL; existing behavior assertions PASS.

- [ ] **Step 3: Add semantic markup and focused CSS**

Use surface-1 panels, 24px padding, 12px radius, hairline borders, 40px controls, a compact meeting list, monospace telemetry, and lavender only for recording start/stop focus. Style recovery as a centered modal with overlay and processing as an inline status panel.

- [ ] **Step 4: Verify behavior and pixels**

Run the four unit test files and these screenshot cases: idle, active, failed, recoverable, narrow.

Expected: unit tests PASS and new visual candidate images are produced for manual inspection.

- [ ] **Step 5: Commit dashboard states**

```powershell
git add src/renderer/src/features/meetings/Dashboard.tsx src/renderer/src/features/recording/RecordingPanel.tsx src/renderer/src/features/recording/RecoveryDialog.tsx src/renderer/src/features/meetings/ProcessingStatus.tsx src/renderer/src/styles/app.css tests/unit
git commit -m "🎨 feat: redesign recording workspace states"
```

### Task 4: Redesign the meeting document

**Files:**
- Modify: `src/renderer/src/features/meetings/MeetingDetail.tsx`
- Modify: `src/renderer/src/features/meetings/SpeakerEditor.tsx`
- Modify: `src/renderer/src/features/meetings/Transcript.tsx`
- Modify: `src/renderer/src/styles/app.css`
- Test: `tests/unit/meeting-detail.test.tsx`

**Interfaces:**
- Preserves `MeetingDetail` props, audio URLs, speaker rename, processing, archive actions, and Markdown output.
- Adds `document-toolbar`, `document-panel`, `document-section`, `speaker-card`, `transcript-row`, and `markdown-code` classes.

- [ ] **Step 1: Write paired failing tests**

Assert `.nnote 내보내기`, `Markdown 내보내기`, speaker save, transcript timestamps, and new document classes all coexist.

- [ ] **Step 2: Verify RED**

Run: `npx vitest run tests/unit/meeting-detail.test.tsx`

Expected: class assertions FAIL; action reachability remains PASS.

- [ ] **Step 3: Implement compact document surfaces**

Limit the title to 40px, remove gradients/shadows, group status/export actions in the header, divide sections with hairlines, style speakers as compact cards, and use surface-2 monospace for Markdown.

- [ ] **Step 4: Verify GREEN and inspect the full-page screenshot**

Run the unit test and completed-document Playwright case. Open the original PNG and verify header, all summary sections, speaker controls, transcript, and Markdown are visible without horizontal clipping.

- [ ] **Step 5: Commit meeting detail**

```powershell
git add src/renderer/src/features/meetings src/renderer/src/styles/app.css tests/unit/meeting-detail.test.tsx
git commit -m "🎨 feat: redesign meeting document"
```

### Task 5: Redesign templates and API key settings

**Files:**
- Modify: `src/renderer/src/App.tsx`
- Modify: `src/renderer/src/features/templates/TemplateEditor.tsx`
- Modify: `src/renderer/src/features/settings/ApiKeySettings.tsx`
- Modify: `src/renderer/src/styles/app.css`
- Test: `tests/unit/template-editor.test.tsx`
- Test: `tests/unit/api-key-settings.test.tsx`
- Test: `tests/integration/template-editor-persistence.test.tsx`

**Interfaces:**
- Preserves `TemplatesApi` and `SettingsApi` exactly.
- Adds `settings-page`, `settings-panel`, `credential-status`, `danger-zone`, `template-layout`, `template-list`, `template-toolbar`, and `template-section-card` classes.

- [ ] **Step 1: Write paired failing tests**

```ts
expect(screen.getByRole('navigation', { name: '템플릿 목록' })).toHaveClass('template-list')
expect(screen.getByRole('button', { name: '섹션 저장' })).toBeEnabled()
expect(screen.getByRole('region', { name: 'API key settings' })).toHaveClass('settings-panel')
expect(screen.queryByText(/sk-/)).not.toBeInTheDocument()
```

- [ ] **Step 2: Verify RED**

Run the two unit tests and persistence integration test. Expected: class assertions FAIL; persistence and secret assertions PASS.

- [ ] **Step 3: Implement the editor and settings surfaces**

Use a two-column template list/editor above 900px and one column below it. Render each template section as a surface-2 card with labelled grid fields and compact reorder/remove actions. Split API key status, credential form, and deletion into distinct panels; never render a key value.

- [ ] **Step 4: Verify GREEN and pixels**

Run the three test files, then capture template and settings After screenshots. Inspect original pixels for alignment, wrapping, focus treatment, and absence of secrets.

- [ ] **Step 5: Commit template and settings screens**

```powershell
git add src/renderer/src/App.tsx src/renderer/src/features/templates/TemplateEditor.tsx src/renderer/src/features/settings/ApiKeySettings.tsx src/renderer/src/styles/app.css tests/unit tests/integration/template-editor-persistence.test.tsx
git commit -m "🎨 feat: redesign templates and settings"
```

### Task 6: Approve visual baselines and build the Before/After comparison

**Files:**
- Modify: `tests/visual/snapshots/win32/*.png`
- Create: `docs/screenshots/after-linear/*.png`
- Modify: `docs/screenshots/README.md`
- Modify: `README.md`
- Test: `tests/visual/task10.visual.pw.ts`
- Test: `tests/visual/feature-docs.pw.ts`

**Interfaces:**
- Produces 7 immutable Before images plus 7 reviewed After images.

- [ ] **Step 1: Generate Windows candidates**

Run: `npm run test:visual:update && npx playwright test tests/visual/feature-docs.pw.ts`

- [ ] **Step 2: Inspect every original PNG**

Open all six regression baselines and seven After documentation PNGs at original resolution. Check exact rendered pixels, source component, visible outcome, clipping, secret absence, and narrow layout.

- [ ] **Step 3: Write the paired comparison document**

For each feature, use a two-column Markdown table:

```md
| Before | After |
|---|---|
| ![Before](01-dashboard.png) | ![After](after-linear/01-dashboard.png) |
```

Do not rename, optimize, or rewrite the Before PNGs.

- [ ] **Step 4: Verify all visual and checksum gates**

Run: `npm run test:visual && npx vitest run tests/unit/before-screenshots.test.ts`

Expected: 13 visual tests PASS and 7 Before checksums PASS.

- [ ] **Step 5: Commit reviewed pixels**

```powershell
git add tests/visual docs/screenshots README.md
git commit -m "📸 docs: add Linear redesign comparisons"
```

### Task 7: Add the 0.0.1 cross-platform release pipeline

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `.github/workflows/release.yml`
- Create: `scripts/prepare-release-assets.mjs`
- Modify: `scripts/verify-package.mjs`
- Modify: `README.md`
- Modify: `docs/release/acceptance-matrix.md`
- Test: `tests/unit/package-config.test.ts`
- Test: `tests/unit/runtime-package-verification.test.ts`

**Interfaces:**
- Produces scripts `package:win:x64`, `package:mac:x64`, `package:mac:arm64`.
- Produces normalized release files and `SHA256SUMS.txt`.

- [ ] **Step 1: Write failing release contract tests**

Assert version `0.0.1`, the three package scripts, release workflow tag trigger `v0.0.1`, `contents: write`, target-OS jobs, runtime verification, artifact upload, and prerelease assembly.

- [ ] **Step 2: Verify RED**

Run the two unit test files. Expected: release contract assertions FAIL because version is `0.1.0` and workflow is absent.

- [ ] **Step 3: Implement version and package scripts**

Set package and lockfile version to `0.0.1`. Configure Windows x64 NSIS and separate macOS x64/arm64 DMG commands. Pass `CSC_IDENTITY_AUTO_DISCOVERY=false` while signing secrets are absent.

- [ ] **Step 4: Implement the release workflow**

Use `workflow_dispatch` for validation and a `v0.0.1` tag trigger for publication. Windows and macOS matrix jobs run checkout, Node setup, `npm ci`, lint/typecheck/tests, target package, runtime verification, artifact normalization, and upload. A final Ubuntu job downloads all artifacts, computes SHA-256 hashes, asserts all three filenames exist, then creates a prerelease with `gh release create --prerelease` only for the tag event.

- [ ] **Step 5: Verify GREEN locally**

Run contract tests, lint, typecheck, all tests, Windows package and runtime verification. Expected: all PASS and local Windows filename contains `0.0.1`.

- [ ] **Step 6: Commit the release pipeline**

```powershell
git add package.json package-lock.json .github/workflows/release.yml scripts README.md docs/release tests/unit
git commit -m "🚀 build: add 0.0.1 desktop release pipeline"
```

### Task 8: Final review, CI validation, and GitHub prerelease publication

**Files:**
- Review all files changed from the branch base.
- Update: `docs/release/acceptance-matrix.md` with actual signals only.

**Interfaces:**
- Produces public GitHub prerelease `v0.0.1` with exactly four assets.

- [ ] **Step 1: Run the complete local verification**

Run lint, typecheck, 312+ Vitest tests, visual tests, Electron E2E, Windows package/runtime verification, diff check, secret scan, and clean status check. Restore Node ABI after Electron packaging and rerun Vitest.

- [ ] **Step 2: Review scope leakage**

Confirm every modified production file is in `src/renderer`; release changes are restricted to package/workflow/scripts/docs; Main/Preload/IPC/domain files are unchanged.

- [ ] **Step 3: Push the branch and run workflow dispatch**

Push `codex/linear-redesign-0.0.1`, manually dispatch the release workflow without a tag, wait for Windows/macOS jobs, download artifacts, and inspect runtime signals and filenames. Do not publish a release in this step.

- [ ] **Step 4: Import macOS visual candidates if the first baseline gate intentionally fails**

Download both macOS screenshot artifacts, inspect original pixels, commit approved darwin baselines, push, and rerun CI until all required jobs pass.

- [ ] **Step 5: Merge the verified branch to main**

Merge only after independent full-branch review reports no Critical or Important issues and all required CI jobs pass.

- [ ] **Step 6: Create and push the release tag**

Create annotated tag `v0.0.1` on the verified main commit and push it. Wait for the tag release workflow to finish.

- [ ] **Step 7: Verify the actual public GitHub release**

Use `gh release view v0.0.1 --repo jdeploys/NNote --json isPrerelease,assets,url` and download all four assets. Recompute checksums, compare with `SHA256SUMS.txt`, verify Windows Authenticode and macOS signing status are reported as unsigned, and record the exact release URL.

- [ ] **Step 8: Final handoff**

Report the release URL, asset names, checksums, Windows and macOS runtime signals, test totals, screenshot comparison link, and explicit unsigned/unnotarized limitation.

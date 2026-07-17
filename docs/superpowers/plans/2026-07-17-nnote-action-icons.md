# Nnote Action Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a consistent, accessible line-icon language across Nnote without changing any existing feature behavior, then document the current path and blockers for Mac App Store publication.

**Architecture:** Add `lucide-react@1.25.0` behind a local semantic `Icon` adapter so feature components depend on Nnote icon names rather than library components. Extend shared `Button` and `StatusBadge` compositionally, then apply those primitives to navigation and feature actions. Keep Windows as the only pixel-regression platform and treat the Mac App Store work as documentation, not an unrequested packaging conversion.

**Tech Stack:** React 19, TypeScript 7, lucide-react 1.25.0, Vitest, Testing Library, Playwright, Electron 43, electron-vite.

## Global Constraints

- Preserve every existing action, label, workflow, and data contract.
- Keep text beside icons for primary, destructive, and unfamiliar actions.
- Icon-only controls must have an `aria-label` and native `title` tooltip.
- Decorative SVGs must use `aria-hidden="true"`, `focusable="false"`, and inherit the current text color.
- Do not change routing, persistence, recording, processing, archive, template, or settings behavior.
- Do not redesign layout density, typography, colors, or content hierarchy beyond icon alignment spacing.
- Windows is the visual-regression source of truth; macOS receives build verification only.
- Do not run or push GitHub Actions.

## File map

- Create `src/renderer/src/components/ui/Icon.tsx`: semantic icon-name adapter and SVG sizing contract.
- Modify `src/renderer/src/components/ui/Button.tsx`: optional leading icon composition.
- Modify `src/renderer/src/components/ui/StatusBadge.tsx`: optional status icon composition.
- Modify `src/renderer/src/components/layout/AppShell.tsx`: navigation and import icons.
- Modify `src/renderer/src/components/layout/PageHeader.tsx`: accessible back icon.
- Modify feature components under `src/renderer/src/features`: assign semantic icons to existing actions and statuses only.
- Modify `src/renderer/src/styles/globals.css` and `src/renderer/src/styles/app.css`: shared icon sizing/alignment and compact icon-button styles.
- Modify unit tests under `tests/unit`: paired icon and unchanged-behavior regression coverage.
- Modify `tests/visual/snapshots/win32`: reviewed Windows pixel baselines.
- Create `docs/screenshots/icon-refresh`: stable before/after PNGs for the dashboard, templates, settings, meeting detail, and active recording.
- Create `docs/mac-app-store-publishing.md`: official-source publication guide and Nnote-specific readiness gap analysis.

---

### Task 1: Shared icon adapter and button contracts

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/renderer/src/components/ui/Icon.tsx`
- Modify: `src/renderer/src/components/ui/Button.tsx`
- Modify: `src/renderer/src/components/ui/StatusBadge.tsx`
- Modify: `src/renderer/src/styles/globals.css`
- Test: `tests/unit/common-ui.test.tsx`

**Interfaces:**
- Produces: `IconName`, `Icon({ name, size?, className? })`, `ButtonProps.icon?: IconName`, and `StatusBadge({ icon?: IconName })`.
- Consumes: native `button` attributes and the existing `ButtonVariant` and badge tone contracts.

- [ ] **Step 1: Add failing shared-UI tests**

Add assertions equivalent to:

```tsx
render(<Button icon="save" onClick={onClick}>저장</Button>)
const save = screen.getByRole('button', { name: '저장' })
expect(save.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
expect(save.querySelector('svg')).toHaveAttribute('focusable', 'false')
fireEvent.click(save)
expect(onClick).toHaveBeenCalledOnce()

render(<Button>텍스트 버튼</Button>)
expect(screen.getByRole('button', { name: '텍스트 버튼' }).querySelector('svg')).toBeNull()
```

- [ ] **Step 2: Verify the tests fail for the missing icon API**

Run: `npm test -- tests/unit/common-ui.test.tsx --reporter=dot`

Expected: FAIL because `ButtonProps` has no `icon` property and no SVG is rendered.

- [ ] **Step 3: Install and pin the icon library**

Run: `npm install --save-exact lucide-react@1.25.0`

Expected: `package.json` and `package-lock.json` record exactly `1.25.0`.

- [ ] **Step 4: Implement the semantic icon adapter**

Create a typed registry in `Icon.tsx` covering these semantic names:

```ts
export type IconName =
  | 'library' | 'template' | 'settings' | 'import' | 'back'
  | 'microphone' | 'recording' | 'pause' | 'play' | 'stop'
  | 'save' | 'delete' | 'download' | 'export' | 'retry'
  | 'up' | 'down' | 'forward' | 'success' | 'warning' | 'error' | 'processing'
  | 'add' | 'edit' | 'key' | 'model' | 'terminal' | 'close'
```

Map each name to one `lucide-react` component and render it with `aria-hidden="true"`, `focusable="false"`, `strokeWidth={2}`, `size={size}`, and `className="ui-icon"`.

- [ ] **Step 5: Extend shared controls without changing native behavior**

`Button` destructures `icon`, renders `<Icon name={icon} />` before `props.children`, and forwards every remaining native attribute. `StatusBadge` renders the optional icon before its existing label.

- [ ] **Step 6: Add shared icon alignment styles**

Define `.ui-icon { width: 1em; height: 1em; flex: 0 0 auto; stroke: currentColor; }` and ensure `.ui-button` uses inline-flex alignment with an 8px gap. Do not change its 48px minimum height, variant colors, or focus ring.

- [ ] **Step 7: Verify shared tests and commit**

Run: `npm test -- tests/unit/common-ui.test.tsx --reporter=dot`

Expected: PASS, including both the icon-plus-text case and unchanged text-only case.

Commit: `✨ feat: add accessible action icon primitives`

---

### Task 2: Navigation, recording, and dashboard icons

**Files:**
- Modify: `src/renderer/src/components/layout/AppShell.tsx`
- Modify: `src/renderer/src/components/layout/PageHeader.tsx`
- Modify: `src/renderer/src/features/recording/RecordingPanel.tsx`
- Modify: `src/renderer/src/features/meetings/Dashboard.tsx`
- Modify: `src/renderer/src/styles/app.css`
- Test: `tests/unit/common-ui.test.tsx`
- Test: `tests/unit/recording-panel.test.tsx`
- Test: `tests/unit/dashboard.test.tsx`

**Interfaces:**
- Consumes: `IconName`, `Icon`, and `ButtonProps.icon` from Task 1.
- Produces: icon-enhanced primary navigation and recording controls with unchanged accessible names and click semantics.

- [ ] **Step 1: Add failing navigation and recording assertions**

Assert that the buttons named `전체 기록`, `요약 템플릿`, `설정`, `.nnote 가져오기`, `녹음 시작`, `일시정지`, `종료`, and `폐기` each contain `.ui-icon`, while the existing click/cancel/stop assertions remain unchanged.

- [ ] **Step 2: Verify failure before feature integration**

Run: `npm test -- tests/unit/common-ui.test.tsx tests/unit/recording-panel.test.tsx tests/unit/dashboard.test.tsx --reporter=dot`

Expected: FAIL only on the new SVG/icon assertions.

- [ ] **Step 3: Apply semantic icons**

Use `library`, `template`, `settings`, and `import` in `AppShell`; `back` in `PageHeader`; `microphone`, `pause`, `play`, `stop`, `delete`, `retry`, and `settings` in `RecordingPanel`; and `recording` plus `forward` in dashboard meeting rows where the existing status remains visible.

- [ ] **Step 4: Preserve accessibility for compact controls**

Keep the back button accessible name as `전체 기록` rather than including the glyph in the label. Directional or arrow-only SVGs are decorative and cannot receive focus.

- [ ] **Step 5: Add alignment styles without changing layout breakpoints**

Give navigation buttons and `.back-button` inline-flex alignment and an 8px gap. Keep the existing 48px desktop and 36px compact hit areas and the 743/744px breakpoint contract.

- [ ] **Step 6: Verify behavior and commit**

Run: `npm test -- tests/unit/common-ui.test.tsx tests/unit/recording-panel.test.tsx tests/unit/dashboard.test.tsx --reporter=dot`

Expected: PASS; pause, stop, discard confirmation, navigation, and import callbacks retain their previous call counts.

Commit: `✨ feat: add icons to navigation and recording`

---

### Task 3: Template, meeting, recovery, and settings action icons

**Files:**
- Modify: `src/renderer/src/App.tsx`
- Modify: `src/renderer/src/features/templates/TemplateEditor.tsx`
- Modify: `src/renderer/src/features/meetings/MeetingDetail.tsx`
- Modify: `src/renderer/src/features/meetings/ProcessingStatus.tsx`
- Modify: `src/renderer/src/features/meetings/SpeakerEditor.tsx`
- Modify: `src/renderer/src/features/recording/RecoveryDialog.tsx`
- Modify: `src/renderer/src/features/settings/ApiKeySettings.tsx`
- Modify: `src/renderer/src/features/settings/CodexCliStatus.tsx`
- Modify: `src/renderer/src/features/settings/WhisperModelSettings.tsx`
- Test: `tests/unit/template-editor.test.tsx`
- Test: `tests/unit/meeting-detail.test.tsx`
- Test: `tests/unit/processing-status.test.tsx`
- Test: `tests/unit/recovery-dialog.test.tsx`
- Test: `tests/unit/api-key-settings.test.tsx`
- Test: `tests/unit/processing-provider-settings.test.tsx`

**Interfaces:**
- Consumes: shared icon primitives from Task 1.
- Produces: consistent semantic icon mapping across every existing feature action.

- [ ] **Step 1: Add paired feature regressions**

Add icon-presence assertions for template save/delete/add/reorder, meeting export, speaker save, processing retry, recovery export/recover/delete, API-key save/delete, Codex retry, and Whisper download/delete. Retain or add adjacent assertions proving each callback payload and disabled/pending guard is unchanged.

- [ ] **Step 2: Verify the new assertions fail**

Run: `npm test -- tests/unit/template-editor.test.tsx tests/unit/meeting-detail.test.tsx tests/unit/processing-status.test.tsx tests/unit/recovery-dialog.test.tsx tests/unit/api-key-settings.test.tsx tests/unit/processing-provider-settings.test.tsx --reporter=dot`

Expected: FAIL only where the requested action lacks `.ui-icon`.

- [ ] **Step 3: Apply icons through the shared API**

Use `save`, `delete`, `add`, `up`, `down`, `download`, `export`, `retry`, `key`, `terminal`, and `model` according to the approved semantic mapping. Keep visible Korean labels on all destructive, provider, credential, and recovery actions.

- [ ] **Step 4: Convert template direction actions to icon-forward controls**

Render the up/down icon with a visually hidden `위로`/`아래로` label, `aria-label`, and matching `title`. Pending text `정렬 중…` remains visible while the operation is active.

- [ ] **Step 5: Verify feature behavior and commit**

Run the same focused command from Step 2.

Expected: PASS with existing callback arguments, pending guards, archive formats, and explicit destructive confirmations unchanged.

Commit: `✨ feat: add semantic icons across feature actions`

---

### Task 4: Pixel verification and stable before/after evidence

**Files:**
- Modify: `tests/visual/snapshots/win32/*.png`
- Create: `docs/screenshots/icon-refresh/before/*.png`
- Create: `docs/screenshots/icon-refresh/after/*.png`
- Modify: `tests/visual/task10.visual.pw.ts`
- Modify: `tests/visual/processing-settings.visual.pw.ts`

**Interfaces:**
- Consumes: the rendered UI from Tasks 1–3.
- Produces: reviewed Windows baselines and stable comparison artifacts.

- [ ] **Step 1: Preserve selected pre-change baselines**

Copy the tracked dashboard idle, active recording, settings, templates, and meeting detail PNGs into `docs/screenshots/icon-refresh/before` without resizing or recompressing them.

- [ ] **Step 2: Add visible-outcome assertions**

Before each screenshot assertion, verify at least one named action contains a paintable `.ui-icon` with a bounding box between 16px and 20px and that `document.documentElement.scrollWidth <= innerWidth` remains true.

- [ ] **Step 3: Run the Windows visual suite and inspect failure diffs**

Run: `npm run test:visual`

Expected: FAIL because approved icons change tracked pixels, not because of missing elements or overflow.

- [ ] **Step 4: Update Windows snapshots**

Run: `npm run test:visual:update`

Expected: PASS and only `tests/visual/snapshots/win32` changes; no Darwin baselines are created.

- [ ] **Step 5: Inspect actual pixels and preserve after evidence**

Open the dashboard, active recording, settings, templates, and meeting-detail PNGs at original resolution. Confirm icons render from Lucide SVG through `Icon.tsx`, remain aligned with their labels, preserve contrast, and do not clip. Copy those five reviewed files into `docs/screenshots/icon-refresh/after`.

- [ ] **Step 6: Run behavior and build verification**

Run:

```text
npm run lint
npm run typecheck
npm test -- --reporter=dot
npm run test:e2e
npm run build
git diff --check
```

Expected: every command exits 0; Vitest reports no failures; Playwright reports no failures; production build completes.

- [ ] **Step 7: Review scoped diff and commit**

Confirm every changed renderer file only adds icon composition or alignment, and every pre-existing callback and visible label remains present.

Commit: `📸 test: verify icon-enhanced interface pixels`

---

### Task 5: Mac App Store publication guide

**Files:**
- Create: `docs/mac-app-store-publishing.md`

**Interfaces:**
- Consumes: current `package.json`, `build/entitlements.mac.plist`, `scripts/after-pack.mjs`, `scripts/after-sign.mjs`, and `.github/workflows/release.yml`.
- Produces: a Korean operator guide with current official-source links and an Nnote-specific readiness checklist.

- [ ] **Step 1: Document the two distribution tracks clearly**

State that the current DMG uses Developer ID/notarization for distribution outside the store, while Mac App Store delivery requires the Electron `mas` build, App Sandbox, Apple Distribution/Mac App Distribution signing, a Mac App Store Connect provisioning profile, and App Store Connect upload.

- [ ] **Step 2: Record current Nnote blockers from repository evidence**

List these verified gaps:

```text
- package.json has mac targets only and no mas target.
- build/entitlements.mac.plist does not enable com.apple.security.app-sandbox.
- embedded whisper-cli and ffmpeg need sandbox-inherit signing and real MAS testing.
- Codex CLI discovery/execution outside the app container is unlikely to work unchanged under App Sandbox.
- .nnote import/export must use user-selected file access and security-scoped URLs where persistence is required.
- downloaded Whisper models must remain data, not downloaded executable code, and require App Review notes.
```

- [ ] **Step 3: Add exact account, signing, build, upload, and review steps**

Use and link only current primary documentation:

- Apple App Sandbox: `https://developer.apple.com/documentation/security/protecting-user-data-with-app-sandbox`
- Apple sandbox configuration and microphone/network/file access: `https://developer.apple.com/documentation/xcode/configuring-the-macos-app-sandbox`
- Apple App Store provisioning profile: `https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile/`
- Apple certificate types: `https://developer.apple.com/help/account/certificates/certificates-overview`
- Apple upload methods: `https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/`
- Apple review guidelines: `https://developer.apple.com/app-store/review/guidelines/`
- Electron MAS submission guide: `https://www.electronjs.org/docs/latest/tutorial/mac-app-store-submission-guide/`

- [ ] **Step 4: Add an operator checklist and decision gate**

End with separate checklists for Apple Developer enrollment, bundle ID/App ID, certificates/profile, MAS-specific entitlements, local registered-Mac test signing, archive/upload, metadata/privacy/screenshots, TestFlight, and App Review notes. Mark the current build `not MAS-ready` until the sandbox and embedded-helper spike passes on real macOS hardware.

- [ ] **Step 5: Verify documentation and commit**

Run:

```text
rg -n "TBD|TODO|placeholder" docs/mac-app-store-publishing.md
git diff --check
```

Expected: the placeholder scan returns no matches and `git diff --check` exits 0.

Commit: `📝 docs: add Mac App Store publishing guide`

---

### Task 6: Final verification and scope audit

**Files:**
- Review only: every file changed by Tasks 1–5.

**Interfaces:**
- Consumes: all implementation and documentation deliverables.
- Produces: a clean, locally verified branch without remote workflow execution.

- [ ] **Step 1: Run fresh final verification**

Run `npm run lint`, `npm run typecheck`, `npm test -- --reporter=dot`, `npm run test:e2e`, `npm run test:visual`, and `npm run build`.

Expected: all commands exit 0.

- [ ] **Step 2: Audit the exact requested scope**

Use `git diff --stat 0fb10f2..HEAD` and `git diff --check 0fb10f2..HEAD`. Confirm no server, authentication, recording semantics, processing adapters, persistence schema, macOS CI expansion, or release upload was added.

- [ ] **Step 3: Report visible UI evidence**

Report:

```text
Reported pixels: text-only action and navigation controls.
Rendering source: Icon.tsx through Button, StatusBadge, AppShell, PageHeader, and feature action composition.
Verified visible change: reviewed Windows before/after screenshots show aligned semantic icons without clipping or overflow.
Regression test: shared UI, feature behavior, E2E, and Windows visual suites.
```

- [ ] **Step 4: Stop before remote mutation**

Do not push, merge, create a PR, publish a release, or run GitHub Actions without a new explicit user instruction.

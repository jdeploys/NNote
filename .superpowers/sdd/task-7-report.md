# Task 7 report — settings help and provider status

## Scope lock

- Reorganized only API key, processing-provider, Whisper, and Codex CLI settings hierarchy, their shared settings CSS, and the two named unit suites.
- Preserved recording, templates, detail, routing, IPC, provider registry, Whisper manager, and Codex command-resolution behavior.
- Preserved the user-authored Codex behavior: cloud-not-local labeling, all four actionable mappings, raw availability message/path redaction, refresh/provider independence, failure-only troubleshooting, and the statement that Nnote does not change global Codex settings or login.

## Implementation

- Replaced feature-local help/status wrappers with the common `FieldHelp`, `PrivacyNotice`, `StatusIndicator`, and `TroubleshootingDisclosure` components.
- Codex now renders the exact hierarchy `FieldHelp → PrivacyNotice → StatusIndicator → TroubleshootingDisclosure`; the disclosure and refresh action are absent when available.
- Whisper uses the common local privacy notice and status indicator while retaining model download/delete behavior.
- API key settings now render a labelled `SurfaceCard` credential region and a separate, spaced danger region with common `ActionBar` and `Button` variants.
- No code reads or renders `descriptor.availability.message`.

## TDD evidence

### Baseline

`npm test -- tests/unit/processing-provider-settings.test.tsx tests/unit/api-key-settings.test.tsx`

- PASS: 2 files, 24/24 tests.
- This confirmed the protected cloud copy, four error mappings, refresh behavior, available-state help absence, secret handling, and path redaction before production edits.

### RED

After adding the visible hierarchy assertions and before changing production code, the same command produced:

- 3 expected failures and 24 passes.
- `separates the credential card from the API key danger zone`: missing labelled credential region.
- `shows local-only audio privacy and missing speaker separation`: missing common local `role="note"` and status primitive.
- `shows concise field help, a cloud privacy notice and failure-only troubleshooting in that order`: missing common cloud `role="note"` and required order.
- The paired refresh-independence regression already passed, confirming the protected behavior stayed intact during RED.

### GREEN

After the minimum common-component recomposition:

- Focused settings command: 2 files, 27/27 tests passed.
- Required provider command: 5 files, 74/74 tests passed.
- Full suite after restoring Node ABI 127: 55 files, 550 passed, 1 skipped.

## Visible UI verification

1. **Reported pixels:** API credential card followed by a separately spaced danger zone; the four-level Codex help hierarchy; local Whisper privacy/status; failure-only troubleshooting; compact stacking without horizontal overflow.
2. **Rendering source:** `ApiKeySettings.tsx`, `ProcessingProviderSettings.tsx`, `CodexCliStatus.tsx`, and `WhisperModelSettings.tsx`, composed from common `SurfaceCard`, `ActionBar`, `Button`, `FieldHelp`, `PrivacyNotice`, `StatusIndicator`, and `TroubleshootingDisclosure`; final spacing, responsive stacking, notice, and status pixels come from `src/renderer/src/styles/app.css` plus the common theme/global styles.
3. **Verified visible change:** The real built Electron App at outer 1200×800 (renderer 1184×735) rendered a 904×169.453125 credential card and a 904×90 danger zone separated by exactly 26px. The selected available Codex state rendered one cloud privacy note, the global-settings field help, no troubleshooting or refresh action, and no raw path. At outer 640×800 (renderer 624×735), document `scrollWidth` and `clientWidth` were both 609px, and both credential heading and danger zone used column layout. An ignored evidence harness loaded in the same Electron renderer exercised all four unavailable codes: all four had the exact help order, expected mapping text, a cloud note and refresh action, no raw path, and no overflow (`1169=1169` desktop, `609=609` compact). The actual App was the primary layout check; the harness only supplied deterministic failure states because the real machine's Codex CLI was available.
4. **Regression tests:** `separates the credential card from the API key danger zone`; `shows local-only audio privacy and missing speaker separation`; `shows concise field help, a cloud privacy notice and failure-only troubleshooting in that order`; `keeps provider refresh independent from saving provider choices`; the existing four-row `shows actionable Codex troubleshooting for %s`; and `keeps available Codex status free of troubleshooting instructions`.

Original-resolution evidence inspected:

- `.superpowers/sdd/task-7-settings-1200x800.png`
- `.superpowers/sdd/task-7-settings-640x800.png`
- `.superpowers/sdd/task-7-codex-failures-1200x800.png`
- `.superpowers/sdd/task-7-codex-failures-640x800.png`

## Verification

- `npm test -- tests/unit/api-key-settings.test.tsx tests/unit/processing-provider-settings.test.tsx tests/unit/provider-registry.test.ts tests/unit/whisper-model-manager.test.ts tests/unit/codex-command-resolver.test.ts` — PASS, 74/74.
- `npm test` — PASS, 55 files; 550 passed, 1 skipped.
- `npm run typecheck` — PASS.
- `npm run lint` — PASS.
- `npm run build` — PASS.
- `git diff --check` — PASS.

For Electron verification, `npm run rebuild:electron` rebuilt `better-sqlite3` for Electron 43.1.0. After screenshots, `npm rebuild better-sqlite3` restored Node ABI 127 before the full Vitest run.

## Concerns

- The real runtime reported Codex CLI available, so deterministic rendering of all four unavailable states used the ignored Electron evidence harness in addition to the real-App check and unit regressions. It did not modify or replace any runtime provider behavior.

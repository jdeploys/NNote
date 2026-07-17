# Task 9 Report: Airbnb documentation screenshots

## Status and locked scope

Implemented the documentation capture only. The change updates `feature-docs.pw.ts`, the immutable screenshot checksum test, the screenshot comparison README, and the new `docs/screenshots/after-airbnb` PNG set. It does not change production code, routes, APIs, IPC, existing Original Before/`after-linear` image bytes, Windows visual baselines, or Darwin snapshots.

The capture suite renders the real `App` and reaches completed meeting, templates, settings, recording, provider, Whisper, and Codex states through the production meeting row, navigation buttons, and recording-start action. All captures use a deterministic Windows 1200×800 viewport except the full meeting document at 1200×1942.

## TDD and root-cause evidence

The preservation checksum map was expanded first and passed before documentation image generation:

```text
npm test -- tests/unit/before-screenshots.test.ts
20 passed
```

After changing only the destination to `after-airbnb` and setting 1200×800, the pre-fix visual run reproduced the known failure set exactly: 31 visual tests passed and the 9 legacy feature-document route cases failed because completed/template/settings headings were absent on the dashboard. The route helper was then converted to the working Task 8 real-App navigation semantics.

Original-pixel review also produced two capture-composition RED/GREEN pairs:

- API settings: `API 키 삭제` initially had viewport ratio 0; the final capture shows the API label, save action, delete action, and provider summary.
- Codex unavailable: `고급 처리 옵션` initially crossed the sticky-header boundary; the final capture shows the full status, troubleshooting steps, and `다시 확인` action without overlap.
- Template editor: the editor initially ended at y=846.703125 and route text crossed the sticky header after the first scroll correction; deterministic `scrollTo(120)` keeps the complete editor at or above y=800 with no text overlap.

Focused final result:

```text
npx playwright test tests/visual/feature-docs.pw.ts --reporter=line
15 passed
```

## Preservation

`tests/unit/before-screenshots.test.ts` contains immutable SHA-256 maps for all 7 Original Before and all 13 `after-linear` PNGs. A fresh final run passed all 20 byte-for-byte cases. `git diff` contains no Original Before, `after-linear`, Windows baseline, or Darwin snapshot path.

## Airbnb image hashes and dimensions

| Image | SHA-256 | Bytes | Dimensions |
|---|---|---:|---:|
| `01-dashboard.png` | `0d45fe53a6766fe7b4aa51e32e8e0b631897f259857df42564070ec04072b5a4` | 23,388 | 1200×800 |
| `02-recording.png` | `3288dcd5e749251c92d9b310b69614e81bd7534e8e76ffa52fb012db46f41d57` | 33,610 | 1200×800 |
| `03-recovery.png` | `8cb3fdf0d2a1f6592a6aa19f93800ba2bc0637da9a7a859053ff750a3371cd3d` | 29,183 | 1200×800 |
| `04-processing-failed.png` | `70062d14df8799ac981a29a3ef3fdefa6dece271e1f1ef46f6b74ed689f42d12` | 28,571 | 1200×800 |
| `05-meeting-detail.png` | `3119957177412cb0dce2f961a4112d8d4f31d6cda26b2c5afeb221db0c8f6d9f` | 59,125 | 1200×1942 |
| `06-template-editor.png` | `5c9fe4d3ad73ae10e0578805492c4a64a92fa8dcbac0e2239f1c1ae073f6c1c3` | 34,084 | 1200×800 |
| `07-api-key-settings.png` | `8f433cb1bace651afb7c0456a869624a59eba509044c359f7e2d6fef0239e7f0` | 33,937 | 1200×800 |
| `08-processing-provider-defaults.png` | `2dd235c0c7f079ecdfae2fb7aef3da4dc6a3ce547b62a28403a8964586e89af6` | 34,524 | 1200×800 |
| `09-processing-provider-advanced.png` | `9cce135fd6ac4397736c56af2c4adcf506dca997ecb57e6994b5f7a6112d3387` | 35,790 | 1200×800 |
| `10-whisper-model-downloading.png` | `4799ebc54cf317198c7c8de5253c05a5a2c0f4c51d96e10cfa2f34752fe24075` | 35,170 | 1200×800 |
| `11-whisper-model-installed.png` | `75fe263c46303b2b13389a0e47889a216af8e70d3c699c6a063c2d204cfced7f` | 36,601 | 1200×800 |
| `12-codex-cli-available.png` | `6e2ce09a3ea1d8d8e24ac352b0d940fd85387e8842e11381631357faa9f6b7c8` | 40,419 | 1200×800 |
| `13-codex-cli-unavailable.png` | `1021557c9b426e7a0afef9408c11b4bb06f08ab0bf344e92c961cd63c5fe892f` | 41,051 | 1200×800 |
| `14-theme-light.png` | `f9bb61b337a05eb9b039a74a5dbf82746c32d32bb2acf2688257158422574105` | 31,220 | 1200×800 |
| `15-theme-dark.png` | `92bb14cadcddf161f23fe5a0dd4d94e41d83a613bda90bc12bbad9c0fca9a0f4` | 35,068 | 1200×800 |

Exactly 15 non-empty PNG files are present.

## Original-resolution inspection

Every PNG was opened at original resolution after the final full capture run.

1. `01-dashboard.png`: correct empty dashboard route; `새 회의`, template/audio labels, recording action, navigation, and empty recent-record state are visible and unclipped.
2. `02-recording.png`: correct active state after the real start action; timer, recording status, telemetry, pause/end/discard actions, and recent records are visible.
3. `03-recovery.png`: correct recoverable dashboard state; `중단된 고객 인터뷰` and its recoverable status remain visible beside the primary recording panel.
4. `04-processing-failed.png`: correct failed dashboard state; `주간 운영 회의` and failed status are visible without horizontal or viewport clipping.
5. `05-meeting-detail.png`: correct full-document route; meeting heading, audio/processing and export actions, summary, decisions, tasks, speakers, transcript, and Markdown disclosure are present through the 1942px document.
6. `06-template-editor.png`: correct template route after the real navigation and create action; editor heading, name/title/type/prompt labels, section actions, save CTA, and complete delete zone are inside the viewport.
7. `07-api-key-settings.png`: correct settings route and API section; status, label, credential input, disabled save state, delete explanation/action, and collapsed provider card are fully visible.
8. `08-processing-provider-defaults.png`: correct collapsed default provider state; API context and `OpenAI API · OpenAI API` summary are visible, with Task 8a compact radios retained at the top crop.
9. `09-processing-provider-advanced.png`: correct expanded provider state; transcription/summary labels and OpenAI privacy/capability notice are complete.
10. `10-whisper-model-downloading.png`: correct local Whisper state; provider/model labels, privacy notice, unavailable status, disabled download action, progress label/bar, 50%, and byte count are complete.
11. `11-whisper-model-installed.png`: correct installed state; provider/model labels, local privacy notice, available status, installed size, and delete action are complete.
12. `12-codex-cli-available.png`: correct available state; Codex selection, global-setting field help, cloud-processing notice, and available status are visible; no troubleshooting block is shown.
13. `13-codex-cli-unavailable.png`: correct unavailable state; error status, cloud notice, all three troubleshooting steps, and `다시 확인` action are fully visible with no sticky-header overlap.
14. `14-theme-light.png`: correct light setting and light canvas; all three compact inline radio labels, field help, heading, and API section context are visible.
15. `15-theme-dark.png`: correct warm-charcoal dark setting; all three compact inline radio labels, selected dark radio, field help, heading, and API section context are visible.

No image was accepted with blank content, stale/wrong route state, clipped primary action, hidden troubleshooting action, incorrect theme, or oversized Task 8 radio geometry.

## Verification

- Preservation test: 20/20 passed.
- Focused feature-document visual: 15/15 passed.
- Full Windows visual: 42/42 passed, resolving the 9 known failures without baseline updates.
- Full Vitest: 55 files passed; 563 passed, 1 skipped.
- `npm run typecheck`: passed.
- `npm run lint`: passed with zero warnings.
- `npm run build`: passed.
- Node ABI remained 127; direct `better-sqlite3` load printed `BETTER_SQLITE3_NODE_OK`.

Final `git diff --check` and the exact scope review are recorded immediately before commit.

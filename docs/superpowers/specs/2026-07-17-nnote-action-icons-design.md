# Nnote action icon enhancement design

## Goal

Make Nnote faster to scan and feel like a native desktop product by pairing familiar actions, navigation, and status text with a consistent icon language. Preserve every existing action, label, workflow, and data contract.

## Locked scope

- Add icons to primary navigation, import, back navigation, recording controls, save/delete/download/export/retry actions, template ordering controls, and meaningful statuses.
- Keep text beside icons for primary, destructive, and unfamiliar actions.
- Allow icon-forward controls only where the direction or action is universally recognizable, such as back, move up, and move down; these controls still keep accessible names and tooltips.
- Do not change routing, persistence, recording, processing, archive, template, or settings behavior.
- Do not redesign layout density, typography, colors, or content hierarchy beyond spacing needed to align an icon with its existing label.
- Windows remains the visual-regression source of truth. macOS receives build verification only.

## Component design

Create a small common UI icon layer under `src/renderer/src/components/ui` and keep icon selection outside feature logic.

- `Icon`: renders the approved line icon by semantic name, inherits the current text color, and is hidden from assistive technology when paired with visible text.
- `Button`: accepts an optional leading icon while retaining its existing variants, disabled behavior, and native button attributes.
- `StatusBadge`: accepts an optional status icon without changing its label or tone contract.
- Navigation and compact directional controls use `Icon` directly because they are not all instances of the shared `Button` component.

Icons use one rounded, 2px line style at shared sizes. No emoji, font icons, platform-dependent glyphs, or decorative icon backgrounds are introduced.

## Semantic mapping

- 전체 기록: library/list
- 요약 템플릿: document/template
- 설정: settings/sliders
- `.nnote 가져오기`: upload/import
- 뒤로가기: arrow left
- 녹음 시작 / 녹음 중: microphone / recording indicator
- 일시정지 / 재개 / 종료: pause / play / square
- 저장: save/check
- 삭제 / 폐기: trash
- 다운로드 / 내보내기: download / file export
- 재시도 / 다시 확인: refresh
- 위로 / 아래로: chevron up / chevron down
- 성공 / 경고 / 오류 / 처리 중: check circle / alert triangle / alert circle / loader

## Accessibility and interaction

- Visible labels remain the accessible name for icon-plus-text buttons.
- Icon-only controls receive `aria-label` and a native `title` tooltip.
- Decorative SVGs use `aria-hidden="true"` and cannot receive focus.
- Pending and disabled states continue to be controlled by the existing feature component; icons never create a second action path.
- Button hit areas and keyboard focus styles remain unchanged.

## Verification

- Add a regression test proving shared buttons render a non-focusable decorative icon while preserving the existing label and click behavior.
- Add a paired regression test proving a text-only button still renders and behaves exactly as before.
- Add component tests for icon-only directional controls retaining accessible names.
- Run lint, typecheck, the full Vitest suite, Windows E2E, and the production build.
- Update Windows visual baselines and inspect the actual dashboard, settings, template, meeting-detail, and recording-state pixels. Keep before and after screenshots available for comparison.

## Follow-up documentation

After the icon implementation is verified, add a separate Markdown guide for publishing Nnote through the Mac App Store. Base requirements, signing, sandboxing, entitlements, App Store Connect setup, privacy, review, and Electron-specific packaging notes on current official Apple and Electron documentation.

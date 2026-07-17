# Nnote Airbnb-inspired UI redesign

## Goal

Nnote의 기존 기능과 데이터 흐름은 유지하면서 모든 Renderer 화면을 Airbnb `DESIGN.md`의 밝고 친근한 정보 위계로 전면 개편한다. 기본 테마는 운영체제 설정을 따르는 라이트 테마이며 사용자가 라이트·다크를 직접 선택할 수도 있다. 다크 테마는 순수 검정 대신 따뜻한 차콜 색조를 사용한다.

이번 개편의 핵심은 단순한 색상 교체가 아니라 페이지별 우선순위, 공통 UI 구조, 설정 도움말, 실제 Electron 창에서의 반응형 동작을 함께 정돈하는 것이다.

## Locked scope

변경 대상은 Renderer의 시각 체계와 화면 정보 위계다.

- 앱 상단 내비게이션과 페이지 전환 시 스크롤·포커스 처리
- 대시보드와 새 회의 시작 영역
- 녹음 진행 상태와 녹음 제어
- 복구 가능 회의와 오류·재시도 상태
- 완료된 회의 상세, 요약, 화자, 전사, 내보내기
- 요약 템플릿 목록과 편집기
- API 키, 처리 공급자, Whisper, Codex CLI, 테마 설정
- 설정별 짧은 안내, 개인정보 안내, 조건부 문제 해결 도움말
- 데스크톱 기본 창, 중간 폭, 최소 폭 640px의 반응형 배치
- 기능별 개편 후 문서용 스크린샷과 실제 Electron 시각 회귀 검증

변경하지 않는 인접 영역은 다음과 같다.

- Electron Main, Preload, IPC 계약
- SQLite 스키마와 저장 위치
- 녹음, 복구, 처리, 가져오기·내보내기의 기능 의미
- OpenAI, Whisper, Codex 어댑터의 선택·실행 로직
- 템플릿 데이터 모델과 요약 프롬프트 의미
- 사용자 인증 방식이나 새 서버 기능
- Windows와 macOS의 현재 기능 범위

화면을 정리하면서 제품 흐름이나 처리 의미를 추측해 바꾸지 않는다. 특히 적용, 취소, 이동, 재시도의 기존 동작은 시각적 위치가 바뀌더라도 그대로 보존한다.

## Source and constraints

프로젝트 루트의 기존 Linear 기반 `DESIGN.md`를 [Airbnb DESIGN.md](https://getdesign.md/design-md/airbnb/DESIGN.md) 기준으로 교체해 디자인 원칙의 로컬 원본으로 사용한다.

- Airbnb Cereal, Circular 같은 독점 폰트는 사용하지 않는다.
- Airbnb 로고, 사진, 아이콘 같은 브랜드 자산을 복제하지 않는다.
- 공개 원칙과 토큰을 Nnote 데스크톱 도구의 목적에 맞게 적용한다.
- 폰트는 앱에 포함한 오픈소스 Inter Variable을 기본으로 하고 시스템 sans-serif를 fallback으로 둔다.

## Considered approaches

### Token-only reskin

현재 구조를 유지하고 색상과 radius만 바꾸는 방법이다. 구현량은 작지만 템플릿 화면의 압축된 가로 배치, 설정 도움말의 위계, 실제 창 너비에서의 문제를 해결하지 못한다.

### Page hierarchy first — selected

화면별 핵심 행동을 먼저 정하고 공통 UI 구성요소로 다시 조립한다. 도메인과 IPC 로직은 유지하되 페이지 구조와 CSS를 함께 정리한다. 변경량은 더 크지만 사용자가 선택한 방향이며 유지보수 가능한 공통 UI 계층을 만들 수 있다.

### New navigation and workflow

사이드바나 새 라우팅을 도입해 전체 사용 흐름까지 바꾸는 방법이다. 기능 의미와 포커스 복원까지 새로 정해야 하므로 이번 범위에서는 제외한다.

## Visual foundation

### Light theme

- Canvas: `#ffffff`
- Primary ink: `#222222`
- Body ink: `#3f3f3f`
- Muted ink: `#6a6a6a`
- Subtle surface: `#f7f7f7`
- Secondary surface: `#f2f2f2`
- Border: `#dddddd`
- Subtle border: `#ebebeb`
- Primary coral: `#ff385c`
- Primary active: `#e00b41`
- Primary disabled: `#ffd1da`

### Dark theme

다크 테마는 같은 의미 토큰을 따뜻한 차콜 팔레트로 재정의한다. 배경은 순수 검정이 아니라 갈색 기가 아주 약하게 섞인 차콜, 표면은 한 단계 밝은 차콜, 본문은 따뜻한 흰색을 사용한다. 주요 동작에는 라이트 테마와 연결되는 coral을 사용하되 넓은 장식 면으로 사용하지 않는다.

### Typography, shape, spacing

- 한 개의 Inter Variable 계열만 사용한다.
- 페이지 제목은 28px 이하, 섹션 제목은 20–24px, 본문은 14–16px를 기본으로 한다.
- 본문 weight는 400–500, 제목과 핵심 행동은 600으로 제한한다.
- spacing scale은 2, 4, 8, 12, 16, 24, 32, 48, 64px을 사용한다.
- 입력과 버튼 radius는 8px, 카드 14px, 강조 panel 20px, badge와 chip은 pill을 사용한다.
- 기본 버튼 높이는 48px, 텍스트 입력은 56px을 목표로 하되 밀도 높은 보조 도구는 40px까지 허용한다.
- 그림자는 한 단계만 사용하고 대부분은 surface와 1px border로 구분한다.

### Theme behavior

테마 값은 `system`, `light`, `dark` 세 가지다. 기본값은 `system`이며 `matchMedia('(prefers-color-scheme: dark)')`를 실시간으로 반영한다. 사용자가 설정에서 명시적으로 선택하면 해당 값을 로컬 환경에 저장한다. 순수 화면 선호이므로 새 IPC나 데이터베이스 필드는 추가하지 않는다.

## App shell and responsive behavior

상단 내비게이션은 약 72px 높이의 밝은 bar로 구성한다. 왼쪽에 Nnote 브랜드, 오른쪽에 전체 기록·요약 템플릿·설정을 둔다. 현재 위치는 색과 shape, 텍스트를 함께 사용해 표시한다.

페이지 이동 시 새 화면의 최상단이 보이도록 scroll을 초기화한다. 접근성을 위한 heading focus는 유지하되 `preventScroll`을 사용해 포커스가 화면을 아래로 밀어내지 않게 한다.

- Desktop: 1128px 이상, 넓은 page container와 필요한 경우 2열
- Tablet/medium: 744–1127px, padding과 column 비율 축소
- Compact: 744px 미만, 단일 열과 순차적 정보 위계
- Electron 최소 창 너비 640px에서 수평 스크롤 없이 사용 가능해야 한다.
- 문서용 전체 페이지 캡처와 별개로 실제 1200×800 viewport에서 주요 행동이 접힌 영역 밖으로 밀리지 않아야 한다.

## Page hierarchy

### Dashboard

`새 회의 시작`을 첫 번째이자 가장 강한 행동으로 둔다. 요약 템플릿과 원본 오디오 처리 옵션은 그 바로 아래의 보조 설정으로 묶는다. 최근 기록은 두 번째 섹션에 두고 가져오기는 내비게이션 또는 보조 행동으로 낮춘다.

### Recording

경과 시간과 현재 녹음 상태를 가장 먼저 보인다. 저장 크기·파트 등 telemetry는 보조 metric으로 정리한다. 일시정지는 secondary, 종료는 primary, 폐기는 분리된 danger action으로 표시한다.

### Recovery and errors

복구와 오류는 가능하면 현재 작업 맥락 안의 `InlineNotice` 또는 action card로 표시한다. 사용자가 선택해야 하는 파괴적·상충 행동만 dialog를 사용한다. 오류 원문보다 다음 행동을 먼저 보여주되 진단 의미는 누락하지 않는다.

### Meeting detail

제목과 처리 상태를 첫 영역에 두고 오디오·처리·재시도 같은 현재 행동을 가까이 배치한다. 그 다음 요약, 결정, 할 일, 논의, 화자, 전사 순으로 읽는 흐름을 만든다. 내보내기와 원문 Markdown은 secondary action으로 낮춘다.

### Template editor

Desktop에서는 목록과 편집기의 master-detail 구조를 사용한다. 템플릿 이름, 섹션 제목, 출력 종류, 지시문을 세로로 읽히는 section card에 둔다. 저장 행동을 하나의 명확한 CTA로 통합하고 삭제는 별도 danger zone으로 분리한다. Compact 화면에서는 목록 선택 후 편집 화면으로 진입하는 단일 열 흐름을 사용한다.

### Settings

설정은 다음 순서로 묶는다.

1. 화면 및 테마
2. OpenAI API 키
3. 기본 처리 공급자
4. Whisper 로컬 처리
5. Codex CLI 고급 처리
6. 데이터 삭제 등 danger zone

사용자가 이미 추가한 Codex CLI 상태 문구, 클라우드 처리 표시, 문제 해결 절차, 다시 확인 기능과 관련 회귀 테스트는 보존한다.

## Settings help hierarchy

도움말을 긴 설명 덩어리로 나열하지 않고 네 단계로 정리한다.

1. `FieldHelp`: 설정 바로 아래에서 무엇을 바꾸는지 한 문장으로 설명한다.
2. `InlineNotice`: 데이터 전송, 개인정보, 비용 또는 중요한 제약을 맥락 가까이에 표시한다.
3. `StatusIndicator`: 설치, 인증, 모델 상태처럼 현재 결과를 짧게 보여준다.
4. `TroubleshootingDisclosure`: 실패했을 때만 구체적인 해결 절차와 다시 확인 행동을 펼쳐 보인다.

정상 상태에서는 문제 해결 지침을 숨긴다. 오류 상태에서는 실행 가능한 다음 단계가 먼저 보이게 한다. 내부 로컬 경로나 원시 진단 로그는 기본 화면에 노출하지 않는다. Codex CLI가 로컬 추론이 아니라 Codex 계정을 통한 클라우드 처리라는 안내와 Nnote가 전역 Codex 설정·로그인을 변경하지 않는다는 안내는 유지한다.

## Common UI architecture

공통 UI는 도메인 기능과 분리하고 역할에 따라 배치한다.

```text
src/renderer/src/
├─ components/
│  ├─ ui/          # Button, Input, Select, Badge, Card, Dialog
│  ├─ layout/      # AppShell, TopNavigation, PageHeader, ActionBar
│  ├─ feedback/    # InlineNotice, EmptyState, StatusIndicator
│  └─ help/        # FieldHelp, PrivacyNotice, TroubleshootingDisclosure
├─ features/       # 회의·템플릿·설정 등 도메인 화면과 로직
├─ hooks/          # 테마와 공통 화면 동작
└─ styles/
   ├─ tokens.css
   ├─ themes.css
   └─ globals.css
```

컴포넌트는 의미 있는 variant를 prop으로 받으며 페이지별 CSS selector나 거대한 조건문으로 상태를 조합하지 않는다. 공급자별 동작은 기존 adapter 경계를 유지한다. 공통 UI는 도메인 상태를 해석하지 않고 전달받은 label, status, action만 렌더링한다.

한 화면 또는 card에는 하나의 primary CTA만 둔다. secondary는 outline 또는 neutral surface, tertiary는 text action, destructive는 danger treatment와 충분한 간격을 사용한다. 모든 컨트롤에는 hover, active, focus-visible, disabled 상태가 있어야 한다.

## Accessibility and interaction

- 기존 접근 가능한 이름, label, role, keyboard flow를 유지한다.
- 모든 상호작용 요소에 명확한 `:focus-visible`을 제공한다.
- 색상만으로 상태를 전달하지 않는다.
- 텍스트와 표면은 WCAG AA 대비를 목표로 검증한다.
- `prefers-reduced-motion`에서는 장식 transition을 제거한다.
- 저장 중, 모델 다운로드 중, 상태 다시 확인 중인 행동은 진행 상태와 disabled 상태를 명시한다.
- dialog의 포커스 진입·복원과 Escape/취소 의미를 유지한다.

## Screenshot preservation

기존 `docs/screenshots`와 `docs/screenshots/after-linear` 이미지는 Before 비교 자료로 보존하고 덮어쓰지 않는다. Airbnb 개편 결과는 별도 `docs/screenshots/after-airbnb`에 기능별로 저장한다.

최소 캡처 대상은 다음과 같다.

- dashboard
- recording
- recovery
- processing failed
- meeting detail
- template editor
- API key settings
- processing provider defaults and advanced
- Whisper model downloading and installed
- Codex CLI available and unavailable
- theme settings in light and dark

스크린샷에는 실제 API 키, authorization header, 사용자 로컬 경로가 포함되지 않아야 한다. 고정 fixture와 시간을 사용하고 각각의 원본 픽셀을 직접 확인한다.

## Testing and verification

### Paired regression coverage

각 시각 변경에는 바뀌어야 하는 결과와 가장 가까운 바뀌지 않아야 하는 기능을 짝으로 검증한다.

- route navigation starts at the visible page top; route heading still receives accessible focus.
- template editor uses the new vertical hierarchy; template create, reorder, save and delete semantics remain unchanged.
- settings help appears only for relevant states; provider selection and refresh behavior remain unchanged.
- Codex error troubleshooting is actionable; available Codex state does not show troubleshooting.
- dashboard prioritizes new meeting; recording start and recent-record navigation remain unchanged.
- meeting detail hierarchy changes; retry, speaker rename and export remain reachable.
- compact layout has no horizontal overflow; desktop keeps its intended multi-column composition.
- manual theme selection applies immediately; system theme still follows operating-system changes.

시각 결과를 이름으로 명시한 regression test를 추가한다. 예를 들어 `template editor keeps primary actions visible at 1200x800`과 `route navigation keeps page heading visible`처럼 사용자가 보는 결과를 테스트 이름에 포함한다.

### Verification matrix

- lint, TypeScript, unit and integration tests
- 기존 real Electron E2E
- 실제 Electron route navigation을 통한 visual fixture
- Windows 1200×800, 중간 폭, 640px 최소 폭
- light, warm-charcoal dark, system theme
- macOS에서 가능한 동일 viewport smoke verification
- `after-airbnb` 기능별 스크린샷 원본 확인
- 기존 Before 및 `after-linear` 이미지 checksum 보존
- 변경 파일 전체 diff 검토와 scope leakage 확인

합성 harness에서 component만 직접 렌더링한 결과로 완료를 주장하지 않는다. 실제 `App`과 Electron 창에서 내비게이션, CSS 로딩, viewport, scroll 위치가 함께 적용된 신호를 확인한다.

## Delivery order

1. Airbnb `DESIGN.md`, 디자인 토큰, Inter, 테마 기반
2. 공통 UI 디렉터리와 AppShell·상단 내비게이션
3. 대시보드, 녹음, 복구·오류
4. 회의 상세
5. 템플릿 목록·편집기
6. 설정과 기존 도움말 재구성
7. 반응형·접근성 보정
8. 회귀 테스트, 실제 Electron 검증, 기능별 스크린샷

각 단계는 기존 기능 테스트가 통과한 상태에서 다음 단계로 이동한다. 사용자 미커밋 설정 도움말은 구현 기준으로 받아들이되 임의로 삭제하거나 의미를 바꾸지 않는다.

## Success criteria

- 앱 첫 화면에서 새 회의 시작이 명확한 첫 행동으로 보인다.
- 모든 페이지가 같은 색, type, spacing, control hierarchy를 사용한다.
- 템플릿과 설정 화면이 데스크톱 기본 창에서 압축되거나 기본 HTML처럼 보이지 않는다.
- 설정 도움말은 필요한 위치와 상태에서만 나타나며 해결 행동이 명확하다.
- system/light/dark 테마가 재시작과 운영체제 테마 변경에서 일관되게 동작한다.
- 640px 이상에서 수평 스크롤이 없고 핵심 행동이 도달 가능하다.
- 실제 Electron 1200×800 화면의 상단이 잘리지 않는다.
- 기능별 개편 후 스크린샷을 기존 디자인과 비교할 수 있다.
- 기존 녹음·처리·템플릿·내보내기 기능과 사용자 추가 설정 테스트가 통과한다.

## Non-goals

- Airbnb 제품 화면의 픽셀 단위 복제
- Airbnb 로고, 독점 폰트, 사진 또는 브랜드 자산 사용
- 녹음·LLM 처리 기능이나 공급자 선택 방식 변경
- 새 서버, 로그인, 동기화 또는 결제 기능
- Main/Preload/IPC/데이터베이스 리팩터링
- 과도한 animation 또는 마케팅 랜딩 페이지 스타일
- 기존 사용자 설정 도움말 내용 삭제

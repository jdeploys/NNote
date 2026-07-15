# Nnote design comparison

동일한 Windows 1280×900 viewport와 고정 fixture로 캡처한 기능별 Before/After 비교입니다. 기존 Before 이미지는 checksum으로 고정되어 있으며 리디자인 과정에서 변경하지 않았습니다.

## 1. 대시보드와 새 회의

| Before | After |
|---|---|
| ![기존 대시보드](01-dashboard.png) | ![Linear-inspired 대시보드](after-linear/01-dashboard.png) |

## 2. 로컬 녹음

| Before | After |
|---|---|
| ![기존 녹음 화면](02-recording.png) | ![Linear-inspired 녹음 화면](after-linear/02-recording.png) |

## 3. 중단된 녹음 복구

| Before | After |
|---|---|
| ![기존 복구 상태](03-recovery.png) | ![Linear-inspired 복구 상태](after-linear/03-recovery.png) |

## 4. 처리 실패 상태

| Before | After |
|---|---|
| ![기존 처리 실패 상태](04-processing-failed.png) | ![Linear-inspired 처리 실패 상태](after-linear/04-processing-failed.png) |

## 5. 완성된 회의 문서

| Before | After |
|---|---|
| ![기존 회의 문서](05-meeting-detail.png) | ![Linear-inspired 회의 문서](after-linear/05-meeting-detail.png) |

## 6. 요약 템플릿 편집

| Before | After |
|---|---|
| ![기존 템플릿 편집기](06-template-editor.png) | ![Linear-inspired 템플릿 편집기](after-linear/06-template-editor.png) |

## 7. OpenAI API 키 설정

| Before | After |
|---|---|
| ![기존 API 키 설정](07-api-key-settings.png) | ![Linear-inspired API 키 설정](after-linear/07-api-key-settings.png) |

실제 API 키 값은 fixture와 이미지에 포함하지 않습니다.

## 8. 처리 방식 고급 옵션

기존 `07-api-key-settings.png`는 고급 처리 옵션 추가 직전 화면으로 그대로 보존합니다. 새 화면에서도 API 키 카드가 가장 먼저 보이고, 처리 방식은 두 번째 카드의 접힌 고급 옵션으로 배치됩니다.

| 고급 옵션 추가 전 | 기본 상태 | 펼친 상태 |
|---|---|---|
| ![고급 옵션 추가 전 API 키 설정](after-linear/07-api-key-settings.png) | ![OpenAI 기본 처리 방식](after-linear/08-processing-provider-defaults.png) | ![펼친 고급 처리 옵션](after-linear/09-processing-provider-advanced.png) |

### 기능별 상태

| 로컬 모델 다운로드 | 로컬 모델 설치됨 |
|---|---|
| ![Whisper 모델 다운로드 진행률](after-linear/10-whisper-model-downloading.png) | ![Whisper 모델 설치 완료](after-linear/11-whisper-model-installed.png) |

| Codex CLI 사용 가능 | Codex CLI 사용 불가 |
|---|---|
| ![Codex CLI 사용 가능](after-linear/12-codex-cli-available.png) | ![Codex CLI 설정 오류 안내](after-linear/13-codex-cli-unavailable.png) |

모든 fixture는 고정된 모델 크기와 진행률, 안전한 가용성 코드만 사용합니다. API 키, 로컬 경로, 전사문 및 원시 진단은 이미지에 포함하지 않습니다.

## 다시 생성하기

```powershell
npx playwright test tests/visual/feature-docs.pw.ts
```

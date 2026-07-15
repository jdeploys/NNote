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

## 다시 생성하기

```powershell
npx playwright test tests/visual/feature-docs.pw.ts
```

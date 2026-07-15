# Nnote feature screenshots

Windows 기준 1280×900 뷰포트에서 고정 fixture로 캡처한 현재 UI입니다. 회의 상세 화면은 전체 문서를 보여주기 위해 세로 길이가 더 깁니다.

## 1. 대시보드와 새 회의

로컬 녹음 옵션, 요약 템플릿, 오디오 보존 정책과 빈 기록 목록을 보여줍니다.

![대시보드와 새 회의](01-dashboard.png)

## 2. 로컬 녹음

녹음 시간·저장 크기·파트 상태와 일시정지, 종료, 폐기 동작을 보여줍니다.

![로컬 녹음](02-recording.png)

## 3. 중단된 녹음 복구

비정상 종료 뒤 복구할 수 있는 회의가 기록 목록에 표시된 상태입니다.

![중단된 녹음 복구](03-recovery.png)

## 4. 처리 실패 상태

전사 또는 요약 처리에 실패한 회의와 정상 완료 회의를 함께 보여줍니다.

![처리 실패 상태](04-processing-failed.png)

## 5. 완성된 회의 문서

멀티파트 오디오, 처리 상태, `.nnote`·Markdown 내보내기, 요약, 할 일, 화자 이름, 전체 전사문과 Markdown 미리보기를 보여줍니다.

![완성된 회의 문서](05-meeting-detail.png)

## 6. 요약 템플릿 편집

템플릿 선택, 이름 변경, 1–8개 섹션의 제목·종류·지시문·순서 편집을 보여줍니다.

![요약 템플릿 편집](06-template-editor.png)

## 7. OpenAI API 키 설정

OS 자격 증명 저장소에 보관되는 API 키의 설정 상태, 저장과 삭제 동작을 보여줍니다. 실제 키 값은 캡처에 포함하지 않습니다.

![OpenAI API 키 설정](07-api-key-settings.png)

## 다시 생성하기

```powershell
npx playwright test tests/visual/feature-docs.pw.ts
```

import { useState } from 'react'
import {
  RecordingTerminalError,
  type RecordingTerminalFailure,
} from './mediaRecorderController'

export interface RecordingPanelControls {
  start(): Promise<void>
  stop(): Promise<void>
  discard(): Promise<void>
}

interface RecordingPanelProps {
  controls: RecordingPanelControls
  onNavigate(destination: 'settings'): void
  settingsFocusKey?: string
}

type PanelPhase = 'idle' | 'recording' | 'stop_pending' | 'discard_pending'

export function RecordingPanel({ controls, onNavigate, settingsFocusKey }: RecordingPanelProps) {
  const [phase, setPhase] = useState<PanelPhase>('idle')
  const [terminalFailure, setTerminalFailure] = useState<RecordingTerminalFailure | null>(null)
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = async () => {
    setBusy(true)
    setError(null)
    try {
      await controls.start()
      setPhase('recording')
    } catch (cause) {
      if (cause instanceof RecordingTerminalError && cause.state === 'capture_failed') {
        setTerminalFailure('capture_failed')
        setPhase('stop_pending')
      }
      setError(cause instanceof Error ? cause.message : '녹음을 시작하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  const stop = async () => {
    setBusy(true)
    setError(null)
    try {
      await controls.stop()
      setPhase('idle')
      setTerminalFailure(null)
    } catch (cause) {
      const failure =
        cause instanceof RecordingTerminalError ? cause.state : ('stop_failed' as const)
      setTerminalFailure(failure)
      setPhase('stop_pending')
      setError(cause instanceof Error ? cause.message : '녹음 저장을 완료하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  const discard = async () => {
    setBusy(true)
    setError(null)
    setConfirmingDiscard(false)
    try {
      await controls.discard()
      setPhase('idle')
      setTerminalFailure(null)
    } catch (cause) {
      setTerminalFailure('discard_failed')
      setPhase('discard_pending')
      setError(cause instanceof Error ? cause.message : '녹음 폐기를 완료하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-label="회의 녹음">
      {phase === 'idle' && (
        <button disabled={busy} onClick={() => void start()}>
          녹음 시작
        </button>
      )}
      {phase === 'recording' && (
        <>
          <p aria-live="polite">녹음 중</p>
          <button disabled={busy} onClick={() => void stop()}>
            종료
          </button>
          <button disabled={busy} onClick={() => setConfirmingDiscard(true)}>
            폐기
          </button>
        </>
      )}
      {phase === 'stop_pending' && (
        <>
          <p aria-live="polite">녹음은 중지되었지만 저장 완료를 기다리고 있습니다.</p>
          {terminalFailure === 'capture_failed' ? (
            <button disabled={busy} onClick={() => setConfirmingDiscard(true)}>
              폐기
            </button>
          ) : (
            <button disabled={busy} onClick={() => void stop()}>
              종료 재시도
            </button>
          )}
        </>
      )}
      {phase === 'discard_pending' && (
        <>
          <p aria-live="polite">녹음은 중지되었지만 폐기를 완료하지 못했습니다.</p>
          <button disabled={busy} onClick={() => void discard()}>
            폐기 재시도
          </button>
        </>
      )}
      <button data-focus-key={settingsFocusKey} disabled={busy} onClick={() => onNavigate('settings')}>
        설정으로 이동
      </button>
      {error !== null && <p role="alert">{error}</p>}
      {confirmingDiscard && (
        <div role="dialog" aria-modal="true" aria-label="녹음 폐기">
          <p>현재 녹음과 저장된 청크를 모두 폐기할까요?</p>
          <button onClick={() => setConfirmingDiscard(false)}>취소</button>
          <button disabled={busy} onClick={() => void discard()}>
            녹음 폐기 확인
          </button>
        </div>
      )}
    </section>
  )
}

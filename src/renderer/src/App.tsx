import { useEffect, useState } from 'react'
import type { RecoveryItem } from '../../shared/contracts/recovery'
import { RecoveryDialog } from './features/recording/RecoveryDialog'

export function App() {
  const [recoveries, setRecoveries] = useState<RecoveryItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let current = true
    void window.desktopApi.recovery.scan().then(
      (items) => { if (current) setRecoveries(items) },
      (cause) => {
        if (current) {
          setError(cause instanceof Error ? cause.message : '중단된 녹음을 확인하지 못했습니다.')
        }
      },
    )
    return () => { current = false }
  }, [])

  if (error !== null) {
    return <main role="alert">복구 확인에 실패했습니다. 새 녹음을 시작하지 않았습니다: {error}</main>
  }
  if (recoveries === null) return <main aria-busy="true">복구 확인 중</main>

  if (recoveries.length > 0) {
    return (
      <RecoveryDialog
        items={recoveries}
        recovery={window.desktopApi.recovery}
        onResolved={(meetingId) => setRecoveries((items) => items?.filter((item) => item.meetingId !== meetingId) ?? [])}
      />
    )
  }

  return <main>Nnote</main>
}

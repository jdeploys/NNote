import type { ReactNode } from 'react'

export function StatusIndicator({
  available,
  children,
}: {
  available: boolean
  children: ReactNode
}) {
  return (
    <div className="status-indicator" data-available={available}>
      <span aria-hidden="true" />
      {children}
    </div>
  )
}

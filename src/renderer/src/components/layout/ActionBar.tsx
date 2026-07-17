import type { ReactNode } from 'react'

export function ActionBar({ children, danger }: { children: ReactNode; danger?: ReactNode }) {
  return (
    <div className="action-bar">
      <div>{children}</div>
      {danger === undefined ? null : <div className="action-bar-danger">{danger}</div>}
    </div>
  )
}

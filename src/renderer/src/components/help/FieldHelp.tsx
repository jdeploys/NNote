import type { ReactNode } from 'react'

export function FieldHelp({ children }: { children: ReactNode }) {
  return <p className="field-help">{children}</p>
}

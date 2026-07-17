import type { ReactNode } from 'react'
import { InlineNotice } from '../feedback/InlineNotice'

export function PrivacyNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <InlineNotice tone="privacy" title={title}>
      {children}
    </InlineNotice>
  )
}

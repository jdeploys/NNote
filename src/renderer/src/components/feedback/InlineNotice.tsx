import type { ReactNode } from 'react'

export function InlineNotice({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'privacy' | 'warning' | 'error' | 'success'
  title: string
  children: ReactNode
}) {
  return (
    <aside
      className="inline-notice"
      data-tone={tone}
      role={tone === 'error' ? 'alert' : 'note'}
      aria-label={title}
    >
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  )
}

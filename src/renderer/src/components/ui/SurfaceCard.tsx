import type { ReactNode } from 'react'

export function SurfaceCard({
  as: Component = 'section',
  labelledBy,
  className = '',
  children,
}: {
  as?: 'section' | 'div' | 'article'
  labelledBy?: string
  className?: string
  children: ReactNode
}) {
  return (
    <Component className={`surface-card ${className}`.trim()} aria-labelledby={labelledBy}>
      {children}
    </Component>
  )
}

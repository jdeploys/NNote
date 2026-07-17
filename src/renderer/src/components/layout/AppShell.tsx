import type { ReactNode } from 'react'

type PrimaryScreen = 'all' | 'templates' | 'settings'

export function AppShell({
  active,
  onNavigate,
  onImport,
  children,
}: {
  active: PrimaryScreen
  onNavigate(destination: PrimaryScreen): void
  onImport?(): void
  children: ReactNode
}) {
  const entries = [
    ['all', '전체 기록'],
    ['templates', '요약 템플릿'],
    ['settings', '설정'],
  ] as const

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => onNavigate('all')}
          aria-label="Nnote 홈"
        >
          Nnote
        </button>
        <nav className="app-nav" aria-label="주요 메뉴">
          {entries.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-current={active === value ? 'page' : undefined}
              data-focus-key={value === 'all' ? undefined : `nav-${value}`}
              onClick={() => onNavigate(value)}
            >
              {label}
            </button>
          ))}
          {onImport === undefined ? null : (
            <button type="button" className="nav-import" onClick={onImport}>
              .nnote 가져오기
            </button>
          )}
        </nav>
      </header>
      {children}
    </div>
  )
}

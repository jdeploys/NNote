import type { ReactNode } from 'react'
import { Icon, type IconName } from '../ui/Icon'
import { BrandMark } from '../ui/BrandMark'
import { Button } from '../ui/Button'

type PrimaryScreen = 'all' | 'templates' | 'settings'

export function AppShell({
  active,
  onNavigate,
  onQuickRecord,
  children,
}: {
  active: PrimaryScreen
  onNavigate(destination: PrimaryScreen): void
  onQuickRecord?(): void
  children: ReactNode
}) {
  const entries: ReadonlyArray<readonly [PrimaryScreen, string, IconName]> = [
    ['all', '전체 기록', 'library'],
    ['templates', '요약 템플릿', 'template'],
    ['settings', '설정', 'settings'],
  ] as const

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => onNavigate('all')}
          aria-label="Mineloa 홈"
        >
          <BrandMark />
          <span>Mineloa</span>
        </button>
        <div className="topbar-actions">
          {onQuickRecord === undefined ? null : <Button className="topbar-quick-record" type="button" icon="microphone" variant="primary" aria-label="빠른 녹음 시작" onClick={onQuickRecord}><span>녹음 시작</span></Button>}
          <nav className="app-nav" aria-label="주요 메뉴">
            {entries.map(([value, label, icon]) => (
              <button
                key={value}
                type="button"
                aria-current={active === value ? 'page' : undefined}
                data-focus-key={value === 'all' ? undefined : `nav-${value}`}
                onClick={() => onNavigate(value)}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}

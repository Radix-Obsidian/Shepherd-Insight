'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { APP_NAME, APP_TAGLINE, NAVIGATION_ITEMS, DEFAULT_SIDEBAR_WIDTH } from '@/lib/constants'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', tourTarget: 'dashboard' },
  { name: 'New Insight', href: '/intake', tourTarget: 'new-insight' },
  { name: 'Vault', href: '/vault', tourTarget: 'vault' },
  { name: 'Mind Map', href: '/mindmap', tourTarget: 'mindmap' },
  { name: 'Exports', href: '/exports', tourTarget: 'exports' },
  { name: 'Account', href: '/account', tourTarget: 'account' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div
      className="flex flex-col bg-card border-r border-border h-screen"
      style={{ width: DEFAULT_SIDEBAR_WIDTH, minWidth: DEFAULT_SIDEBAR_WIDTH }}
    >
      {/* Header */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <h1 className="text-xl font-bold text-foreground">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground mt-1">{APP_TAGLINE}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                data-tour-target={item.tourTarget}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <Link
          href="/account"
          className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Sign Out
        </Link>
      </div>
    </div>
  )
}

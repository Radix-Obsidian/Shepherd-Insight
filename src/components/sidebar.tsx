'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { APP_NAME, APP_TAGLINE, NAVIGATION_ITEMS, DEFAULT_SIDEBAR_WIDTH } from '@/lib/constants'
import { useSidebarCollapsed, useAppStore } from '@/lib/store'
import { 
  LayoutDashboard, 
  Lightbulb, 
  Lock, 
  Network, 
  Download, 
  User, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = NAVIGATION_ITEMS.map(item => ({
  ...item,
  tourTarget: item.name.toLowerCase().replace(' ', '-')
}))

// Icon mapping for navigation items
const iconMap = {
  'Dashboard': LayoutDashboard,
  'New Insight': Lightbulb,
  'Vault': Lock,
  'Mind Map': Network,
  'Exports': Download,
  'Account': User,
}

export function Sidebar() {
  const pathname = usePathname()
  const isCollapsed = useSidebarCollapsed()
  const { toggleSidebar } = useAppStore()

  return (
    <div className={cn(
      "bg-gray-100 dark:bg-gray-800 h-screen border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold">{APP_NAME}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{APP_TAGLINE}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-1 h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = iconMap[item.name as keyof typeof iconMap]
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <IconComponent className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/account"
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          )}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <User className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Sign Out"}
        </Link>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { APP_NAME, NAVIGATION_ITEMS } from '@/lib/constants'
import { 
  LayoutDashboard, 
  Lock, 
  Network, 
  Download, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Compass,
  BookOpen,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShepLightLogo } from '@/components/logo'

const navigationItems = NAVIGATION_ITEMS.map(item => ({
  ...item,
  tourTarget: item.name.toLowerCase().replace(' ', '-')
}))

// Icon mapping for navigation items
const iconMap = {
  'Dashboard': LayoutDashboard,
  // The Shepherd Journey
  'Compass': Compass,
  'Muse': BookOpen,
  'Blueprint': FileText,
  'Vault': Lock,
  // Tools
  'Mind Map': Network,
  'Exports': Download,
  'Account': User,
}

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl h-screen border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <ShepLightLogo size={32} className="flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">{APP_NAME}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Light the way.</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <ShepLightLogo size={28} />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(prev => !prev)}
            className={cn("h-6 w-6 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700", isCollapsed && "absolute -right-3 top-9 bg-white border shadow-sm")}
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = iconMap[item.name as keyof typeof iconMap]
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <IconComponent className={cn(
                    "h-5 w-5 transition-colors", 
                    !isCollapsed && "mr-3",
                    isActive ? "text-amber-500" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {!isCollapsed && (
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {item.description && (
                        <span className="text-[10px] font-normal text-slate-400">{item.description}</span>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/account"
          className={cn(
            "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all"
          )}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <User className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Sign Out"}
        </Link>
      </div>
    </div>
  )
}

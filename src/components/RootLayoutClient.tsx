'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const { checkSession } = useAppStore()

  useEffect(() => {
    // Check session on app mount
    checkSession()
  }, [checkSession])

  return <>{children}</>
}

'use client';

import { useEffect, useState } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Lazy initialize auth error handler after mount
    import('@/lib/auth-error-handler')
      .then(({ AuthErrorHandler }) => {
        AuthErrorHandler.getInstance().initializeErrorMonitoring()
      })
      .catch(() => {
        // Auth handler not available, ignore
      })
  }, [])

  // Avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

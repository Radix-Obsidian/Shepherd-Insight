'use client';

import { useEffect } from 'react'
import { AuthErrorHandler } from '@/lib/auth-error-handler'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth error monitoring on mount
    AuthErrorHandler.getInstance().initializeErrorMonitoring()
  }, [])

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

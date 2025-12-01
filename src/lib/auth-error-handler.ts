'use client'

/**
 * Auth Error Handler
 * 
 * Handles Supabase auth errors gracefully, especially refresh token issues
 */

import { createSupabaseBrowserClient } from './supabase-browser'

export class AuthErrorHandler {
  private static instance: AuthErrorHandler | null = null
  private supabase = createSupabaseBrowserClient()

  static getInstance(): AuthErrorHandler {
    if (!AuthErrorHandler.instance) {
      AuthErrorHandler.instance = new AuthErrorHandler()
    }
    return AuthErrorHandler.instance
  }

  /**
   * Handle auth errors and attempt recovery
   */
  async handleAuthError(error: any): Promise<void> {
    console.warn('Auth error detected:', error)

    // Check if it's a refresh token error
    if (this.isRefreshTokenError(error)) {
      await this.clearAuthState()
      // Optionally redirect to login or show a message
      console.log('Cleared invalid auth state')
    }
  }

  /**
   * Check if error is related to refresh token
   */
  private isRefreshTokenError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || ''
    return (
      errorMessage.includes('refresh token') ||
      errorMessage.includes('invalid refresh token') ||
      errorMessage.includes('refresh token not found') ||
      error?.status === 400
    )
  }

  /**
   * Clear auth state from localStorage and Supabase
   */
  private async clearAuthState(): Promise<void> {
    try {
      // Sign out from Supabase (clears tokens)
      await this.supabase.auth.signOut()
      
      // Clear any auth-related localStorage items
      if (typeof window !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
    } catch (clearError) {
      console.warn('Error clearing auth state:', clearError)
    }
  }

  /**
   * Initialize auth error monitoring
   */
  initializeErrorMonitoring(): void {
    if (typeof window === 'undefined') return

    // Listen for Supabase auth errors
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('Token refresh failed, clearing auth state')
        this.clearAuthState()
      }
    })

    // Global error handler for unhandled auth errors
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isRefreshTokenError(event.reason)) {
        this.handleAuthError(event.reason)
        event.preventDefault() // Prevent console spam
      }
    })
  }
}

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  AuthErrorHandler.getInstance().initializeErrorMonitoring()
}

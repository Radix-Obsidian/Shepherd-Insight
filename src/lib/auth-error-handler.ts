'use client'

/**
 * Auth Error Handler
 * 
 * Handles Supabase auth errors gracefully, especially refresh token issues
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export class AuthErrorHandler {
  private static instance: AuthErrorHandler | null = null
  private supabase: SupabaseClient | null = null
  private initialized = false

  static getInstance(): AuthErrorHandler {
    if (!AuthErrorHandler.instance) {
      AuthErrorHandler.instance = new AuthErrorHandler()
    }
    return AuthErrorHandler.instance
  }

  private async getSupabase(): Promise<SupabaseClient | null> {
    if (!this.supabase && typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid issues at module load time
        const { createSupabaseBrowserClient } = await import('./supabase-browser')
        this.supabase = createSupabaseBrowserClient()
      } catch {
        // Supabase not configured yet, ignore
        return null
      }
    }
    return this.supabase
  }

  /**
   * Handle auth errors and attempt recovery
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleAuthError(error: any): Promise<void> {
    // Check if it's a refresh token error
    if (this.isRefreshTokenError(error)) {
      await this.clearAuthState()
    }
  }

  /**
   * Check if error is related to refresh token
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const supabase = await this.getSupabase()
      if (supabase) {
        await supabase.auth.signOut()
      }
      
      // Clear any auth-related localStorage items
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
    } catch {
      // Ignore errors during cleanup
    }
  }

  /**
   * Initialize auth error monitoring
   */
  initializeErrorMonitoring(): void {
    if (typeof window === 'undefined' || this.initialized) return
    this.initialized = true

    // Initialize async
    this.getSupabase().then(supabase => {
      if (!supabase) return

      // Listen for Supabase auth errors
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED' && !session) {
          this.clearAuthState()
        }
      })
    })

    // Global error handler for unhandled auth errors
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isRefreshTokenError(event.reason)) {
        this.handleAuthError(event.reason)
        event.preventDefault()
      }
    })
  }
}

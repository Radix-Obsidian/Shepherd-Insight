import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from './env'

// Singleton to prevent multiple client instances
let _client: SupabaseClient | null = null

export function createSupabaseBrowserClient(): SupabaseClient {
  // Only create client on the browser side
  if (typeof window === 'undefined') {
    // Return a dummy client for SSR - won't actually be used
    throw new Error('createSupabaseBrowserClient should only be called on the client side')
  }
  
  if (!_client) {
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials not configured')
    }
    _client = createBrowserClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return _client
}

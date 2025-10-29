// Client-safe environment variables for Shepherd Insight
// This file can be imported in client components
// For server-only secrets, use @/lib/env.server instead

// Supabase Configuration (Client-safe)
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// App Configuration (Client-safe)
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''
export const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || ''
export const NEXT_PUBLIC_DISABLE_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

// Development/Production flags (Client-safe)
export const NODE_ENV = process.env.NODE_ENV || 'development'

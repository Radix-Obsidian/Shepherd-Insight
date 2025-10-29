// Environment variables example for Shepherd Insight
// DO NOT check real keys into git. These envs will be injected at deploy time.

// Supabase Configuration (Client-safe)
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// App Configuration (Client-safe)
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''
export const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

// Development/Production flags (Client-safe)
export const NODE_ENV = process.env.NODE_ENV || 'development'

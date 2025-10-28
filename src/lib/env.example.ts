// Environment variables for Shepherd Insight
// DO NOT check real keys into git. These envs will be injected at deploy time.

// Supabase Configuration
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// AI/External Services
export const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
export const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || ''

// Development/Production flags
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

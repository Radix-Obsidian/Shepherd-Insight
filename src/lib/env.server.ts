// Server-only environment variables for Shepherd Insight
// DO NOT import this file in client components or 'use client' files
// Only import in API routes, server components, or 'use server' files

// Supabase Configuration (Server-only)
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// AI/External Services (Server-only)
export const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
export const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || ''
export const FIRECRAWL_WEBHOOK_SECRET = process.env.FIRECRAWL_WEBHOOK_SECRET || ''

// Internal API Key (Server-only)
export const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''


// Helper for building Supabase Edge Function URLs
import { NEXT_PUBLIC_SUPABASE_URL } from './env'

/**
 * Builds the URL for a Supabase Edge Function
 * @param functionName - Name of the Edge Function (e.g., 'env-config')
 * @returns Full URL to the Edge Function
 */
export function getSupabaseEdgeFunctionUrl(functionName: string): string {
  if (!NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  
  // Remove trailing slash if present
  const baseUrl = NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')
  
  return `${baseUrl}/functions/v1/${functionName}`
}


// Helper function to fetch API keys from Supabase Edge Function
// This provides a fallback when environment variables are not available locally
import { getSupabaseEdgeFunctionUrl } from './supabase-edge'
import { NEXT_PUBLIC_SUPABASE_ANON_KEY } from './env'
import { logger } from '@/lib/logger'

export async function getApiKey(keyName: string): Promise<string> {
  // First try local environment variables
  if (process.env[keyName]) {
    return process.env[keyName]!
  }
  
  // Fallback to Edge Function (server-side only)
  try {
    const edgeFunctionUrl = getSupabaseEdgeFunctionUrl('env-config')
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ name: keyName })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`)
    }
    
    const result = await response.json()
    const apiKey = result.value
    
    if (!apiKey) {
      throw new Error(`${keyName} not found in Edge Function config`)
    }
    
    return apiKey
  } catch (error) {
    logger.error(`Failed to fetch ${keyName} from Edge Function:`, error)
    throw new Error(`${keyName} environment variable is required`)
  }
}

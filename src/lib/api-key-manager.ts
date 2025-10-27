// Helper function to fetch API keys from Supabase Edge Function
// This provides a fallback when environment variables are not available locally

export async function getApiKey(keyName: string): Promise<string> {
  // First try local environment variables
  if (process.env[keyName]) {
    return process.env[keyName]!
  }
  
  // Fallback to Edge Function
  try {
    const response = await fetch('https://jiecqmnygnqrfntqoqsg.supabase.co/functions/v1/env-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action: 'get-config' })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`)
    }
    
    const config = await response.json()
    const apiKey = config[keyName]
    
    if (!apiKey) {
      throw new Error(`${keyName} not found in Edge Function config`)
    }
    
    return apiKey
  } catch (error) {
    logger.error(`Failed to fetch ${keyName} from Edge Function:`, error)
    throw new Error(`${keyName} environment variable is required`)
  }
}
import { logger } from '@/lib/logger';

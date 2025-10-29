import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

// Whitelist of safe environment variables that can be exposed to clients
// DO NOT include any API keys, secrets, or service role keys
const SAFE_CONFIG_WHITELIST = [
  // Model names and configuration (non-sensitive)
  'GROQ_MODEL',
  'DEFAULT_MODEL',
  'MAX_TOKENS',
  'DEFAULT_TEMPERATURE',
  // Feature flags
  'ENABLE_FEATURE_X',
  'ENABLE_FEATURE_Y',
  // Public URLs (already public)
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SITE_URL',
]

// Blocked environment variables that should never be exposed
const BLOCKED_VARS = [
  'GROQ_API_KEY',
  'FIRECRAWL_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'INTERNAL_API_KEY',
  'FIRECRAWL_WEBHOOK_SECRET',
  'SUPABASE_URL', // Can be derived from NEXT_PUBLIC_SUPABASE_URL
]

function getCorsHeaders() {
  const origin = Deno.env.get('ALLOWED_ORIGIN') || '*'
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(),
    })
  }

  try {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.split(' ')[1]
    const internalApiKey = Deno.env.get('INTERNAL_API_KEY')

    // Check if request is authenticated via INTERNAL_API_KEY (server-to-server)
    if (internalApiKey && token === internalApiKey) {
      console.log('Authenticated via INTERNAL_API_KEY')
    } else {
      // Otherwise, verify Supabase user session
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: getCorsHeaders(),
          status: 401,
        })
      }
      console.log('Authenticated via Supabase user session:', user.id)
    }

    const { name } = await req.json()

    if (!name) {
      return new Response(JSON.stringify({ error: 'Missing environment variable name' }), {
        headers: getCorsHeaders(),
        status: 400,
      })
    }

    // Security check: Block any attempt to access secrets
    if (BLOCKED_VARS.includes(name)) {
      return new Response(JSON.stringify({ error: 'Access to this environment variable is not allowed' }), {
        headers: getCorsHeaders(),
        status: 403,
      })
    }

    // Security check: Only allow whitelisted variables
    if (!SAFE_CONFIG_WHITELIST.includes(name)) {
      return new Response(JSON.stringify({ error: 'Environment variable not in safe whitelist' }), {
        headers: getCorsHeaders(),
        status: 403,
      })
    }

    const value = Deno.env.get(name)

    if (!value) {
      return new Response(JSON.stringify({ error: `Environment variable ${name} not found` }), {
        headers: getCorsHeaders(),
        status: 404,
      })
    }

    return new Response(JSON.stringify({ name, value }), {
      headers: getCorsHeaders(),
      status: 200,
    })
  } catch (error) {
    console.error('Error in env-config function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: getCorsHeaders(),
      status: 500,
    })
  }
})

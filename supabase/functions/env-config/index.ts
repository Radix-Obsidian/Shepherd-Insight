import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

serve(async (req) => {
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
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        })
      }
      console.log('Authenticated via Supabase user session:', user.id)
    }

    const { name } = await req.json()

    if (!name) {
      return new Response(JSON.stringify({ error: 'Missing environment variable name' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const value = Deno.env.get(name)

    if (!value) {
      return new Response(JSON.stringify({ error: `Environment variable ${name} not found` }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    return new Response(JSON.stringify({ name, value }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in env-config function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

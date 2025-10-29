import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

/**
 * Health check endpoint for deployment verification
 * GET /api/health
 */
export async function GET() {
  try {
    const timestamp = new Date().toISOString()
    
    // Optional: Check Supabase connection
    let databaseStatus = 'unknown'
    try {
      const supabase = createSupabaseServerClient()
      const { error } = await supabase.from('projects').select('id').limit(1)
      databaseStatus = error ? 'error' : 'connected'
    } catch (dbError) {
      databaseStatus = 'error'
    }

    return NextResponse.json({
      ok: true,
      timestamp,
      database: databaseStatus,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


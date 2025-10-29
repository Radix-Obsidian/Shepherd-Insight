import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * GET /api/insights?projectId=...
 * Fetches insight data for a project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the most recent insight for this project
    const { data: insights, error } = await supabase
      .from('insights')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      logger.error('Failed to fetch insights:', error)
      return NextResponse.json(
        { error: `Failed to fetch insights: ${error.message}` },
        { status: 500 }
      )
    }

    if (!insights || insights.length === 0) {
      return NextResponse.json({ insight: null })
    }

    // Return the insight data (stored in the 'data' field)
    return NextResponse.json({
      insight: insights[0].data,
      insightId: insights[0].id,
      createdAt: insights[0].created_at,
    })

  } catch (error: unknown) {
    logger.error('Insights API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}


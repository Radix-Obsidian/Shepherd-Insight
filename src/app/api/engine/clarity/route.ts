/**
 * API Route: /api/engine/clarity
 * 
 * Generates clarity from a raw idea using the Shepherd Engine.
 * Powers the Compass tool.
 * 
 * POST: Generate new clarity analysis
 * GET: Retrieve clarity session by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { generateClarity, type ClarityInput, type ClarityOutput } from '@/lib/engine'

// Types for API
interface ClarityRequest {
  idea: string
  targetUser?: string
  additionalContext?: string
}

interface ClarityResponse {
  success: boolean
  data?: {
    sessionId: string
    clarity: ClarityOutput
  }
  error?: string
}

/**
 * POST /api/engine/clarity
 * Generate clarity from an idea
 */
export async function POST(request: NextRequest): Promise<NextResponse<ClarityResponse>> {
  const startTime = Date.now()

  try {
    // Parse request body
    const body: ClarityRequest = await request.json()
    
    // Validate required fields
    if (!body.idea || body.idea.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Idea must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create initial session record
    const { data: session, error: insertError } = await supabase
      .from('clarity_sessions')
      .insert({
        user_id: user.id,
        idea: body.idea.trim(),
        target_user: body.targetUser?.trim() || null,
        additional_context: body.additionalContext?.trim() || null,
        status: 'processing',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to create clarity session:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Generate clarity using Shepherd Engine
    const input: ClarityInput = {
      idea: body.idea.trim(),
      targetUser: body.targetUser?.trim(),
      additionalContext: body.additionalContext?.trim(),
    }

    const clarity = await generateClarity(input)
    const processingTime = Date.now() - startTime

    // Update session with results
    const { error: updateError } = await supabase
      .from('clarity_sessions')
      .update({
        problem_statement: clarity.problemStatement,
        target_user_output: clarity.targetUser,
        jobs_to_be_done: clarity.jobsToBeDone,
        opportunity_gap: clarity.opportunityGap,
        value_hypotheses: clarity.valueHypotheses,
        next_steps: clarity.nextSteps,
        full_output: clarity,
        status: 'completed',
        processing_time_ms: processingTime,
        model_used: 'llama-3.3-70b-versatile',
      })
      .eq('id', session.id)

    if (updateError) {
      console.error('Failed to update clarity session:', updateError)
      // Don't fail the request - we have the clarity, just log the error
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        clarity,
      },
    })

  } catch (error) {
    console.error('Clarity generation error:', error)
    
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { success: false, error: `Clarity generation failed: ${message}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/engine/clarity?id=<sessionId>
 * Retrieve a clarity session by ID
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = request.nextUrl.searchParams.get('id')
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch session (RLS ensures user can only see their own)
    const { data: session, error: fetchError } = await supabase
      .from('clarity_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Reconstruct clarity output
    const clarity: ClarityOutput = session.full_output || {
      problemStatement: session.problem_statement,
      targetUser: session.target_user_output,
      jobsToBeDone: session.jobs_to_be_done,
      opportunityGap: session.opportunity_gap,
      valueHypotheses: session.value_hypotheses,
      nextSteps: session.next_steps,
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        clarity,
        status: session.status,
        createdAt: session.created_at,
      },
    })

  } catch (error) {
    console.error('Fetch clarity error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

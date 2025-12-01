/**
 * API Route: /api/engine/research
 * 
 * Synthesizes user research from clarity output.
 * Powers the Muse tool.
 * 
 * POST: Generate research synthesis from clarity
 * GET: Retrieve research session by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { synthesizeResearch, synthesizeQuickResearch, type ResearchOutput, type ClarityOutput } from '@/lib/engine'

// Types for API
interface ResearchRequest {
  claritySessionId: string
  competitorUrls?: string[]
  additionalContext?: string
  quickMode?: boolean // Skip Firecrawl, use AI knowledge only
}

interface ResearchResponse {
  success: boolean
  data?: {
    sessionId: string
    research: ResearchOutput
  }
  error?: string
}

/**
 * POST /api/engine/research
 * Synthesize research from clarity
 */
export async function POST(request: NextRequest): Promise<NextResponse<ResearchResponse>> {
  const startTime = Date.now()

  try {
    const body: ResearchRequest = await request.json()
    
    if (!body.claritySessionId) {
      return NextResponse.json(
        { success: false, error: 'claritySessionId is required' },
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

    // Fetch the clarity session
    const { data: claritySession, error: clarityError } = await supabase
      .from('clarity_sessions')
      .select('*')
      .eq('id', body.claritySessionId)
      .single()

    if (clarityError || !claritySession) {
      return NextResponse.json(
        { success: false, error: 'Clarity session not found' },
        { status: 404 }
      )
    }

    // Reconstruct clarity output
    const clarity: ClarityOutput = claritySession.full_output || {
      problemStatement: claritySession.problem_statement,
      targetUser: claritySession.target_user_output,
      jobsToBeDone: claritySession.jobs_to_be_done,
      opportunityGap: claritySession.opportunity_gap,
      valueHypotheses: claritySession.value_hypotheses,
      nextSteps: claritySession.next_steps,
    }

    // Create initial research session record
    const { data: session, error: insertError } = await supabase
      .from('research_sessions')
      .insert({
        user_id: user.id,
        clarity_session_id: body.claritySessionId,
        competitor_urls: body.competitorUrls || [],
        additional_context: body.additionalContext || null,
        research_type: body.quickMode ? 'quick' : 'full',
        status: 'researching',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to create research session:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Update status to synthesizing
    await supabase
      .from('research_sessions')
      .update({ status: 'synthesizing' })
      .eq('id', session.id)

    // Synthesize research
    let research: ResearchOutput

    if (body.quickMode) {
      // Quick mode: AI knowledge only, no Firecrawl
      research = await synthesizeQuickResearch(clarity)
    } else {
      // Full mode: Firecrawl + AI synthesis
      research = await synthesizeResearch({
        claritySessionId: body.claritySessionId,
        clarity,
        competitorUrls: body.competitorUrls,
        additionalContext: body.additionalContext,
      })
    }

    const processingTime = Date.now() - startTime

    // Update session with results
    const { error: updateError } = await supabase
      .from('research_sessions')
      .update({
        personas: research.personas,
        pain_map: research.painMap,
        emotional_journey: research.emotionalJourney,
        insights: research.insights,
        competitor_gaps: research.competitorGaps,
        full_output: research,
        status: 'completed',
        processing_time_ms: processingTime,
        model_used: body.quickMode ? 'groq-llama-3.3-70b' : 'perplexity-sonar-deep-research + claude-sonnet-4',
      })
      .eq('id', session.id)

    if (updateError) {
      console.error('Failed to update research session:', updateError)
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        research,
      },
    })

  } catch (error) {
    console.error('Research synthesis error:', error)
    
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { success: false, error: `Research synthesis failed: ${message}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/engine/research?id=<sessionId>
 * Retrieve a research session by ID
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

    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: session, error: fetchError } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    const research: ResearchOutput = session.full_output || {
      personas: session.personas,
      painMap: session.pain_map,
      emotionalJourney: session.emotional_journey,
      insights: session.insights,
      competitorGaps: session.competitor_gaps,
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        claritySessionId: session.clarity_session_id,
        research,
        status: session.status,
        createdAt: session.created_at,
      },
    })

  } catch (error) {
    console.error('Fetch research error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

/**
 * API Route: /api/engine/blueprint
 * 
 * Generates MVP blueprint from clarity and research.
 * Powers the Blueprint tool.
 * 
 * POST: Generate blueprint from clarity + research
 * GET: Retrieve blueprint session by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { generateBlueprint, type BlueprintOutput, type ClarityOutput, type ResearchOutput } from '@/lib/engine'

// Types for API
interface BlueprintRequest {
  claritySessionId: string
  researchSessionId: string
}

interface BlueprintResponse {
  success: boolean
  data?: {
    sessionId: string
    blueprint: BlueprintOutput
  }
  error?: string
}

/**
 * POST /api/engine/blueprint
 * Generate blueprint from clarity + research
 */
export async function POST(request: NextRequest): Promise<NextResponse<BlueprintResponse>> {
  const startTime = Date.now()

  try {
    const body: BlueprintRequest = await request.json()
    
    if (!body.claritySessionId || !body.researchSessionId) {
      return NextResponse.json(
        { success: false, error: 'claritySessionId and researchSessionId are required' },
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

    // Fetch the research session
    const { data: researchSession, error: researchError } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('id', body.researchSessionId)
      .single()

    if (researchError || !researchSession) {
      return NextResponse.json(
        { success: false, error: 'Research session not found' },
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

    // Reconstruct research output
    const research: ResearchOutput = researchSession.full_output || {
      personas: researchSession.personas,
      painMap: researchSession.pain_map,
      emotionalJourney: researchSession.emotional_journey,
      insights: researchSession.insights,
      competitorGaps: researchSession.competitor_gaps,
    }

    // Create initial blueprint session record
    const { data: session, error: insertError } = await supabase
      .from('blueprint_sessions')
      .insert({
        user_id: user.id,
        clarity_session_id: body.claritySessionId,
        research_session_id: body.researchSessionId,
        status: 'generating',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to create blueprint session:', insertError)
      // Continue without database - still generate blueprint
    }

    // Generate blueprint
    const blueprint = await generateBlueprint({
      claritySessionId: body.claritySessionId,
      researchSessionId: body.researchSessionId,
      clarity,
      research,
    })

    const processingTime = Date.now() - startTime

    // Update session with results if we have a session
    if (session?.id) {
      await supabase
        .from('blueprint_sessions')
        .update({
          product_vision: blueprint.productVision,
          mvp_scope: blueprint.mvpScope,
          core_value: blueprint.coreValue,
          features: blueprint.features,
          roadmap: blueprint.roadmap,
          success_metrics: blueprint.successMetrics,
          risks: blueprint.risks,
          launch_checklist: blueprint.launchChecklist,
          full_output: blueprint,
          status: 'completed',
          processing_time_ms: processingTime,
          model_used: 'llama-3.3-70b-versatile',
        })
        .eq('id', session.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session?.id || 'temp-' + Date.now(),
        blueprint,
      },
    })

  } catch (error) {
    console.error('Blueprint generation error:', error)
    
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { success: false, error: `Blueprint generation failed: ${message}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/engine/blueprint?id=<sessionId>
 * Retrieve a blueprint session by ID
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
      .from('blueprint_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    const blueprint: BlueprintOutput = session.full_output || {
      productVision: session.product_vision,
      mvpScope: session.mvp_scope,
      coreValue: session.core_value,
      features: session.features,
      roadmap: session.roadmap,
      successMetrics: session.success_metrics,
      risks: session.risks,
      launchChecklist: session.launch_checklist,
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        claritySessionId: session.clarity_session_id,
        researchSessionId: session.research_session_id,
        blueprint,
        status: session.status,
        createdAt: session.created_at,
      },
    })

  } catch (error) {
    console.error('Fetch blueprint error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'
import { INTERNAL_API_KEY } from '@/lib/env.server'
import { NEXT_PUBLIC_SITE_URL } from '@/lib/env'

interface CreateProjectRequest {
  problemStatement: string
  // Optional: full form data for advanced users
  rawFormData?: {
    name?: string
    audience?: string
    problem?: string
    whyCurrentFails?: string
    promise?: string
    mustHaves?: string[]
    notNow?: string[]
    constraints?: string
  }
}

/**
 * Creates a new project from intake form and triggers insight generation
 * POST /api/intake/create-project
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateProjectRequest
    const { problemStatement, rawFormData } = body

    if (!problemStatement || typeof problemStatement !== 'string' || problemStatement.trim().length === 0) {
      return NextResponse.json(
        { error: 'Problem statement is required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract project name from problem statement or use default
    const projectName = rawFormData?.name || extractProjectName(problemStatement) || 'New Project'

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: projectName,
      })
      .select()
      .single()

    if (projectError) {
      logger.error('Failed to create project:', projectError)
      return NextResponse.json(
        { error: `Failed to create project: ${projectError.message}` },
        { status: 500 }
      )
    }

    const projectId = project.id

    // Create initial version with intake data
    const versionData = {
      project_id: projectId,
      version_number: 1,
      name: projectName,
      audience: rawFormData?.audience || '',
      problem: rawFormData?.problem || problemStatement,
      why_current_fails: rawFormData?.whyCurrentFails || '',
      promise: rawFormData?.promise || '',
      must_haves: rawFormData?.mustHaves || [],
      not_now: rawFormData?.notNow || [],
      constraints: rawFormData?.constraints || '',
      locked_decisions: {},
    }

    const { data: version, error: versionError } = await supabase
      .from('versions')
      .insert([versionData])
      .select()
      .single()

    if (versionError) {
      logger.error('Failed to create version:', versionError)
      // Clean up project if version creation fails
      await supabase.from('projects').delete().eq('id', projectId)
      return NextResponse.json(
        { error: `Failed to create version: ${versionError.message}` },
        { status: 500 }
      )
    }

    const versionId = version.id

    // Trigger insight generation asynchronously
    // We'll call the research API internally
    const researchQuery = rawFormData?.problem || problemStatement
    
    try {
      // Create insight job first
      const { data: jobData, error: jobError } = await supabase
        .from('insight_jobs')
        .insert({
          user_id: user.id,
          project_id: projectId,
          query: researchQuery,
          status: 'running',
          current_step: 'Initializing',
          progress_steps: ['Initializing'],
        })
        .select()
        .single()

      if (jobError) {
        logger.error('Failed to create insight job:', jobError)
        // Don't fail the request, just log the error
        // The user can still see their project and trigger research manually
      } else {
        // Call research API internally (non-blocking)
        const researchUrl = NEXT_PUBLIC_SITE_URL 
          ? `${NEXT_PUBLIC_SITE_URL}/api/research/run`
          : '/api/research/run'
        
        // Fire and forget - don't wait for completion
        fetch(researchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${INTERNAL_API_KEY}`
          },
          body: JSON.stringify({
            projectId,
            query: researchQuery,
            depth: 2,
          }),
        }).catch(err => {
          logger.error('Failed to trigger research:', err)
        })
      }
    } catch (researchError) {
      logger.error('Error triggering research:', researchError)
      // Don't fail the request if research fails to start
    }

    return NextResponse.json({
      projectId,
      versionId,
      message: 'Project created successfully. Insight generation started.',
    })

  } catch (error: unknown) {
    logger.error('Create project API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

/**
 * Extracts a project name from problem statement
 * Simple heuristic: first sentence or first 50 chars
 */
function extractProjectName(problemStatement: string): string {
  const trimmed = problemStatement.trim()
  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim()
  if (firstSentence && firstSentence.length > 0 && firstSentence.length <= 50) {
    return firstSentence
  }
  // Fallback: first 50 chars
  return trimmed.slice(0, 50).trim()
}


import { NextRequest, NextResponse } from 'next/server'
import { FiresearchAdapter } from '@/lib/research/firesearch-adapter'
import { supabase } from '@/lib/supabase'
import { InsightData } from '@/types/insight'
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    if (typeof payload !== 'object' || payload === null) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const { projectId, query, depth, competitorUrls, useWebhook, webhookUrl } = payload as Record<string, unknown>

    if (typeof projectId !== 'string' || typeof query !== 'string' || !projectId || !query) {
      return NextResponse.json({ error: 'Project ID and query are required.' }, { status: 400 })
    }

    // Create a new research job record in Supabase
    const { data: jobData, error: jobError } = await supabase
      .from('insight_jobs')
      .insert({
        project_id: projectId,
        query: query,
        status: 'running',
        current_step: 'Initializing',
        progress_steps: ['Initializing'],
      })
      .select()
      .single()

    if (jobError) {
      logger.error('Supabase insert job error:', jobError)
      throw new Error(`Failed to create research job: ${jobError.message}`)
    }

    const jobId = jobData.id

    // Create workflow with progress tracking
    const workflow = new FiresearchAdapter((state) => {
      // Update job progress in Supabase
      supabase
        .from('insight_jobs')
        .update({
          current_step: state.currentStep,
          status: state.status,
          progress_steps: [...jobData.progress_steps, state.currentStep],
          error: state.error,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)
        .then(({ error }) => {
          if (error) {
            logger.error('Failed to update job progress:', error)
          }
        })
    })

    let insight: InsightData
    let jobIdForTracking: string | undefined

    try {
      if (useWebhook && webhookUrl) {
        // Run async with webhook support
        jobIdForTracking = await workflow.runAsync({
          query,
          depth: typeof depth === 'number' ? depth : 2,
          competitorUrls: Array.isArray(competitorUrls) ? competitorUrls : [],
          webhookUrl: typeof webhookUrl === 'string' ? webhookUrl : ''
        })
        
        // For async operations, return immediately with job ID
        return NextResponse.json({ 
          jobId: jobIdForTracking,
          insightJobId: jobId,
          status: 'async',
          message: 'Research started with webhook. Check job status for updates.'
        })
      } else {
        // Run synchronously
        insight = await workflow.run({
          query,
          depth: typeof depth === 'number' ? depth : 2,
          competitorUrls: Array.isArray(competitorUrls) ? competitorUrls : [],
        })

        // Save the final insight data
        const { data: insightResult, error: insightError } = await supabase
          .from('insights')
          .insert({
            project_id: projectId,
            job_id: jobId,
            data: insight,
          })
          .select()
          .single()

        if (insightError) {
          logger.error('Supabase insert insight error:', insightError)
          throw new Error(`Failed to save insight: ${insightError.message}`)
        }

        // Update the job with completed status and result ID
        await supabase
          .from('insight_jobs')
          .update({
            status: 'completed',
            result_insight_id: insightResult.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', jobId)

        return NextResponse.json({ 
          jobId: jobId,
          insight,
          status: 'completed'
        })
      }

    } catch (workflowError: unknown) {
      // Update job with failed status
      await supabase
        .from('insight_jobs')
        .update({
          status: 'failed',
          error: workflowError instanceof Error ? workflowError.message : 'Research failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)
      
      throw workflowError
    }

  } catch (error: unknown) {
    logger.error('Research API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// GET endpoint to check job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const insightJobId = searchParams.get('insightJobId')

    if (!jobId && !insightJobId) {
      return NextResponse.json({ error: 'Job ID or Insight Job ID required' }, { status: 400 })
    }

    let query = supabase.from('insight_jobs').select('*')
    
    if (insightJobId) {
      query = query.eq('id', insightJobId)
    } else {
      query = query.eq('job_id', jobId)
    }

    const { data: jobData, error: jobError } = await query.single()

    if (jobError) {
      logger.error('Failed to fetch job:', jobError)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // If job is completed, also fetch the insight data
    let insightData = null
    if (jobData.status === 'completed' && jobData.result_insight_id) {
      const { data: insightResult, error: insightError } = await supabase
        .from('insights')
        .select('*')
        .eq('id', jobData.result_insight_id)
        .single()

      if (!insightError) {
        insightData = insightResult.data
      }
    }

    return NextResponse.json({
      job: jobData,
      insight: insightData
    })

  } catch (error: unknown) {
    logger.error('Job status API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

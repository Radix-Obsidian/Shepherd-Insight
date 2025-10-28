/**
 * Real-time Research Progress Tracker
 * Uses Supabase Realtime to track research job progress
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/env'
import { logger } from '@/lib/logger'

type SupabaseRealtimePayload<T = Record<string, unknown>> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T | null
  old: T | null
}

interface ResearchResultReference {
  insightId: string
}

export interface ResearchProgress {
  jobId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentStep: string
  progress: number
  progressSteps: string[]
  error?: string
  result?: ResearchResultReference
}

export interface ProgressUpdateCallback {
  (progress: ResearchProgress): void
}

interface InsightJobRecord {
  status: ResearchProgress['status']
  current_step?: string | null
  progress_steps?: string[] | null
  error?: string | null
  result_insight_id?: string | null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isResearchStatus(value: unknown): value is ResearchProgress['status'] {
  return value === 'pending' || value === 'running' || value === 'completed' || value === 'failed'
}

function isInsightJobRecord(value: unknown): value is InsightJobRecord {
  if (!isObject(value)) return false
  const { status, current_step, progress_steps } = value
  const validStatus = isResearchStatus(status)
  const validStep =
    typeof current_step === 'string' || current_step === null || typeof current_step === 'undefined'
  const validProgress =
    Array.isArray(progress_steps) || progress_steps === null || typeof progress_steps === 'undefined'
  return validStatus && validStep && validProgress
}

function normalizeSteps(steps: string[] | null | undefined): string[] {
  return Array.isArray(steps) ? steps : []
}

function normalizeResult(resultId: string | null | undefined): ResearchResultReference | undefined {
  return typeof resultId === 'string' ? { insightId: resultId } : undefined
}

export class ResearchProgressTracker {
  private supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  private subscriptions: Map<string, RealtimeChannel> = new Map()
  private callbacks: Map<string, ProgressUpdateCallback[]> = new Map()

  /**
   * Subscribe to progress updates for a specific job
   */
  subscribeToJob(jobId: string, callback: ProgressUpdateCallback): () => void {
    if (!this.callbacks.has(jobId)) {
      this.callbacks.set(jobId, [])
    }
    this.callbacks.get(jobId)!.push(callback)

    if (!this.subscriptions.has(jobId)) {
      const subscription = this.supabase
        .channel(`research-progress-${jobId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'insight_jobs',
            filter: `id=eq.${jobId}`,
          },
          (payload: SupabaseRealtimePayload<Record<string, unknown>>) => {
            this.handleProgressUpdate(jobId, payload.new)
          }
        )
        .subscribe()

      this.subscriptions.set(jobId, subscription)
    }

    return () => this.unsubscribe(jobId, callback)
  }

  private unsubscribe(jobId: string, callback: ProgressUpdateCallback) {
    const callbacks = this.callbacks.get(jobId)
    if (!callbacks) {
      return
    }

    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }

    if (callbacks.length === 0) {
      const subscription = this.subscriptions.get(jobId)
      if (subscription) {
        void this.supabase.removeChannel(subscription)
        this.subscriptions.delete(jobId)
      }
      this.callbacks.delete(jobId)
    }
  }

  /**
   * Handle progress updates from Supabase Realtime
   */
  private handleProgressUpdate(jobId: string, data: unknown) {
    if (!isInsightJobRecord(data)) {
      logger.warn('Received invalid progress payload', data)
      return
    }

    const progress: ResearchProgress = {
      jobId,
      status: data.status,
      currentStep: data.current_step || 'Unknown',
      progress: this.calculateProgress(normalizeSteps(data.progress_steps)),
      progressSteps: normalizeSteps(data.progress_steps),
      error: data.error ?? undefined,
      result: normalizeResult(data.result_insight_id),
    }

    const callbacks = this.callbacks.get(jobId)
    callbacks?.forEach(cb => cb(progress))
  }

  /**
   * Calculate progress percentage based on steps
   */
  private calculateProgress(steps: string[]): number {
    const totalSteps = 6 // Planning, Gathering, Extracting, Synthesizing, Validating, Formatting
    return Math.min((steps.length / totalSteps) * 100, 100)
  }

  /**
   * Get current progress for a job
   */
  async getCurrentProgress(jobId: string): Promise<ResearchProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from('insight_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error || !isInsightJobRecord(data)) {
        return null
      }

      return {
        jobId,
        status: data.status,
        currentStep: data.current_step || 'Unknown',
        progress: this.calculateProgress(normalizeSteps(data.progress_steps)),
        progressSteps: normalizeSteps(data.progress_steps),
        error: data.error ?? undefined,
        result: normalizeResult(data.result_insight_id),
      }
    } catch (error) {
      logger.error('Error fetching progress', error)
      return null
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach(subscription => {
      void this.supabase.removeChannel(subscription)
    })
    this.subscriptions.clear()
    this.callbacks.clear()
  }
}

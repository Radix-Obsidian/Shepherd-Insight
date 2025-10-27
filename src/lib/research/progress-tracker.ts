/**
 * Real-time Research Progress Tracker
 * Uses Supabase Realtime to track research job progress
 */

import { createClient } from '@supabase/supabase-js'
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/env'
import { logger } from '@/lib/logger';

export interface ResearchProgress {
  jobId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentStep: string
  progress: number
  progressSteps: string[]
  error?: string
  result?: any
}

export interface ProgressUpdateCallback {
  (progress: ResearchProgress): void
}

export class ResearchProgressTracker {
  private supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  private subscriptions: Map<string, any> = new Map()
  private callbacks: Map<string, ProgressUpdateCallback[]> = new Map()

  /**
   * Subscribe to progress updates for a specific job
   */
  subscribeToJob(jobId: string, callback: ProgressUpdateCallback): () => void {
    // Add callback to the list
    if (!this.callbacks.has(jobId)) {
      this.callbacks.set(jobId, [])
    }
    this.callbacks.get(jobId)!.push(callback)

    // Subscribe to Supabase Realtime if not already subscribed
    if (!this.subscriptions.has(jobId)) {
      const subscription = this.supabase
        .channel(`research-progress-${jobId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'insight_jobs',
            filter: `id=eq.${jobId}`
          },
          (payload) => {
            this.handleProgressUpdate(jobId, payload.new)
          }
        )
        .subscribe()

      this.subscriptions.set(jobId, subscription)
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(jobId)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
        
        // If no more callbacks, unsubscribe from Supabase
        if (callbacks.length === 0) {
          const subscription = this.subscriptions.get(jobId)
          if (subscription) {
            this.supabase.removeChannel(subscription)
            this.subscriptions.delete(jobId)
          }
          this.callbacks.delete(jobId)
        }
      }
    }
  }

  /**
   * Handle progress updates from Supabase Realtime
   */
  private handleProgressUpdate(jobId: string, data: any) {
    const progress: ResearchProgress = {
      jobId,
      status: data.status,
      currentStep: data.current_step || 'Unknown',
      progress: this.calculateProgress(data.progress_steps || []),
      progressSteps: data.progress_steps || [],
      error: data.error,
      result: data.result_insight_id ? { insightId: data.result_insight_id } : undefined
    }

    // Notify all callbacks
    const callbacks = this.callbacks.get(jobId)
    if (callbacks) {
      callbacks.forEach(callback => callback(progress))
    }
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

      if (error || !data) {
        return null
      }

      return {
        jobId,
        status: data.status,
        currentStep: data.current_step || 'Unknown',
        progress: this.calculateProgress(data.progress_steps || []),
        progressSteps: data.progress_steps || [],
        error: data.error,
        result: data.result_insight_id ? { insightId: data.result_insight_id } : undefined
      }
    } catch (error) {
      logger.error('Error fetching progress:', error)
      return null
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach(subscription => {
      this.supabase.removeChannel(subscription)
    })
    this.subscriptions.clear()
    this.callbacks.clear()
  }
}

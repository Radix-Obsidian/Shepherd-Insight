/**
 * React hook for real-time research progress tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ResearchProgressTracker, ResearchProgress } from '@/lib/research/progress-tracker'

export function useResearchProgress(jobId: string | null) {
  const [progress, setProgress] = useState<ResearchProgress | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const trackerRef = useRef<ResearchProgressTracker | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Initialize tracker
  useEffect(() => {
    if (!trackerRef.current) {
      trackerRef.current = new ResearchProgressTracker()
    }
  }, [])

  // Subscribe to progress updates
  useEffect(() => {
    if (!jobId || !trackerRef.current) return

    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    // Get initial progress
    trackerRef.current.getCurrentProgress(jobId).then(initialProgress => {
      if (initialProgress) {
        setProgress(initialProgress)
      }
    })

    // Subscribe to real-time updates
    const handleProgressUpdate = (newProgress: ResearchProgress) => {
      setProgress(newProgress)
      setIsConnected(true)
    }

    unsubscribeRef.current = trackerRef.current.subscribeToJob(jobId, handleProgressUpdate)

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [jobId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      if (trackerRef.current) {
        trackerRef.current.cleanup()
      }
    }
  }, [])

  const refreshProgress = useCallback(async () => {
    if (!jobId || !trackerRef.current) return

    const currentProgress = await trackerRef.current.getCurrentProgress(jobId)
    if (currentProgress) {
      setProgress(currentProgress)
    }
  }, [jobId])

  return {
    progress,
    isConnected,
    refreshProgress,
    isLoading: progress?.status === 'running',
    isCompleted: progress?.status === 'completed',
    isFailed: progress?.status === 'failed',
    error: progress?.error
  }
}

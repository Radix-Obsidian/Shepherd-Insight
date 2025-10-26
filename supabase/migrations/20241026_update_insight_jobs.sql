-- Add missing columns to insight_jobs table
-- Migration: 20241026_update_insight_jobs.sql

ALTER TABLE insight_jobs
  ADD COLUMN IF NOT EXISTS current_step TEXT,
  ADD COLUMN IF NOT EXISTS progress_steps TEXT[],
  ADD COLUMN IF NOT EXISTS error TEXT,
  ADD COLUMN IF NOT EXISTS result_insight_id UUID REFERENCES insights(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insight_jobs_current_step ON insight_jobs(current_step);
CREATE INDEX IF NOT EXISTS idx_insight_jobs_result_insight_id ON insight_jobs(result_insight_id);

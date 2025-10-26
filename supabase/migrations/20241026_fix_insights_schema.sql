-- Fix insights table schema mismatch
-- Add support for both version_id and project_id patterns
-- Migration: 20241026_fix_insights_schema.sql

-- Modify insights table to support both version_id and project_id
ALTER TABLE insights 
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES insight_jobs(id) ON DELETE SET NULL,
  ALTER COLUMN version_id DROP NOT NULL;

-- Update RLS policies to support new structure
DROP POLICY IF EXISTS "Users can view insights of their project versions" ON insights;
DROP POLICY IF EXISTS "Users can create insights for their project versions" ON insights;

-- Create new policies that support both patterns
CREATE POLICY "Users can view insights of their projects" ON insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE insights.project_id = p.id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM versions v
      JOIN projects p ON v.project_id = p.id
      WHERE insights.version_id = v.id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create insights for their projects" ON insights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE insights.project_id = p.id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM versions v
      JOIN projects p ON v.project_id = p.id
      WHERE insights.version_id = v.id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update insights of their projects" ON insights
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE insights.project_id = p.id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM versions v
      JOIN projects p ON v.project_id = p.id
      WHERE insights.version_id = v.id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete insights of their projects" ON insights
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE insights.project_id = p.id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM versions v
      JOIN projects p ON v.project_id = p.id
      WHERE insights.version_id = v.id
      AND p.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insights_project_id ON insights(project_id);
CREATE INDEX IF NOT EXISTS idx_insights_job_id ON insights(job_id);

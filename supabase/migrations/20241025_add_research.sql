-- Create insight_jobs table for research pipeline
CREATE TABLE insight_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  insight_data JSONB,
  artifacts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_insight_jobs_user_id ON insight_jobs(user_id);
CREATE INDEX idx_insight_jobs_project_id ON insight_jobs(project_id);
CREATE INDEX idx_insight_jobs_status ON insight_jobs(status);
CREATE INDEX idx_insight_jobs_created_at ON insight_jobs(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_insight_jobs_updated_at 
    BEFORE UPDATE ON insight_jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for insight_jobs
ALTER TABLE insight_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insight jobs" ON insight_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insight jobs" ON insight_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insight jobs" ON insight_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insight jobs" ON insight_jobs
  FOR DELETE USING (auth.uid() = user_id);

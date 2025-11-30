-- Shepherd Engine: Clarity Sessions Table
-- Powers the Compass tool
-- Following Supabase best practices: https://supabase.com/docs/guides/database

-- Create clarity_sessions table
CREATE TABLE IF NOT EXISTS clarity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Input data
  idea TEXT NOT NULL,
  target_user TEXT,
  additional_context TEXT,
  
  -- Output data (stored as JSONB for flexibility)
  problem_statement TEXT,
  target_user_output TEXT,
  jobs_to_be_done JSONB DEFAULT '[]'::jsonb,
  opportunity_gap TEXT,
  value_hypotheses JSONB DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  
  -- Full output for reference
  full_output JSONB,
  
  -- Metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processing_time_ms INTEGER,
  model_used TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_clarity_sessions_user_id ON clarity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_clarity_sessions_created_at ON clarity_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clarity_sessions_status ON clarity_sessions(status);

-- Enable Row Level Security
ALTER TABLE clarity_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own clarity sessions
CREATE POLICY "Users can view their own clarity sessions"
  ON clarity_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clarity sessions"
  ON clarity_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clarity sessions"
  ON clarity_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clarity sessions"
  ON clarity_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clarity_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clarity_sessions_updated_at
  BEFORE UPDATE ON clarity_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_clarity_sessions_updated_at();

-- Comment for documentation
COMMENT ON TABLE clarity_sessions IS 'Stores clarity analysis sessions from Shepherd Compass. Each session represents a founder''s idea being transformed into actionable clarity.';

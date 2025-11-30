-- Shepherd Engine: Research Sessions Table
-- Powers the Muse tool
-- Following Supabase best practices: https://supabase.com/docs/guides/database

-- Create research_sessions table
CREATE TABLE IF NOT EXISTS research_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clarity_session_id UUID REFERENCES clarity_sessions(id) ON DELETE SET NULL,
  
  -- Input data
  competitor_urls JSONB DEFAULT '[]'::jsonb,
  additional_context TEXT,
  research_type TEXT DEFAULT 'full' CHECK (research_type IN ('full', 'quick')),
  
  -- Personas output
  personas JSONB DEFAULT '[]'::jsonb,
  
  -- Pain map output
  pain_map JSONB DEFAULT '[]'::jsonb,
  
  -- Emotional journey output
  emotional_journey JSONB DEFAULT '[]'::jsonb,
  
  -- Insights output
  insights JSONB DEFAULT '[]'::jsonb,
  
  -- Competitor gaps output
  competitor_gaps JSONB DEFAULT '[]'::jsonb,
  
  -- Full output for reference
  full_output JSONB,
  
  -- Raw research data (for debugging/reference)
  raw_research_data TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'researching', 'synthesizing', 'completed', 'failed')),
  error_message TEXT,
  processing_time_ms INTEGER,
  model_used TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_clarity_id ON research_sessions(clarity_session_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_created_at ON research_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_sessions_status ON research_sessions(status);

-- Enable Row Level Security
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own research sessions
CREATE POLICY "Users can view their own research sessions"
  ON research_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own research sessions"
  ON research_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research sessions"
  ON research_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research sessions"
  ON research_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_research_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER research_sessions_updated_at
  BEFORE UPDATE ON research_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_research_sessions_updated_at();

-- Comment for documentation
COMMENT ON TABLE research_sessions IS 'Stores research synthesis sessions from Shepherd Muse. Each session transforms clarity into deep user understanding through persona synthesis and pain mapping.';

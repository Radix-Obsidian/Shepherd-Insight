-- Shepherd Engine: Blueprint Sessions Table
-- Powers the Blueprint tool
-- Following Supabase best practices: https://supabase.com/docs/guides/database

-- Create blueprint_sessions table
CREATE TABLE IF NOT EXISTS blueprint_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clarity_session_id UUID REFERENCES clarity_sessions(id) ON DELETE SET NULL,
  research_session_id UUID REFERENCES research_sessions(id) ON DELETE SET NULL,
  
  -- Vision & Scope
  product_vision TEXT,
  mvp_scope TEXT,
  core_value TEXT,
  
  -- Features output
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Roadmap output
  roadmap JSONB DEFAULT '[]'::jsonb,
  
  -- Success metrics output
  success_metrics JSONB DEFAULT '[]'::jsonb,
  
  -- Risks output
  risks JSONB DEFAULT '[]'::jsonb,
  
  -- Launch checklist
  launch_checklist JSONB DEFAULT '[]'::jsonb,
  
  -- Full output for reference
  full_output JSONB,
  
  -- Metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  processing_time_ms INTEGER,
  model_used TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blueprint_sessions_user_id ON blueprint_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_sessions_clarity_id ON blueprint_sessions(clarity_session_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_sessions_research_id ON blueprint_sessions(research_session_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_sessions_created_at ON blueprint_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprint_sessions_status ON blueprint_sessions(status);

-- Enable Row Level Security
ALTER TABLE blueprint_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own blueprint sessions
CREATE POLICY "Users can view their own blueprint sessions"
  ON blueprint_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blueprint sessions"
  ON blueprint_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blueprint sessions"
  ON blueprint_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blueprint sessions"
  ON blueprint_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blueprint_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blueprint_sessions_updated_at
  BEFORE UPDATE ON blueprint_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_blueprint_sessions_updated_at();

-- Comment for documentation
COMMENT ON TABLE blueprint_sessions IS 'Stores MVP blueprint sessions from Shepherd Blueprint. Each session transforms user understanding into actionable build plans with prioritized features and roadmaps.';

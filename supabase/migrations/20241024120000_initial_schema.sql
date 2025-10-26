-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create versions table
CREATE TABLE IF NOT EXISTS versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  audience TEXT NOT NULL,
  problem TEXT NOT NULL,
  why_current_fails TEXT NOT NULL,
  promise TEXT NOT NULL,
  must_haves TEXT[] NOT NULL DEFAULT '{}',
  not_now TEXT[] NOT NULL DEFAULT '{}',
  constraints TEXT NOT NULL,
  locked_decisions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insights table (for future AI-generated content)
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE NOT NULL,
  content JSONB NOT NULL,
  ai_analysis JSONB,
  competitor_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for versions
CREATE POLICY "Users can view versions of their projects" ON versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = versions.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for their projects" ON versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = versions.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update versions of their projects" ON versions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = versions.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete versions of their projects" ON versions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = versions.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for insights
CREATE POLICY "Users can view insights of their project versions" ON insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM versions v
      JOIN projects p ON v.project_id = p.id
      WHERE insights.version_id = v.id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create insights for their project versions" ON insights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM versions v
      JOIN projects p ON v.project_id = p.id
      WHERE insights.version_id = v.id
      AND p.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_project_id ON versions(project_id);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_version_id ON insights(version_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_versions_updated_at BEFORE UPDATE ON versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

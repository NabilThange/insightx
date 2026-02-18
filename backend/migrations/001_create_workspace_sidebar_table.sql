-- Migration 001: Create workspace_sidebar table
-- Consolidates all right sidebar data into a single table

-- Create workspace_sidebar table
CREATE TABLE IF NOT EXISTS workspace_sidebar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,
  
  -- Data DNA (moved from sessions.data_dna)
  data_dna JSONB,
  
  -- Context Analysis (consolidated from context_insights table)
  context_analysis JSONB,
  
  -- SQL Code Management
  current_sql_code TEXT,
  sql_code_history JSONB DEFAULT '[]'::jsonb,
  
  -- Python Code Management
  current_python_code TEXT,
  python_code_history JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relationships
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_sidebar_session_id ON workspace_sidebar(session_id);
CREATE INDEX IF NOT EXISTS idx_workspace_sidebar_created_at ON workspace_sidebar(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workspace_sidebar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workspace_sidebar_updated_at ON workspace_sidebar;
CREATE TRIGGER trigger_workspace_sidebar_updated_at
BEFORE UPDATE ON workspace_sidebar
FOR EACH ROW
EXECUTE FUNCTION update_workspace_sidebar_updated_at();

-- Enable Row Level Security
ALTER TABLE workspace_sidebar ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view workspace sidebar for their sessions
CREATE POLICY "Users can view workspace sidebar for their sessions"
  ON workspace_sidebar
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert workspace sidebar for their sessions
CREATE POLICY "Users can insert workspace sidebar for their sessions"
  ON workspace_sidebar
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update workspace sidebar for their sessions
CREATE POLICY "Users can update workspace sidebar for their sessions"
  ON workspace_sidebar
  FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete workspace sidebar for their sessions
CREATE POLICY "Users can delete workspace sidebar for their sessions"
  ON workspace_sidebar
  FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- Add comment to table
COMMENT ON TABLE workspace_sidebar IS 'Stores all right sidebar data including Data DNA, context analysis, and code history for each session';

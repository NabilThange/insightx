-- Create context_insights table to store dataset context analysis
-- This table stores the output from the Context Agent for each dataset

CREATE TABLE IF NOT EXISTS context_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  dataset_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  domain TEXT NOT NULL,
  key_entities TEXT[] NOT NULL DEFAULT '{}',
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  audience TEXT NOT NULL,
  business_value TEXT NOT NULL,
  data_health TEXT NOT NULL,
  key_insights TEXT[] NOT NULL DEFAULT '{}',
  recommended_analyses TEXT[] NOT NULL DEFAULT '{}',
  context_summary TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relationships
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create index for faster lookups by session_id
CREATE INDEX IF NOT EXISTS idx_context_insights_session_id ON context_insights(session_id);

-- Create index for faster lookups by dataset_name
CREATE INDEX IF NOT EXISTS idx_context_insights_dataset_name ON context_insights(dataset_name);

-- Create index for created_at for sorting
CREATE INDEX IF NOT EXISTS idx_context_insights_created_at ON context_insights(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_context_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_context_insights_updated_at ON context_insights;
CREATE TRIGGER trigger_context_insights_updated_at
BEFORE UPDATE ON context_insights
FOR EACH ROW
EXECUTE FUNCTION update_context_insights_updated_at();

-- Add RLS policies
ALTER TABLE context_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view context insights for their own sessions
CREATE POLICY "Users can view context insights for their sessions"
  ON context_insights
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert context insights for their own sessions
CREATE POLICY "Users can insert context insights for their sessions"
  ON context_insights
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update context insights for their own sessions
CREATE POLICY "Users can update context insights for their sessions"
  ON context_insights
  FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete context insights for their own sessions
CREATE POLICY "Users can delete context insights for their sessions"
  ON context_insights
  FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

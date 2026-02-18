-- Migration 004: Auto-create workspace_sidebar row when session is created
-- This ensures every new session automatically gets a workspace_sidebar row

-- Create function to auto-create workspace_sidebar
CREATE OR REPLACE FUNCTION auto_create_workspace_sidebar()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert workspace_sidebar row for the new session
  INSERT INTO workspace_sidebar (session_id, data_dna, created_at)
  VALUES (NEW.id, NEW.data_dna, NEW.created_at)
  ON CONFLICT (session_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on sessions table
DROP TRIGGER IF EXISTS trigger_auto_create_workspace_sidebar ON sessions;
CREATE TRIGGER trigger_auto_create_workspace_sidebar
AFTER INSERT ON sessions
FOR EACH ROW
EXECUTE FUNCTION auto_create_workspace_sidebar();

-- Also create a trigger to sync data_dna updates
CREATE OR REPLACE FUNCTION sync_data_dna_to_workspace_sidebar()
RETURNS TRIGGER AS $$
BEGIN
  -- Update workspace_sidebar when data_dna is updated in sessions
  IF NEW.data_dna IS DISTINCT FROM OLD.data_dna THEN
    UPDATE workspace_sidebar
    SET 
      data_dna = NEW.data_dna,
      updated_at = NOW()
    WHERE session_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data_dna sync
DROP TRIGGER IF EXISTS trigger_sync_data_dna_to_workspace_sidebar ON sessions;
CREATE TRIGGER trigger_sync_data_dna_to_workspace_sidebar
AFTER UPDATE ON sessions
FOR EACH ROW
WHEN (OLD.data_dna IS DISTINCT FROM NEW.data_dna)
EXECUTE FUNCTION sync_data_dna_to_workspace_sidebar();

-- Add comment
COMMENT ON FUNCTION auto_create_workspace_sidebar() IS 'Automatically creates workspace_sidebar row when a new session is created';
COMMENT ON FUNCTION sync_data_dna_to_workspace_sidebar() IS 'Automatically syncs data_dna from sessions to workspace_sidebar';

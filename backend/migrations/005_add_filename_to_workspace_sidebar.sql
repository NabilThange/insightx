-- Migration 005: Add filename column to workspace_sidebar
-- This allows quick access to the dataset filename without joining to sessions table

-- Add filename column
ALTER TABLE workspace_sidebar
ADD COLUMN IF NOT EXISTS filename TEXT;

-- Backfill filename from sessions table
UPDATE workspace_sidebar ws
SET filename = s.filename
FROM sessions s
WHERE ws.session_id = s.id AND ws.filename IS NULL;

-- Add NOT NULL constraint after backfill
ALTER TABLE workspace_sidebar
ALTER COLUMN filename SET NOT NULL;

-- Create trigger to sync filename when sessions.filename is updated
CREATE OR REPLACE FUNCTION sync_filename_to_workspace_sidebar()
RETURNS TRIGGER AS $$
BEGIN
  -- Update workspace_sidebar when filename is updated in sessions
  IF NEW.filename IS DISTINCT FROM OLD.filename THEN
    UPDATE workspace_sidebar
    SET 
      filename = NEW.filename,
      updated_at = NOW()
    WHERE session_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for filename sync
DROP TRIGGER IF EXISTS trigger_sync_filename_to_workspace_sidebar ON sessions;
CREATE TRIGGER trigger_sync_filename_to_workspace_sidebar
AFTER UPDATE ON sessions
FOR EACH ROW
WHEN (OLD.filename IS DISTINCT FROM NEW.filename)
EXECUTE FUNCTION sync_filename_to_workspace_sidebar();

-- Also update the auto_create_workspace_sidebar function to include filename
CREATE OR REPLACE FUNCTION auto_create_workspace_sidebar()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert workspace_sidebar row for the new session with filename
  INSERT INTO workspace_sidebar (session_id, data_dna, filename, created_at)
  VALUES (NEW.id, NEW.data_dna, NEW.filename, NEW.created_at)
  ON CONFLICT (session_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify the migration
DO $$
DECLARE
  total_rows INTEGER;
  rows_with_filename INTEGER;
  rows_without_filename INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rows FROM workspace_sidebar;
  SELECT COUNT(*) INTO rows_with_filename FROM workspace_sidebar WHERE filename IS NOT NULL;
  SELECT COUNT(*) INTO rows_without_filename FROM workspace_sidebar WHERE filename IS NULL;
  
  RAISE NOTICE 'Filename Migration Summary:';
  RAISE NOTICE '  Total workspace_sidebar rows: %', total_rows;
  RAISE NOTICE '  Rows with filename: %', rows_with_filename;
  RAISE NOTICE '  Rows without filename: %', rows_without_filename;
  
  IF rows_without_filename > 0 THEN
    RAISE WARNING 'Some rows still missing filename!';
  ELSE
    RAISE NOTICE '✅ All rows have filename populated';
  END IF;
END $$;

-- Add comment to column
COMMENT ON COLUMN workspace_sidebar.filename IS 'Dataset filename, synced from sessions table';

-- Migration 003: Backfill workspace_sidebar for all existing sessions
-- This ensures every session has a corresponding workspace_sidebar row

-- Insert workspace_sidebar rows for sessions that don't have one yet
INSERT INTO workspace_sidebar (session_id, data_dna, created_at)
SELECT 
  s.id as session_id,
  s.data_dna,
  s.created_at
FROM sessions s
WHERE NOT EXISTS (
  SELECT 1 FROM workspace_sidebar ws WHERE ws.session_id = s.id
)
ON CONFLICT (session_id) DO NOTHING;

-- Verify the backfill
DO $$
DECLARE
  sessions_count INTEGER;
  workspace_sidebar_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO sessions_count FROM sessions;
  SELECT COUNT(*) INTO workspace_sidebar_count FROM workspace_sidebar;
  SELECT COUNT(*) INTO missing_count 
  FROM sessions s 
  WHERE NOT EXISTS (SELECT 1 FROM workspace_sidebar ws WHERE ws.session_id = s.id);
  
  RAISE NOTICE 'Backfill Summary:';
  RAISE NOTICE '  Total sessions: %', sessions_count;
  RAISE NOTICE '  Workspace sidebar rows: %', workspace_sidebar_count;
  RAISE NOTICE '  Missing rows: %', missing_count;
  
  IF missing_count > 0 THEN
    RAISE WARNING 'Some sessions still missing workspace_sidebar rows!';
  ELSE
    RAISE NOTICE '✅ All sessions have workspace_sidebar rows';
  END IF;
END $$;

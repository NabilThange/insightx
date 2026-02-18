-- Migration 006: Fix duplicate foreign key constraints
-- Removes duplicate FK constraints on workspace_sidebar and context_insights

-- First, check for duplicate constraints
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT constraint_name, COUNT(*) as cnt
    FROM information_schema.table_constraints
    WHERE table_name IN ('workspace_sidebar', 'context_insights')
      AND constraint_type = 'FOREIGN KEY'
    GROUP BY constraint_name
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Found % duplicate foreign key constraints', duplicate_count;
  ELSE
    RAISE NOTICE 'No duplicate foreign key constraints found';
  END IF;
END $$;

-- Drop all FK constraints on workspace_sidebar.session_id
DO $$
DECLARE
  constraint_rec RECORD;
BEGIN
  FOR constraint_rec IN 
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'workspace_sidebar'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%session%'
  LOOP
    EXECUTE format('ALTER TABLE workspace_sidebar DROP CONSTRAINT IF EXISTS %I', constraint_rec.constraint_name);
    RAISE NOTICE 'Dropped constraint: %', constraint_rec.constraint_name;
  END LOOP;
END $$;

-- Drop all FK constraints on context_insights.session_id
DO $$
DECLARE
  constraint_rec RECORD;
BEGIN
  FOR constraint_rec IN 
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'context_insights'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%session%'
  LOOP
    EXECUTE format('ALTER TABLE context_insights DROP CONSTRAINT IF EXISTS %I', constraint_rec.constraint_name);
    RAISE NOTICE 'Dropped constraint: %', constraint_rec.constraint_name;
  END LOOP;
END $$;

-- Re-create FK constraints properly (only once)
ALTER TABLE workspace_sidebar
ADD CONSTRAINT workspace_sidebar_session_id_fkey 
FOREIGN KEY (session_id) 
REFERENCES sessions(id) 
ON DELETE CASCADE;

ALTER TABLE context_insights
ADD CONSTRAINT context_insights_session_id_fkey 
FOREIGN KEY (session_id) 
REFERENCES sessions(id) 
ON DELETE CASCADE;

-- Verify the fix
DO $$
DECLARE
  ws_fk_count INTEGER;
  ci_fk_count INTEGER;
BEGIN
  -- Count FK constraints on workspace_sidebar
  SELECT COUNT(*) INTO ws_fk_count
  FROM information_schema.table_constraints
  WHERE table_name = 'workspace_sidebar'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%session%';
  
  -- Count FK constraints on context_insights
  SELECT COUNT(*) INTO ci_fk_count
  FROM information_schema.table_constraints
  WHERE table_name = 'context_insights'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%session%';
  
  RAISE NOTICE 'Verification Results:';
  RAISE NOTICE '  workspace_sidebar FK constraints: %', ws_fk_count;
  RAISE NOTICE '  context_insights FK constraints: %', ci_fk_count;
  
  IF ws_fk_count = 1 AND ci_fk_count = 1 THEN
    RAISE NOTICE '✅ Foreign key constraints fixed successfully';
  ELSE
    RAISE WARNING '⚠️ Unexpected FK constraint count - manual review needed';
  END IF;
END $$;

-- Add comments
COMMENT ON CONSTRAINT workspace_sidebar_session_id_fkey ON workspace_sidebar IS 'Foreign key to sessions table';
COMMENT ON CONSTRAINT context_insights_session_id_fkey ON context_insights IS 'Foreign key to sessions table';

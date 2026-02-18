-- Migration 002: Migrate existing data to workspace_sidebar
-- Moves data_dna from sessions and context_insights data

-- Step 1: Migrate existing data_dna from sessions to workspace_sidebar
INSERT INTO workspace_sidebar (session_id, data_dna, created_at)
SELECT 
  id as session_id, 
  data_dna, 
  created_at
FROM sessions
WHERE data_dna IS NOT NULL
ON CONFLICT (session_id) DO UPDATE
SET 
  data_dna = EXCLUDED.data_dna,
  updated_at = NOW();

-- Step 2: Migrate existing context_insights to workspace_sidebar
-- This updates existing rows or creates new ones if they don't exist
INSERT INTO workspace_sidebar (session_id, context_analysis, created_at)
SELECT 
  ci.session_id,
  jsonb_build_object(
    'dataset_name', ci.dataset_name,
    'purpose', ci.purpose,
    'domain', ci.domain,
    'key_entities', ci.key_entities,
    'use_cases', ci.use_cases,
    'audience', ci.audience,
    'business_value', ci.business_value,
    'data_health', ci.data_health,
    'key_insights', ci.key_insights,
    'recommended_analyses', ci.recommended_analyses,
    'context_summary', ci.context_summary,
    'analyzed_at', ci.created_at
  ) as context_analysis,
  ci.created_at
FROM context_insights ci
ON CONFLICT (session_id) DO UPDATE
SET 
  context_analysis = EXCLUDED.context_analysis,
  updated_at = NOW();

-- Step 3: Verify migration
-- Count records in each table
DO $$
DECLARE
  sessions_count INTEGER;
  context_insights_count INTEGER;
  workspace_sidebar_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO sessions_count FROM sessions WHERE data_dna IS NOT NULL;
  SELECT COUNT(*) INTO context_insights_count FROM context_insights;
  SELECT COUNT(*) INTO workspace_sidebar_count FROM workspace_sidebar;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  Sessions with data_dna: %', sessions_count;
  RAISE NOTICE '  Context insights: %', context_insights_count;
  RAISE NOTICE '  Workspace sidebar records: %', workspace_sidebar_count;
END $$;

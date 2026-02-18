# Workspace Sidebar - Complete Debug & Fix

## Three Compounding Bugs Identified

### Bug #1: Silent Error Logging ✅ FIXED
**Problem:** Supabase errors logged as `{}` instead of actual error details

**Fix Applied:**
- Updated all error logging in `lib/db/sidebar.ts` to properly extract Supabase error fields
- Now logs: `code`, `message`, `details`, `hint`, and full JSON stringification

**Files Changed:**
- `lib/db/sidebar.ts` - Lines 75, 109, and all error handlers

---

### Bug #2: Duplicate FK Constraints ⚠️ NEEDS MIGRATION
**Problem:** `workspace_sidebar.session_id` has 4 duplicate FK constraints

**Evidence from Schema:**
```
public,workspace_sidebar,session_id,2,uuid,...,fk_session
public,workspace_sidebar,session_id,2,uuid,...,fk_session  ← DUPLICATE
public,workspace_sidebar,session_id,2,uuid,...,fk_session  ← DUPLICATE
public,workspace_sidebar,session_id,2,uuid,...,fk_session  ← DUPLICATE
```

**Fix Created:**
- Migration `006_fix_duplicate_fk_constraints.sql`
- Drops all duplicate FK constraints
- Re-creates single clean FK constraint
- Verifies the fix

**Action Required:**
```sql
-- Run this in Supabase SQL Editor:
-- backend/migrations/006_fix_duplicate_fk_constraints.sql
```

---

### Bug #3: Markdown-Wrapped JSON Parser ✅ FIXED
**Problem:** Context agent returns JSON wrapped in markdown code fences

**Evidence:**
```
Failed to parse context agent response: SyntaxError: Unexpected token '`'
"```json\n{...}\n```" is not valid JSON
```

**Fix Applied:**
- Updated `app/api/agents/context/route.ts` line 45
- Now strips markdown code fences before parsing
- Has fallback with aggressive cleaning
- Better error logging

**Files Changed:**
- `app/api/agents/context/route.ts`

---

## Verification Steps

### 1. Check Error Logs (After Refresh)
Open browser console and look for detailed error logs:
```
❌ [SidebarService] Error initializing sidebar: {
  "code": "...",
  "message": "...",
  "details": "...",
  "hint": "..."
}
```

### 2. Run FK Constraint Check
```sql
-- In Supabase SQL Editor
SELECT 
  table_name,
  constraint_name,
  COUNT(*) as count
FROM information_schema.table_constraints
WHERE table_name IN ('workspace_sidebar', 'context_insights')
  AND constraint_type = 'FOREIGN KEY'
GROUP BY table_name, constraint_name
HAVING COUNT(*) > 1;
```

Expected: No rows (no duplicates)

### 3. Verify Context Analysis Data
```sql
-- Check if context_analysis is valid JSON
SELECT 
  session_id,
  filename,
  context_analysis IS NOT NULL as has_context,
  jsonb_typeof(context_analysis) as context_type,
  context_analysis->>'dataset_name' as dataset_name
FROM workspace_sidebar
WHERE context_analysis IS NOT NULL
LIMIT 5;
```

Expected: `context_type` should be "object", not null

### 4. Test Sidebar Loading
1. Open workspace page
2. Check console for logs:
   ```
   🔄 [WorkspaceRightSidebar] Loading sidebar data...
   ✅ [WorkspaceRightSidebar] Sidebar data loaded: Yes
   📊 [WorkspaceRightSidebar] Data DNA exists: Yes
   ```
3. Click Data DNA tab → Should display
4. Click Context tab → Should trigger analysis

---

## Root Cause Analysis

### Why "No data available" Was Showing

1. **Initial Load Fails:**
   - `getSidebar()` tries to read workspace_sidebar
   - Row doesn't exist (PGRST116 error)
   - Tries to create row via `initializeSidebar()`
   - Insert fails due to duplicate FK constraints
   - Error logged as `{}` (not helpful)
   - Returns `null`

2. **Component Renders:**
   - `sidebarData` is `null`
   - Old code showed "No data available" globally
   - Fixed: Now each panel handles its own empty state

3. **Context Agent:**
   - Returns JSON wrapped in markdown
   - Parser fails on first attempt
   - Fallback strips markdown and succeeds
   - But may save malformed data

### The Fix Chain

```
Fix #1: Better Error Logging
  ↓
Reveals actual Supabase error
  ↓
Fix #2: Clean Duplicate FK Constraints
  ↓
Allows successful insert/upsert
  ↓
Fix #3: Better JSON Parser
  ↓
Saves clean context data
  ↓
Sidebar loads and displays correctly
```

---

## Files Modified

### Frontend
1. `lib/db/sidebar.ts` - Enhanced error logging throughout
2. `app/api/agents/context/route.ts` - Fixed JSON parser
3. `components/workspace/WorkspaceRightSidebar.tsx` - Removed global "No data" check

### Database
1. `backend/migrations/006_fix_duplicate_fk_constraints.sql` - Clean FK constraints

---

## Testing Checklist

- [ ] Run migration 006 in Supabase
- [ ] Verify no duplicate FK constraints
- [ ] Refresh workspace page
- [ ] Check console for detailed error logs (if any)
- [ ] Click Data DNA tab → Should show dataset profile
- [ ] Click SQL tab → Should show empty state
- [ ] Click Python tab → Should show empty state
- [ ] Click Context tab → Should trigger analysis and display
- [ ] Verify context_analysis saved to database
- [ ] Refresh page → Context should persist

---

## Expected Console Output (Success)

```
🔄 [WorkspaceRightSidebar] Loading sidebar data for session: 252af524...
📝 [SidebarService] No workspace_sidebar row found, creating one...
🔧 [SidebarService] Initializing sidebar with: {
  sessionId: "252af524...",
  hasDataDNA: true,
  filename: "TEST_DATASET.csv"
}
✅ [SidebarService] Sidebar initialized successfully: 60ca1f5e...
✅ [WorkspaceRightSidebar] Sidebar data loaded: Yes
📊 [WorkspaceRightSidebar] Data DNA exists: Yes
🔍 [WorkspaceRightSidebar] SQL code exists: No
🐍 [WorkspaceRightSidebar] Python code exists: No
🧠 [WorkspaceRightSidebar] Context exists: No
```

---

## If Still Failing

Check these in order:

1. **RLS Policies** - User may not have permission
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'workspace_sidebar';
   ```

2. **Session Exists** - Verify session_id is valid
   ```sql
   SELECT id, filename FROM sessions WHERE id = 'YOUR_SESSION_ID';
   ```

3. **Supabase Client** - Check if authenticated
   ```javascript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('Current user:', user);
   ```

4. **Network Tab** - Check for failed requests
   - Look for 400/500 errors
   - Check request/response payloads

---

## Summary

✅ Enhanced error logging to surface real issues
✅ Fixed JSON parser to handle markdown-wrapped responses
⚠️ Created migration to fix duplicate FK constraints (needs to be run)
✅ Improved component to handle empty states gracefully

**Next Step:** Run migration 006 in Supabase SQL Editor

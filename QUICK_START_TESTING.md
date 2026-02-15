# 🚀 Quick Start Testing Guide

## Start Here

```bash
cd insightx-app
npm run dev
```

Then open: http://localhost:3000

---

## 3 Quick Tests

### Test 1: View Session with Chats (30 seconds)
**URL:** http://localhost:3000/workspace/f3ccc67c-dd05-4e4c-bdea-a298c754375e

**What to check:**
- ✅ Page loads (no redirect to /connect)
- ✅ Left sidebar shows 3 chats
- ✅ Click each chat to see messages
- ✅ Right sidebar shows Data DNA

---

### Test 2: Create New Session (1 minute)
**URL:** http://localhost:3000/connect

**Steps:**
1. Click "Sample Dataset" tab
2. Click "Generate & Load Sample"
3. Wait for scanning animation
4. Click "Continue to Workspace"

**What to check:**
- ✅ Redirects to `/workspace/[uuid]` (not back to /connect)
- ✅ Workspace loads successfully
- ✅ Can send a message
- ✅ Message appears in chat

---

### Test 3: View All Sessions (15 seconds)
**URL:** http://localhost:3000/reports

**What to check:**
- ✅ Shows 5+ sessions
- ✅ Each has filename, status, row count
- ✅ Click any session → opens workspace

---

## Verify in Supabase

**Dashboard:** https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo

1. Click "Table Editor"
2. Check tables:
   - **sessions** → Should have 5+ rows
   - **chats** → Should have 3+ rows
   - **messages** → Should have 10+ rows

---

## Run Automated Test

```bash
npx tsx test-session-flow.ts
```

Should output: `🎉 All tests passed!`

---

## Test URLs

| Description | URL |
|-------------|-----|
| Session with chats | http://localhost:3000/workspace/f3ccc67c-dd05-4e4c-bdea-a298c754375e |
| Empty session | http://localhost:3000/workspace/fa356267-045a-44d8-a3ec-a8ea15169879 |
| All sessions | http://localhost:3000/reports |
| Create new | http://localhost:3000/connect |
| Invalid session | http://localhost:3000/workspace/invalid-id |

---

## Expected Behavior

### ✅ Working
- Upload creates session in Supabase
- Workspace loads without redirect
- Chats appear in sidebar
- Messages persist in database
- URLs use UUIDs (modern format)

### ❌ Not Working (Expected)
- AI responses (backend not built yet)
- File storage (not implemented)
- Real-time updates (not configured)

---

## Troubleshooting

### Workspace redirects to /connect
- Check browser console for errors
- Verify session exists in Supabase
- Try the test URL: http://localhost:3000/workspace/f3ccc67c-dd05-4e4c-bdea-a298c754375e

### No chats in sidebar
- Check that session has chats in Supabase
- Try sending a message to create first chat
- Refresh the page

### Can't send messages
- Check browser console for errors
- Verify `.env.local` has correct Supabase credentials
- Check Supabase project is active

---

## Success! ✅

If all 3 tests pass, you're ready to:
1. Build the FastAPI backend
2. Connect AI orchestrator
3. Add file storage
4. Deploy to production

**Everything is working!** 🎉

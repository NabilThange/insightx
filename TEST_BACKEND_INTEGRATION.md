# Test Backend Integration

## Quick Test (5 minutes)

### 1. Start Frontend
```bash
cd insightx-app
npm run dev
```

Open: `http://localhost:3000`

### 2. Test Upload Flow

1. Navigate to `/connect`
2. Drop a CSV file (or use sample data button)
3. Watch for:
   - ✅ Scanning animation starts
   - ✅ Console shows: "Upload response: { session_id, ... }"
   - ✅ Console shows: "Session status: exploring"
   - ✅ Console shows: "Session status: ready"
   - ✅ Data DNA preview appears
4. Click "Continue to Workspace"
5. URL should change to `/workspace/{session_id}`

### 3. Test Chat Flow

1. You should see:
   - ✅ Dataset badge with filename
   - ✅ Suggested query chips
   - ✅ Empty chat input
2. Type a message: "Show me the data"
3. Press Enter
4. Watch for:
   - ✅ URL updates to `/workspace/{session_id}?chat={chat_id}`
   - ✅ Your message appears
   - ✅ AI response appears (stubbed text)
5. Type another message
6. Watch for:
   - ✅ Message appears
   - ✅ Response appears
   - ✅ Chat history persists

### 4. Test Persistence

1. Refresh the page (F5)
2. You should see:
   - ✅ Same session loads
   - ✅ Same chat loads
   - ✅ All messages intact
3. Close the tab
4. Reopen `http://localhost:3000/workspace`
5. You should:
   - ✅ Auto-redirect to your session
   - ✅ See your chat history

## Network Inspection

Open DevTools → Network tab

### Expected Requests

#### On Upload
```
POST https://insightx-bkend.onrender.com/api/upload
Status: 200
Response: { session_id, filename, row_count, status: "exploring" }

POST https://insightx-bkend.onrender.com/api/explore/{session_id}
Status: 200
Response: { session_id, status: "ready", data_dna: {...} }

GET https://insightx-bkend.onrender.com/api/session/{session_id}
Status: 200
Response: { id, filename, data_dna, status: "ready", ... }
(This will be called multiple times while polling)
```

#### On Workspace Load
```
GET https://insightx-bkend.onrender.com/api/session/{session_id}
Status: 200

GET https://insightx-bkend.onrender.com/api/chats/{session_id}
Status: 200
Response: [{ id, session_id, title, created_at }, ...]
```

#### On First Message
```
POST https://insightx-bkend.onrender.com/api/chats
Status: 200
Response: { id, session_id, title, created_at }

POST https://insightx-bkend.onrender.com/api/messages
Status: 200
Response: { id, chat_id, role: "user", content, created_at }

POST https://insightx-bkend.onrender.com/api/chat/stream
Status: 200
Response: { id, chat_id, role: "assistant", content, created_at }

GET https://insightx-bkend.onrender.com/api/messages/{chat_id}
Status: 200
Response: [{ id, chat_id, role, content, created_at }, ...]
```

## Console Logs

### Expected Logs

```javascript
// On upload
"Upload response:" { session_id: "abc-123", filename: "data.csv", row_count: 1000, status: "exploring" }

// During polling
"Session status: exploring"
"Session status: exploring"
"Session status: ready"

// On workspace load
"Session loaded:" { id: "abc-123", filename: "data.csv", data_dna: {...} }

// On first message
"Chat created:" { id: "chat-xyz", session_id: "abc-123", title: "Show me the data" }
```

## localStorage Check

Open DevTools → Application → Local Storage → `http://localhost:3000`

You should see:
```
current_session_id: "abc-123-def-456"
```

## Common Issues

### Issue: "Failed to upload file"
**Check:**
- Is backend running? Visit `https://insightx-bkend.onrender.com/`
- Should return: `{ "status": "ok", "service": "InsightX Backend" }`

### Issue: "Session not found"
**Check:**
- localStorage has `current_session_id`
- Backend has the session in Supabase

### Issue: Stuck on "exploring"
**Check:**
- Backend logs for errors
- Parquet file created successfully
- Data DNA generation completed

### Issue: Messages not appearing
**Check:**
- Chat was created (check Network tab)
- Messages saved to backend
- GET /api/messages returns data

## Manual API Testing

### Test Backend Directly

```bash
# Health check
curl https://insightx-bkend.onrender.com/health

# Upload file
curl -X POST https://insightx-bkend.onrender.com/api/upload \
  -F "file=@sample.csv"

# Get session
curl https://insightx-bkend.onrender.com/api/session/{session_id}

# Create chat
curl -X POST https://insightx-bkend.onrender.com/api/chats \
  -H "Content-Type: application/json" \
  -d '{"session_id":"abc-123","title":"Test Chat"}'

# Create message
curl -X POST https://insightx-bkend.onrender.com/api/messages \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"chat-xyz","role":"user","content":"Hello"}'
```

## Success Checklist

- [ ] CSV uploads successfully
- [ ] Exploration completes (status → ready)
- [ ] Data DNA appears in preview
- [ ] Workspace loads with session data
- [ ] First message creates chat
- [ ] URL updates with chat ID
- [ ] Messages appear in chat
- [ ] AI responses appear (stubbed)
- [ ] Page refresh preserves state
- [ ] Chat history persists
- [ ] No console errors
- [ ] All network requests succeed (200 status)

## If Everything Works

You should be able to:
1. ✅ Upload a CSV
2. ✅ See real Data DNA from backend
3. ✅ Chat with the system
4. ✅ See messages persist
5. ✅ Refresh without losing data
6. ✅ Navigate between pages

**Next step**: Replace stubbed AI responses with real LLM + DuckDB + Python analysis!

## If Something Breaks

1. Check Network tab for failed requests
2. Check Console for error messages
3. Check localStorage for session_id
4. Test backend directly with curl
5. Check backend logs on Render/Railway
6. Verify Supabase has the data

---

**Ready to test?** Start the frontend and follow the steps above!

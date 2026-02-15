# /recents Page Guide

## Overview

The `/recents` page displays all sessions with their associated chats, providing a comprehensive view of your analysis history.

---

## Features

### 1. Session List
- Shows all sessions ordered by creation date (newest first)
- Displays session metadata:
  - Filename
  - Status (ready, exploring, uploading)
  - Row count
  - Creation time (relative: "2h ago", "3d ago")

### 2. Chat List per Session
- Each session shows its chats
- Displays chat title and creation time
- Shows count of chats per session
- Empty state for sessions without chats

### 3. Navigation
- **Click session header** → Opens workspace with that session
- **Click individual chat** → Opens workspace with that specific chat selected
- **Empty state button** → Redirects to /connect to upload data

---

## URL Structure

### Recents Page
```
/recents
```

### Navigation Targets
```
/workspace/[sessionId]              → Opens session (first chat selected)
/workspace/[sessionId]?chat=[chatId] → Opens session with specific chat
```

---

## Usage Examples

### Example 1: View All Sessions
```
URL: http://localhost:3000/recents

Shows:
- Sample Transactions (3 chats)
  - Transaction Analysis
  - Network Performance
  - Peak Hours Investigation
- User Behavior (0 chats)
- Sales Data Q1 (0 chats)
```

### Example 2: Click Session
```
User clicks: "Sample Transactions" header
Navigates to: /workspace/f3ccc67c-dd05-4e4c-bdea-a298c754375e
Result: Opens workspace with first chat selected
```

### Example 3: Click Specific Chat
```
User clicks: "Network Performance" chat
Navigates to: /workspace/f3ccc67c-dd05-4e4c-bdea-a298c754375e?chat=0566323a-2514-4daf-a2f4-4916f76c7650
Result: Opens workspace with "Network Performance" chat selected
```

---

## UI Components

### Session Card
```
┌─────────────────────────────────────────────┐
│ 📄 sample_transactions.csv                  │
│    [ready] • 250,000 rows • 2h ago          │
│                                             │
│ 💬 3 chats                                  │
│ ├─ Transaction Analysis (2h ago)           │
│ ├─ Network Performance (1h ago)            │
│ └─ Peak Hours Investigation (30m ago)      │
└─────────────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────────────┐
│                                             │
│              📄                             │
│         No sessions yet                     │
│  Upload a dataset to get started            │
│                                             │
│        [Upload Dataset]                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Status Badges

### Ready
- Color: Green
- Meaning: Session is ready for analysis
- Data DNA: Complete

### Exploring
- Color: Yellow
- Meaning: Session is being processed
- Data DNA: In progress

### Uploading
- Color: Blue
- Meaning: File is being uploaded
- Data DNA: Not started

---

## Time Formatting

Relative time display:
- `Just now` - Less than 1 minute
- `5m ago` - Minutes (< 60 minutes)
- `2h ago` - Hours (< 24 hours)
- `3d ago` - Days (< 7 days)
- `Feb 14` - Absolute date (> 7 days)

---

## Data Loading

### Load Sequence
1. Fetch all sessions from Supabase
2. For each session, fetch associated chats
3. Combine data and display

### Loading States
- Initial load: Shows spinner with "Loading your sessions..."
- Empty state: Shows "No sessions yet" with upload button
- Loaded: Shows session cards with chats

---

## Responsive Design

### Desktop (> 768px)
- Full session cards with all metadata
- Expanded chat lists
- Hover effects on cards and chats

### Mobile (< 768px)
- Compact session cards
- Reduced padding
- Touch-friendly tap targets

---

## Testing

### Test 1: View Recents Page
```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000/recents
```

**Expected:**
- ✅ Shows 5 sessions
- ✅ First session has 3 chats
- ✅ Other sessions show "No chats yet"
- ✅ Status badges display correctly
- ✅ Relative times display correctly

### Test 2: Click Session
```
1. Click "Sample Transactions" header
2. Should navigate to /workspace/[sessionId]
3. Workspace should load with first chat
```

### Test 3: Click Specific Chat
```
1. Click "Network Performance" chat
2. Should navigate to /workspace/[sessionId]?chat=[chatId]
3. Workspace should load with that specific chat selected
```

### Test 4: Empty State
```
1. Delete all sessions from Supabase
2. Visit /recents
3. Should show empty state
4. Click "Upload Dataset"
5. Should navigate to /connect
```

---

## Integration with Workspace

### Query Parameter Support
The workspace page now supports the `?chat=` query parameter:

```typescript
// URL: /workspace/[sessionId]?chat=[chatId]
const searchParams = useSearchParams();
const chatIdFromUrl = searchParams.get('chat');

// Auto-select chat from URL if provided
if (chatIdFromUrl && chats.some(c => c.id === chatIdFromUrl)) {
  setActiveChatId(chatIdFromUrl);
}
```

---

## API Calls

### Get Sessions
```typescript
const { sessions } = useSessions();
```

### Get Chats for Session
```typescript
const { data: chats } = await supabase
  .from('chats')
  .select('id, title, created_at')
  .eq('session_id', sessionId)
  .order('created_at', { ascending: false });
```

---

## Styling

### Color Scheme
- Background: `var(--bg)`
- Surface: `var(--bg-surface)`
- Border: `var(--stroke)`
- Text: `var(--fg)`
- Muted: `var(--text-muted)`

### Status Colors
- Ready: `rgba(34, 197, 94, 0.1)` / `rgb(34, 197, 94)`
- Exploring: `rgba(234, 179, 8, 0.1)` / `rgb(234, 179, 8)`
- Uploading: `rgba(59, 130, 246, 0.1)` / `rgb(59, 130, 246)`

---

## Files Created/Modified

### New Files
- ✅ `app/recents/page.tsx` - Main recents page component

### Modified Files
- ✅ `app/workspace/[id]/page.tsx` - Added query parameter support

---

## Quick Links

**Test URLs:**
- Recents page: http://localhost:3000/recents
- Session with chats: http://localhost:3000/workspace/f3ccc67c-dd05-4e4c-bdea-a298c754375e
- Specific chat: http://localhost:3000/workspace/f3ccc67c-dd05-4e4c-bdea-a298c754375e?chat=0566323a-2514-4daf-a2f4-4916f76c7650

**Supabase Dashboard:**
- Sessions: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo/editor/sessions
- Chats: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo/editor/chats

---

## Summary

✅ **Created `/recents` page** - Shows all sessions with chats  
✅ **Session navigation** - Click to open workspace  
✅ **Chat navigation** - Click to open specific chat  
✅ **Query parameter support** - Workspace handles `?chat=` parameter  
✅ **Responsive design** - Works on desktop and mobile  
✅ **Empty states** - Handles no sessions gracefully  
✅ **Loading states** - Shows spinner during data fetch  

**The recents page is ready to use!** 🚀

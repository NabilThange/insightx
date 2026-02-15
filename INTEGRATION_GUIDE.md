# Frontend Integration Guide

## Quick Start: Connecting Your Pages to Supabase

This guide shows you exactly how to replace mock data with real Supabase queries in your existing pages.

---

## 1. Connect Page (`app/connect/page.tsx`)

### Current State
- Mock file upload
- Fake data processing
- Local state only

### Integration Steps

```typescript
'use client';

import { useState } from 'react';
import { createSession, updateSessionDataDNA } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ConnectPage() {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleFileUpload(file: File) {
    setUploading(true);
    
    try {
      // Step 1: Create session in database
      const session = await createSession(file.name);
      console.log('Session created:', session.id);

      // Step 2: Process file (your existing logic)
      const dataDNA = await processFileLocally(file);
      
      // Step 3: Update session with Data DNA
      await updateSessionDataDNA(
        session.id,
        dataDNA,
        dataDNA.rowCount
      );

      // Step 4: Navigate to workspace
      router.push(`/workspace/${session.id}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  }

  // ... rest of component
}
```

---

## 2. Workspace Page (`app/workspace/[id]/page.tsx`)

### Current State
- Uses Zustand stores
- Mock chat data
- No persistence

### Integration Steps

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession, useChatsBySession, useMessages } from '@/lib/hooks';
import { createChat, createMessage } from '@/lib/api';

export default function WorkspacePage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  // Load session data
  const { session, loading: sessionLoading } = useSession(sessionId);
  
  // Load chats for this session
  const { chats, loading: chatsLoading, refetch: refetchChats } = useChatsBySession(sessionId);
  
  // Active chat state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // Load messages for active chat
  const { messages, loading: messagesLoading, refetch: refetchMessages } = useMessages(activeChatId);

  // Auto-select first chat or create new one
  useEffect(() => {
    if (!chatsLoading && chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, chatsLoading, activeChatId]);

  async function handleNewChat() {
    const chat = await createChat(sessionId, 'New Analysis');
    setActiveChatId(chat.id);
    refetchChats();
  }

  async function handleSendMessage(content: string) {
    if (!activeChatId) {
      // Create first chat if none exists
      const chat = await createChat(sessionId);
      setActiveChatId(chat.id);
      await createMessage(chat.id, 'user', content);
      refetchChats();
      refetchMessages();
      return;
    }

    // Add user message
    await createMessage(activeChatId, 'user', content);
    
    // TODO: Call backend API to get AI response
    // For now, add a fake response
    await createMessage(activeChatId, 'assistant', 'Processing your query...');
    
    refetchMessages();
  }

  if (sessionLoading) return <div>Loading session...</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div>
      {/* Left Sidebar - Chat List */}
      <aside>
        <button onClick={handleNewChat}>New Chat</button>
        {chats.map(chat => (
          <div 
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            className={activeChatId === chat.id ? 'active' : ''}
          >
            {chat.title}
          </div>
        ))}
      </aside>

      {/* Main Chat Area */}
      <main>
        {messagesLoading ? (
          <div>Loading messages...</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={msg.role}>
              {msg.content}
            </div>
          ))
        )}
        
        <ChatInput onSend={handleSendMessage} />
      </main>

      {/* Right Panel - Data DNA */}
      <aside>
        <h3>Data DNA</h3>
        <pre>{JSON.stringify(session.data_dna, null, 2)}</pre>
      </aside>
    </div>
  );
}
```

---

## 3. Reports Page (`app/reports/page.tsx`)

### Current State
- Mock report data
- No real sessions

### Integration Steps

```typescript
'use client';

import { useSessions } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const { sessions, loading, error } = useSessions();
  const router = useRouter();

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Your Sessions</h1>
      
      {sessions.length === 0 ? (
        <div>No sessions yet. Upload a file to get started!</div>
      ) : (
        <div className="grid">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => router.push(`/workspace/${session.id}`)}
              className="session-card"
            >
              <h3>{session.filename}</h3>
              <p>Status: {session.status}</p>
              <p>Rows: {session.row_count || 'Processing...'}</p>
              <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 4. Individual Report Page (`app/reports/[id]/page.tsx`)

### Integration Steps

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useSession, useChatsBySession } from '@/lib/hooks';

export default function ReportDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  const { session, loading } = useSession(sessionId);
  const { chats } = useChatsBySession(sessionId);

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Report not found</div>;

  return (
    <div>
      <h1>{session.filename}</h1>
      
      <section>
        <h2>Dataset Info</h2>
        <p>Rows: {session.row_count}</p>
        <p>Status: {session.status}</p>
        <p>Uploaded: {new Date(session.created_at).toLocaleDateString()}</p>
      </section>

      <section>
        <h2>Data DNA</h2>
        {session.data_dna ? (
          <div>
            <p>Columns: {session.data_dna.columnCount}</p>
            <p>Patterns: {session.data_dna.patterns?.length || 0}</p>
            <p>Insights: {session.data_dna.insights?.length || 0}</p>
          </div>
        ) : (
          <p>Data DNA not yet generated</p>
        )}
      </section>

      <section>
        <h2>Chats ({chats.length})</h2>
        {chats.map(chat => (
          <div key={chat.id}>
            <h3>{chat.title}</h3>
            <p>{new Date(chat.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## 5. Remove Zustand Persistence (Optional)

Since data is now in Supabase, you can simplify your Zustand stores to only handle UI state:

```typescript
// store/workspaceStore.ts - Keep as is (UI state only)

// store/dataStore.ts - Simplify to temporary state
export const useDataStore = create<DataState>((set) => ({
  activeDatasetId: null,
  dataDNA: null,
  
  setDataDNA: (dna) => set({ dataDNA: dna }),
  clearDataDNA: () => set({ dataDNA: null }),
}));
// Remove persist middleware

// store/chatStore.ts - Simplify to temporary state
export const useChatStore = create<ChatState>((set) => ({
  isStreaming: false,
  streamingMessageId: null,
  
  setStreaming: (isStreaming, messageId) => 
    set({ isStreaming, streamingMessageId: messageId || null }),
}));
// Remove persist middleware and data storage
```

---

## Testing the Integration

### 1. Test Connection
```bash
cd insightx-app
npm install tsx
npx tsx lib/test-connection.ts
```

You should see:
```
✅ Connection successful!
✅ Test session created
✅ Test chat created
✅ Test messages created
🎉 All tests passed!
```

### 2. Test in Browser
1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Upload a CSV file
4. Check browser console for session ID
5. Navigate to workspace
6. Send a message
7. Check Supabase dashboard to see data

### 3. View Data in Supabase
- Dashboard: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo
- Go to Table Editor
- View sessions, chats, messages tables

---

## Common Patterns

### Loading States
```typescript
const { data, loading, error } = useHook();

if (loading) return <Spinner />;
if (error) return <Error message={error.message} />;
if (!data) return <NotFound />;

return <YourComponent data={data} />;
```

### Optimistic Updates
```typescript
// Update UI immediately, then sync with DB
setLocalState(newValue);
await updateInDatabase(newValue);
refetch(); // Sync with server
```

### Error Handling
```typescript
try {
  await createMessage(chatId, 'user', content);
  refetch();
} catch (error) {
  console.error('Failed to send message:', error);
  toast.error('Failed to send message');
}
```

---

## Next Steps

1. ✅ Supabase connection established
2. ✅ API functions created
3. ✅ React hooks ready
4. 🔄 Update Connect page
5. 🔄 Update Workspace page
6. 🔄 Update Reports page
7. 🔄 Add error boundaries
8. 🔄 Add loading states
9. 🔄 Test end-to-end flow
10. 🔄 Build FastAPI backend

---

## Need Help?

- Check `SUPABASE_INTEGRATION.md` for API reference
- View `lib/api/*.ts` for function signatures
- Check `lib/hooks/*.ts` for hook usage
- Test connection with `lib/test-connection.ts`

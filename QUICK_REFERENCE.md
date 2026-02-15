# Quick Reference Card

## 🚀 Getting Started

### Test Connection
```bash
cd insightx-app
npx tsx lib/test-connection.ts
```

### Start Dev Server
```bash
npm run dev
```

---

## 📦 Import Statements

```typescript
// API Functions
import { 
  createSession, 
  getSession, 
  updateSessionDataDNA,
  createChat,
  createMessage,
  getMessagesByChat
} from '@/lib/api';

// React Hooks
import { 
  useSession, 
  useSessions,
  useChat,
  useChatsBySession,
  useMessages 
} from '@/lib/hooks';

// Supabase Client (if needed)
import { supabase } from '@/lib/supabase';
```

---

## 🔧 Common Operations

### Create Session
```typescript
const session = await createSession('data.csv');
// Returns: { id, user_id, filename, status, ... }
```

### Update Session with Data DNA
```typescript
await updateSessionDataDNA(sessionId, dataDNA, rowCount);
// Updates status to 'ready' and stores Data DNA
```

### Create Chat
```typescript
const chat = await createChat(sessionId, 'Analysis Title');
// Returns: { id, session_id, title, created_at }
```

### Send Message
```typescript
await createMessage(chatId, 'user', 'Show me trends');
await createMessage(chatId, 'assistant', 'Here are the trends...');
```

---

## 🎣 Using Hooks

### Load Session
```typescript
const { session, loading, error } = useSession(sessionId);

if (loading) return <Spinner />;
if (error) return <Error />;
return <div>{session.filename}</div>;
```

### Load All Sessions
```typescript
const { sessions, loading, refetch } = useSessions();

// Refresh data
refetch();
```

### Load Messages
```typescript
const { messages, loading, refetch } = useMessages(chatId);

// After sending message
await createMessage(chatId, 'user', content);
refetch(); // Refresh UI
```

---

## 🗄️ Database Schema

### sessions
- `id` (UUID) - Primary key
- `user_id` (UUID) - User identifier
- `filename` (TEXT) - File name
- `status` (TEXT) - 'uploading' | 'exploring' | 'ready'
- `data_dna` (JSONB) - Complete Data DNA object
- `row_count` (INTEGER) - Number of rows
- `created_at` (TIMESTAMP) - Creation time

### chats
- `id` (UUID) - Primary key
- `session_id` (UUID) - Foreign key to sessions
- `title` (TEXT) - Chat title
- `created_at` (TIMESTAMP) - Creation time

### messages
- `id` (UUID) - Primary key
- `chat_id` (UUID) - Foreign key to chats
- `role` (TEXT) - 'user' | 'assistant'
- `content` (TEXT) - Message content
- `created_at` (TIMESTAMP) - Creation time

---

## 🔗 Useful Links

**Supabase Dashboard:**  
https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo

**Table Editor:**  
View data: Dashboard → Table Editor

**SQL Editor:**  
Run queries: Dashboard → SQL Editor

---

## 📝 Example: Complete Upload Flow

```typescript
async function handleUpload(file: File) {
  // 1. Create session
  const session = await createSession(file.name);
  
  // 2. Process file
  const dataDNA = await processFile(file);
  
  // 3. Update session
  await updateSessionDataDNA(
    session.id, 
    dataDNA, 
    dataDNA.rowCount
  );
  
  // 4. Navigate
  router.push(`/workspace/${session.id}`);
}
```

---

## 📝 Example: Chat Component

```typescript
function ChatComponent({ sessionId }: { sessionId: string }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { chats, refetch: refetchChats } = useChatsBySession(sessionId);
  const { messages, refetch: refetchMessages } = useMessages(activeChatId);

  async function handleNewChat() {
    const chat = await createChat(sessionId);
    setActiveChatId(chat.id);
    refetchChats();
  }

  async function handleSendMessage(content: string) {
    if (!activeChatId) return;
    
    await createMessage(activeChatId, 'user', content);
    // TODO: Get AI response from backend
    await createMessage(activeChatId, 'assistant', 'Response...');
    refetchMessages();
  }

  return (
    <div>
      <button onClick={handleNewChat}>New Chat</button>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

---

## 🐛 Debugging

### Check Environment Variables
```bash
cat .env.local
```

### View Database Data
```typescript
// In browser console
const { data } = await supabase.from('sessions').select('*');
console.log(data);
```

### Check Project Status
Visit: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo

---

## 📚 Documentation Files

- `SUPABASE_INTEGRATION.md` - Complete API reference
- `INTEGRATION_GUIDE.md` - Step-by-step integration
- `ARCHITECTURE_DIAGRAM.md` - System architecture
- `SUPABASE_SETUP_COMPLETE.md` - Setup summary
- `QUICK_REFERENCE.md` - This file

---

## ✅ Checklist

- [x] Supabase connected
- [x] Tables created
- [x] API functions ready
- [x] React hooks ready
- [ ] Update Connect page
- [ ] Update Workspace page
- [ ] Update Reports page
- [ ] Test end-to-end flow
- [ ] Build backend API

---

**Need help?** Check the documentation files or test the connection!

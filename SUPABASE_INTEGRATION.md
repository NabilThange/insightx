# Supabase Integration Documentation

## Overview
This document describes the complete Supabase integration for InsightX, including database schema, API functions, and usage patterns.

## Database Schema

### Tables Created

#### 1. `sessions`
Stores uploaded dataset sessions and their analysis state.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  row_count INTEGER,
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'exploring', 'ready')),
  data_dna JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique session identifier
- `user_id`: User identifier (currently using 'anonymous' for no-auth mode)
- `filename`: Original uploaded file name
- `row_count`: Number of rows in the dataset
- `status`: Current processing status (uploading → exploring → ready)
- `data_dna`: JSONB column containing the complete Data DNA analysis
- `created_at`: Session creation timestamp

**Indexes:**
- `idx_sessions_user_id` on `user_id`
- `idx_sessions_status` on `status`

---

#### 2. `chats`
Stores chat conversations linked to sessions.

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique chat identifier
- `session_id`: Foreign key to sessions table
- `title`: Chat title (auto-generated from first message)
- `created_at`: Chat creation timestamp

**Indexes:**
- `idx_chats_session_id` on `session_id`

---

#### 3. `messages`
Stores individual messages within chats.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique message identifier
- `chat_id`: Foreign key to chats table
- `role`: Message sender ('user' or 'assistant')
- `content`: Message text content
- `created_at`: Message timestamp

**Indexes:**
- `idx_messages_chat_id` on `chat_id`
- `idx_messages_created_at` on `created_at`

---

#### 4. `users`
User table (created but not currently used - reserved for future auth).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Note:** RLS is enabled on this table. Other tables have RLS disabled for anonymous access.

---

## API Functions

### Sessions API (`lib/api/sessions.ts`)

```typescript
// Create a new session
createSession(filename: string, userId?: string): Promise<Session>

// Get session by ID
getSession(sessionId: string): Promise<Session>

// Update session status
updateSessionStatus(sessionId: string, status: 'uploading' | 'exploring' | 'ready'): Promise<Session>

// Update session with Data DNA
updateSessionDataDNA(sessionId: string, dataDNA: DataDNA, rowCount: number): Promise<Session>

// Get all sessions for user
getAllSessions(userId?: string): Promise<Session[]>

// Delete session
deleteSession(sessionId: string): Promise<void>
```

---

### Chats API (`lib/api/chats.ts`)

```typescript
// Create a new chat
createChat(sessionId: string, title?: string): Promise<Chat>

// Get chat by ID
getChat(chatId: string): Promise<Chat>

// Get all chats for a session
getChatsBySession(sessionId: string): Promise<Chat[]>

// Update chat title
updateChatTitle(chatId: string, title: string): Promise<Chat>

// Delete chat
deleteChat(chatId: string): Promise<void>
```

---

### Messages API (`lib/api/messages.ts`)

```typescript
// Create a new message
createMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<Message>

// Get all messages for a chat
getMessagesByChat(chatId: string): Promise<Message[]>

// Delete message
deleteMessage(messageId: string): Promise<void>

// Delete all messages for a chat
deleteMessagesByChat(chatId: string): Promise<void>
```

---

## React Hooks

### useSession
```typescript
const { session, loading, error } = useSession(sessionId);
```

### useSessions
```typescript
const { sessions, loading, error, refetch } = useSessions(userId);
```

### useChat
```typescript
const { chat, loading, error } = useChat(chatId);
```

### useChatsBySession
```typescript
const { chats, loading, error, refetch } = useChatsBySession(sessionId);
```

### useMessages
```typescript
const { messages, loading, error, refetch } = useMessages(chatId);
```

---

## Usage Examples

### 1. Upload Flow (Connect Page)

```typescript
import { createSession, updateSessionDataDNA } from '@/lib/api';

// Step 1: Create session on file upload
const session = await createSession(file.name);

// Step 2: Upload file to storage (implement separately)
// ... upload logic ...

// Step 3: Process file and generate Data DNA
const dataDNA = await processFile(file);

// Step 4: Update session with results
await updateSessionDataDNA(session.id, dataDNA, rowCount);
```

---

### 2. Workspace Flow

```typescript
import { createChat, createMessage } from '@/lib/api';
import { useMessages } from '@/lib/hooks';

// Create new chat when entering workspace
const chat = await createChat(sessionId, 'New Analysis');

// Send user message
await createMessage(chat.id, 'user', 'Show me sales trends');

// Add assistant response (from backend/AI)
await createMessage(chat.id, 'assistant', 'Here are the sales trends...');

// Display messages in UI
const { messages, loading } = useMessages(chat.id);
```

---

### 3. Session List (Reports Page)

```typescript
import { useSessions } from '@/lib/hooks';

function ReportsPage() {
  const { sessions, loading, error } = useSessions();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {sessions.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
```

---

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** These are already configured in your `.env.local` file.

---

## Security Notes

1. **No Authentication Required**: RLS is disabled on sessions, chats, and messages tables for anonymous access
2. **Anonymous User ID**: All operations use `userId = 'anonymous'` by default
3. **Future Auth**: The users table is ready for future authentication implementation
4. **Anon Key**: The public anon key is safe to expose in frontend code

---

## Data Flow

```
1. Upload CSV → Create Session (status: 'uploading')
2. Process File → Update Session (status: 'exploring')
3. Generate Data DNA → Update Session (status: 'ready', data_dna: {...})
4. Enter Workspace → Create Chat
5. User Query → Create Message (role: 'user')
6. AI Response → Create Message (role: 'assistant')
```

---

## Next Steps

### Immediate Integration Tasks:
1. Update `/app/connect/page.tsx` to use `createSession()` on file upload
2. Update `/app/workspace/[id]/page.tsx` to use `createChat()` and `createMessage()`
3. Update `/app/reports/page.tsx` to use `useSessions()` hook
4. Replace all Zustand mock data with real Supabase queries

### Backend Integration (Future):
1. Create FastAPI backend with the 6 routes mentioned in instructions
2. Connect file upload to Supabase Storage or R2
3. Implement Data DNA generation with pandas/DuckDB
4. Add AI orchestrator for chat responses

---

## Troubleshooting

### Connection Issues
- Verify `.env.local` variables are set correctly
- Check Supabase project status: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo
- Ensure project is in "ACTIVE_HEALTHY" status

### Query Errors
- Check browser console for detailed error messages
- Verify table names and column names match schema
- Ensure RLS policies allow anonymous access

### Type Errors
- Import types from `@/lib/api` files
- Use TypeScript strict mode for better type safety

---

## Project Information

- **Project Name**: InsightX
- **Project ID**: xvtqbvavwbowyyoevolo
- **Region**: ap-south-1 (Mumbai)
- **Status**: ACTIVE_HEALTHY
- **Database Version**: PostgreSQL 17.6.1

---

## Support

For Supabase-specific issues:
- Dashboard: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo
- Docs: https://supabase.com/docs
- API Reference: https://supabase.com/docs/reference/javascript/introduction

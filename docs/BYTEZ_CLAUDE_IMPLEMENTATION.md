# Ohm AI Infrastructure: The Complete Multi-Agent Manual

> **Version**: 2.0 (Deep Dive)
> **Target Audience**: Backend Engineers, AI Architects
> **Core Stack**: Next.js 15, Bytez API, OpenAI SDK, Supabase

This document is the definitive guide to the Ohm Multi-Agent System (MAS). It explains the "Hidden Architecture" that allows us to run a production-grade AI platform using a unified inference gateway and a sophisticated key rotation system.

---

## 1. The "Unified Inference" Architecture (Bytez + OpenAI)

Traditional AI apps use separate SDKs for Anthropic (`anthropic-sdk`), Google (`google-generative-ai`), and OpenAI (`openai`). This creates a maintenance nightmare.

**Ohm solution**: We use **ONLY** the `openai` NPM package to call **ALL** models.

### 1.1 The Protocol Paradox
How do we call `anthropic/claude-opus-4-5` using the `OpenAI` class?

1.  **Transport Layer**: We use the `openai` v6.x library.
2.  **Gateway**: We point the `baseURL` to `https://api.bytez.com/models/v2/openai/v1`.
3.  **Translation**: Bytez receives the OpenAI-formatted JSON body, translates it to Anthropic's specific format on the fly, and returns the response in OpenAI format.

### 1.2 The Implementation (`lib/agents/orchestrator.ts`)
This is the actual code pattern we use. Note the `dangerouslyAllowBrowser: true` flag, which is required because we sometimes instantiate this client in Edge Runtime environments.

```typescript
import OpenAI from "openai";
import { KeyManager } from "./key-manager";

class BytezClient {
    private static instance: OpenAI | null = null;
    private static currentKey: string | null = null;

    /**
     * Singleton Pattern: Ensures we reuse the same TCP connection
     * until a key rotation is forced.
     */
    static async getInstance(forceRefresh: boolean = false): Promise<OpenAI> {
        // 1. Get the currently active healthy key
        const keyManager = KeyManager.getInstance();
        const activeKey = keyManager.getCurrentKey();

        // 2. Re-instantiate ONLY if key changed or forced
        if (!this.instance || this.currentKey !== activeKey || forceRefresh) {
            this.currentKey = activeKey;
            
            // 3. The "Unified" Client Configuration
            this.instance = new OpenAI({
                apiKey: activeKey, // This is a BYEZ API Key, NOT Anthropic!
                baseURL: "https://api.bytez.com/models/v2/openai/v1",
                dangerouslyAllowBrowser: true 
            });
            
            console.log(`🔌 BytezClient connected with key: ...${activeKey.slice(-4)}`);
        }

        return this.instance;
    }
}
```

---

## 2. Key Management & Infinite Scaling

To run a production app without hitting Rate Limits (`429`), we implemented a **Round-Robin Key Rotation System** with health tracking.

### 2.1 Storage Strategy (`.env.local`)
We do not hardcode keys. We do not use a single list. We use a **Numbered Variable Pattern** that allows for infinite horizontal scaling of keys.

```bash
# .env.local
BYTEZ_API_KEY_1=sk-bytez-preview-1...
BYTEZ_API_KEY_2=sk-bytez-preview-2...
# ...
BYTEZ_API_KEY_20=sk-bytez-preview-20...
```

### 2.2 The KeyManager State Machine (`lib/agents/key-manager.ts`)
The `KeyManager` is a robust singleton that maintains the health state of every key in memory.

**Core Logic:**
1.  **Load**: Scans `process.env` from 1 to 20 on startup.
2.  **Track**: Keeps a `Set<number>` of failed indices.
3.  **Rotate**: When requested, moves to `(current + 1) % total`. Skips known bad keys.

```typescript
export class KeyManager {
    private static instance: KeyManager;
    private keys: string[] = [];
    private currentIndex: number = 0;
    private failedKeys: Set<number> = new Set(); // Tracks dead keys

    /**
     * Called when a 429/402 occurs. 
     * Marks current key dead and rotates.
     */
    markCurrentKeyAsFailed() {
        this.failedKeys.add(this.currentIndex);
        console.warn(`💀 Key #${this.currentIndex + 1} marked as FAILED`);
    }

    rotateKey(): boolean {
        const startIndex = this.currentIndex;
        let attempts = 0;

        do {
            // Round-robin increment
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;
            attempts++;

            // If found a healthy key, stop
            if (!this.failedKeys.has(this.currentIndex)) {
                return true;
            }

            // Circuit Breaker: If all keys visited and failed
            if (attempts >= this.keys.length) {
                console.error("❌ CRITICAL: All API keys exhausted");
                return false;
            }
        } while (true);
    }
}
```

---

## 3. The Orchestration Logic (The "Brain")

We use a **Sequential Assembly Line** pattern. Requests are not just thrown at a chatbot; they move through a pipeline.

### 3.1 The AgentRunner (Auto-Failover Wrapper)
We don't call `client.chat.completions.create` directly. We wrap it in `executeWithRetry` to handle network instability.

```typescript
private async executeWithRetry<T>(operation: (client: OpenAI) => Promise<T>) {
    const keyManager = KeyManager.getInstance();
    
    // Retry loop = number of available keys
    for (let attempt = 0; attempt < keyManager.getTotalKeys(); attempt++) {
        try {
            const client = await BytezClient.getInstance();
            return await operation(client); // Try the API call
        } catch (error: any) {
            // Check for specific Quota/Rate Limit codes
            if (error.status === 429 || error.status === 402) {
                keyManager.markCurrentKeyAsFailed(); // Kill the key
                keyManager.rotateKey();              // Switch
                await BytezClient.getInstance(true); // Force client refresh
                continue;                            // Retry loop
            }
            throw error; // Throw real errors (500, 400, etc.)
        }
    }
}
```

### 3.2 Two-Phase Intent Routing
To optimize cost and quality, we route tasks to specific models.

**Step 1: Classification (The Router)**
We ask a fast model (Claude 3.5 Sonnet) to classify the user's message into one of 5 buckets:
`BOM` | `CODE` | `WIRING` | `DEBUG` | `CHAT`

**Step 2: Execution (The Specialist)**
Based on the bucket, we load a specific **System Prompt** from `config.ts` and dispatch to a specific model.

| Intent | Bucket | Model | Why? |
| :--- | :--- | :--- | :--- |
| "I need a parts list" | `BOM` | **Claude Opus** | Best at reasoning/validating specs |
| "Write Arduino code" | `CODE` | **Claude Sonnet** | Faster, better syntax accuracy |
| "Draw a circuit" | `WIRING` | **Claude Sonnet** | Good spatial understanding |
| "Why is this failing?" | `DEBUG` | **Claude Opus** | Deep context window analysis |

---

## 4. The Action Layer (Tools & Database)

Agents communicate with the persistent world via "Tools". We do not use LangChain; we use a custom, lightweight tool executor.

### 4.1 The Tool Lifecycle
1.  **LLM Decision**: The model outputs a `tool_calls` JSON in its response.
    ```json
    {
      "name": "write",
      "arguments": {
        "artifact_type": "bom",
        "content": { "projectName": "Drone", "parts": [...] }
      }
    }
    ```
2.  **Executor Interception**: The `AgentRunner` parsing loop detects this JSON.
3.  **Execution**: `ToolExecutor.executeToolCall()` is triggered.

### 4.2 Database Persistence (`lib/db/artifacts.ts`)
We use Supabase (PostgreSQL) to store the results. This is critical because **Agent Memory is Ephemeral, but Database is Forever.**

**The Write Protocol:**
```typescript
// ToolExecutor.ts
private async write(params: { artifact_type: string, content: any }) {
    // 1. Fetch current artifact ID
    const existing = await ArtifactService.getLatestArtifact(this.chatId, params.artifact_type);
    
    // 2. Create new Version (Immutable History)
    const version = await ArtifactService.createVersion({
        artifact_id: existing.id,
        version_number: existing.current_version + 1,
        content_json: params.content,
        change_summary: "Updated via tool call"
    });
    
    return { success: true, version: version.version_number };
}
```

---

## 5. Adding a New Agent (Developer Guide)

Want to add a "Security Auditor" agent? Follow these steps:

1.  **Define Configuration (`lib/agents/config.ts`)**:
    ```typescript
    securityAuditor: {
        name: "Security Sentinel",
        model: "anthropic/claude-sonnet-4-5", // Use Bytez model ID
        systemPrompt: "You are a cybersecurity expert...",
        maxTokens: 4000
    }
    ```

2.  **Update Intent Map (`lib/agents/orchestrator.ts`)**:
    ```typescript
    const intentAgentMap = {
        'SECURE': 'securityAuditor',
        // ... existing
    };
    ```

3.  **Update Orchestrator Prompt**:
    Modify the system prompt for the `orchestrator` agent to recognize keywords like "vulnerability", "hack", "audit".

4.  **Restart**: The system will now route security questions to your new agent automatically.

---

## 7. Frontend Implementation: The Reactive Chat

The frontend doesn't just wait for a response; it participates in a reactive, streaming lifecycle powered by **Server-Sent Events (SSE)** and **Optimistic UI**.

### 7.1 The `useChat` Hook (`lib/hooks/use-chat.ts`)
This custom React hook is the brain of the user interface. It manages message state, persistence syncing, and the streaming network lifecycle.

**Core Workflow:**
1.  **Optimistic Send**: As soon as the user hits "Send", the message is added to the UI with a temporary ID.
2.  **Streaming Fetch**: A `POST` request is made to `/api/agents/chat`.
3.  **Reader Loop**: The hook uses a `ReadableStream` reader to decode binary chunks into JSON events.

### 7.2 Event-Driven UI Updates
The backend streams specific event types that the frontend reacts to in real-time:

| Event Type | Frontend Action |
| :--- | :--- |
| **`text`** | Appends characters to the active AI message (streaming effect). |
| **`agent_selected`** | Updates the agent icon/name in the header and shows a "Specialist Joined" toast. |
| **`tool_call`** | **Optimistic Drawer Opening**: If the AI calls `update_bom`, the BOM drawer slides open *before* the computation is even finished. |
| **`key_rotation`** | Shows a notification if a key was swapped due to a rate limit. |
| **`metadata`** | Finalizes the message ID and persists tool call results in the local state. |

---

## 8. Real-Time Sync Strategy (SSE + Supabase)

Ohm uses a "Hybrid Persistence" model to ensure the UI is both blazing fast and perfectly accurate.

1.  **Immediate Feedback (SSE)**: The AI's response is streamed directly into the local React state via `useChat`. This ensures <100ms perceived latency for the first character.
2.  **Persistence Sync (Supabase Realtime)**: While the stream is active, the Backend persists the final message to the `messages` table. The frontend listens to `INSERT` events via Supabase Realtime.
3.  **The Handover**: When the "Real" message arrives from the database, the `useChat` hook swaps out the temporary "thinking..." message with the permanent database record. This ensures that sequence numbers and IDs are always in sync with the server.

```typescript
// From useChat.ts: Handover logic
if (newMsg.role === 'assistant') {
    const hasTempMessage = prev.some(m => m.agent_name === 'thinking...');
    if (hasTempMessage) {
        // REPLACE temp "thinking" state with real DB record
        return prev.filter(m => m.agent_name !== 'thinking...').concat([newMsg]);
    }
}
```

---

## 9. Technology Stack Summary

| Part | Technology |
| :--- | :--- |
| **Inference Library** | `openai` NPM Package (Custom implementation) |
| **Model Gateway** | **Bytez API** (Unifies Claude/Gemini) |
| **State Management** | **Supabase** (Postgres + Real-time) |
| **Backend Framework** | **Next.js 15 (App Router)** |
| **Streaming** | **Server-Sent Events (SSE)** via `ReadableStream` |
| **Logic Language** | **TypeScript** (Strict Mode) |

---

## 10. Directory Map

*   `lib/agents/config.ts`: Agent personalities and model mapping.
*   `lib/agents/orchestrator.ts`: The main "Brain" logic and Bytez client.
*   `lib/agents/key-manager.ts`: API key rotation and health tracking.
*   `lib/agents/tool-executor.ts`: Bridging AI thoughts to DB actions.
*   `lib/agents/tools.ts`: Definitions of what the agents *can* do.
*   `lib/hooks/use-chat.ts`: Frontend chat logic and SSE handling.
*   `components/ai_chat/AIAssistantUI.jsx`: The primary chat interface component.

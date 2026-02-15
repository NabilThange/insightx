# Ohm Multi-Agent Orchestration & Bytez Integration

This document outlines the architecture of Ohm's Multi-Agent System (MAS), detailing how we orchestrate specialized agents and leverage the **Bytez API** for model-agnostic inference.

---

## 1. High-Level Architecture: The "Assembly Line"

The system follows an **Intent-Based Routing** pattern. Instead of one giant model handling everything, we use a specialized "Orchestrator" to classify the user's intent and route the request to the most capable expert agent.

### The Request Lifecycle
1.  **User Message**: Input comes into the `AssemblyLineOrchestrator`.
2.  **Intent Classification**: The `orchestrator` agent (Claude 3.5 Sonnet) analyzes the message.
3.  **Routing**: The request is passed to a specialized agent (e.g., `bomGenerator`, `codeGenerator`).
4.  **Specialized Execution**: The expert agent executes, potentially calling **Tools** (BOM generation, Code writing).
5.  **Artifact Persistence**: The `ToolExecutor` saves results to the database.

---

## 2. The Bytez Integration (Unified Key Access)

One of the core features of Ohm is the ability to use **SOTA models (Claude, Gemini, Llama)** through a **single Bytez API Key**, without requiring separate credentials for Anthropic or Google.

### Why No `ANTHROPIC_API_KEY`?
Bytez acts as a unified provider. We use the standard **OpenAI SDK**, but point the `baseURL` to Bytez's endpoint. Bytez translates these requests to the appropriate provider (e.g., Anthropic for Claude models).

### Code Snippet: Bytez Client Configuration
Found in `lib/agents/orchestrator.ts`:

```typescript
// Bytez Client points to their OpenAI-compatible gateway
this.instance = new OpenAI({
    apiKey: activeKey, // A Bytez API Key
    baseURL: "https://api.bytez.com/models/v2/openai/v1", // THE KEY: Unified endpoint
    dangerouslyAllowBrowser: true 
});
```

---

## 3. Key Management & Failover

To ensure 100% uptime and handle quota limits, we implement a **Key Rotation** system.

### Environment Variable Format
We support multiple keys via a numbered suffix:
- `BYTEZ_API_KEY_1`
- `BYTEZ_API_KEY_2`
- ...

### KeyManager Logic
The `KeyManager` (`lib/agents/key-manager.ts`) automatically rotates to the next healthy key if a `429 (Too Many Requests)` or quota error occurs.

```typescript
private loadKeys() {
    const keys: string[] = [];
    for (let i = 1; i <= 20; i++) {
        const key = process.env[`BYTEZ_API_KEY_${i}`] || process.env[`NEXT_PUBLIC_BYTEZ_API_KEY_${i}`];
        if (key && key.trim().length > 0) {
            keys.push(key.trim());
        } else {
            break;
        }
    }
    this.keys = keys;
}
```

---

## 4. Orchestration Step-by-Step

The `AssemblyLineOrchestrator` manages the "Brain" of the operation.

### Intent Detection
Every subsequent message (after the first) is analyzed by the orchestrator:

```typescript
// Sub-agent: Orchestrator
const intentResult = await this.runner.runAgent(
    'orchestrator',
    [{ role: 'user', content: userMessage }],
    { stream: false }
);

const intent = intentResult.response.trim().toUpperCase();

// Mapping to Specialized Agent
const intentAgentMap: Record<string, AgentType> = {
    'BOM': 'bomGenerator',
    'CODE': 'codeGenerator',
    'WIRING': 'wiringDiagram',
    'DEBUG': 'debugger',
    'CHAT': 'conversational'
};
```

---

## 5. Agent Personalities (System Prompts)

All agent configurations, including their specific models and system prompts, are stored in `lib/agents/config.ts`. This allows us to "tune" the behavior of each specialist independently.

| Agent | Model | Primary Responsibility |
| :--- | :--- | :--- |
| **Orchestrator** | Claude 3.5 Sonnet | Intent routing and intent classification |
| **BOM Generator**| Claude 3.5 Opus | Precise component selection (No "magic smoke") |
| **Code Generator**| Claude 3.5 Sonnet | Non-blocking, production-grade firmware |
| **Wiring Specialist**| Claude 3.5 Sonnet | Physical connection and PCB logic |

---

## 6. Real-World Tooling

Agents don't just talk; they **act** via `tool-executor.ts`. 
When the `BOM Generator` wants to update a part list, it calls the `write` tool, which the `ToolExecutor` translates into a database operation:

```typescript
async executeToolCall(toolCall: ToolCall): Promise<any> {
    switch (toolCall.name) {
        case 'write':
            return await this.write({
                artifact_type: toolCall.arguments.artifact_type,
                content: toolCall.arguments.content
            });
        // ...
    }
}
```

This architecture ensures that the AI's "thoughts" are directly converted into "Project Artifacts" that the user can see in the dashboard.

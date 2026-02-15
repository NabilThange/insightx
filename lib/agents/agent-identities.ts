/**
 * Agent Identity Configuration
 * Maps each agent to display name, avatar, icon, and role
 */

export interface AgentIdentity {
  name: string;
  avatar: string;
  icon: string;
  role: string;
  model: string;
}

export const AGENT_IDENTITIES: Record<string, AgentIdentity> = {
  orchestrator: {
    name: "Query Router",
    avatar: "/avatars/orchestrator.svg",
    icon: "🎯",
    role: "Routes queries to the right specialist",
    model: "Claude Sonnet 4.5"
  },
  sql_agent: {
    name: "SQL Analyst",
    avatar: "/avatars/sql-agent.svg",
    icon: "📊",
    role: "Generates and executes DuckDB queries",
    model: "Claude Sonnet 4.5"
  },
  python_agent: {
    name: "Statistical Analyst",
    avatar: "/avatars/python-agent.svg",
    icon: "🐍",
    role: "Performs statistical analysis and outlier detection",
    model: "Claude Sonnet 4.5"
  },
  composer: {
    name: "Response Composer",
    avatar: "/avatars/composer.svg",
    icon: "✍️",
    role: "Synthesizes results into clear insights",
    model: "Claude Sonnet 4.5"
  },
  explainer: {
    name: "Data Explainer",
    avatar: "/avatars/explainer.svg",
    icon: "💡",
    role: "Explains dataset structure and findings",
    model: "Claude Sonnet 4.5"
  },
  validator: {
    name: "Result Validator",
    avatar: "/avatars/validator.svg",
    icon: "✅",
    role: "Validates consistency between agent results",
    model: "Claude Sonnet 4.5"
  }
};

export function getAgentIdentity(agentId: string | null | undefined): AgentIdentity {
  if (!agentId || !AGENT_IDENTITIES[agentId]) {
    return {
      name: "AI Assistant",
      avatar: "/avatars/default.svg",
      icon: "🤖",
      role: "General AI Assistant",
      model: "Claude"
    };
  }
  return AGENT_IDENTITIES[agentId];
}

export function findAgentIdByName(name: string): string | null {
  for (const [id, identity] of Object.entries(AGENT_IDENTITIES)) {
    if (identity.name.toLowerCase() === name.toLowerCase()) {
      return id;
    }
  }
  return null;
}

export function isValidAgentId(agentId: string): boolean {
  return agentId in AGENT_IDENTITIES;
}

export function getAllAgentIds(): string[] {
  return Object.keys(AGENT_IDENTITIES);
}

export function getAllAgentIdentities(): AgentIdentity[] {
  return Object.values(AGENT_IDENTITIES);
}

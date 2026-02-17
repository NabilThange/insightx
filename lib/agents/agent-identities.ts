/**
 * Agent Identity Registry
 * Defines visual identity (name, icon, description) for each agent
 */

export interface AgentIdentity {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const AGENT_IDENTITIES: Record<string, AgentIdentity> = {
  orchestrator: {
    id: 'orchestrator',
    name: 'Query Analyzer',
    icon: '🎯',
    description: 'Analyzes your question and routes to the right specialist',
    color: '#8B5CF6', // purple
  },

  sql_agent: {
    id: 'sql_agent',
    name: 'SQL Agent',
    icon: '🔍',
    description: 'Generates and executes SQL queries',
    color: '#3B82F6', // blue
  },

  python_agent: {
    id: 'python_agent',
    name: 'Python Analyst',
    icon: '📊',
    description: 'Performs statistical analysis using Python',
    color: '#10B981', // green
  },

  composer: {
    id: 'composer',
    name: 'Response Composer',
    icon: '🎨',
    description: 'Synthesizes results into clear answers',
    color: '#F59E0B', // amber
  },

  explainer: {
    id: 'explainer',
    name: 'Explainer',
    icon: '💡',
    description: 'Explains dataset structure and findings',
    color: '#EC4899', // pink
  },

  context_agent: {
    id: 'context_agent',
    name: 'Context Agent',
    icon: '🧠',
    description: 'Analyzes dataset purpose, use cases, and domain context',
    color: '#F59E0B', // amber
  },
};

/**
 * Get agent identity by ID
 */
export function getAgentIdentity(agentId: string): AgentIdentity {
  const identity = AGENT_IDENTITIES[agentId];
  if (!identity) {
    return {
      id: agentId,
      name: agentId,
      icon: '🤖',
      description: 'Unknown agent',
      color: '#6B7280',
    };
  }
  return identity;
}

/**
 * Get all agent identities
 */
export function getAllAgentIdentities(): AgentIdentity[] {
  return Object.values(AGENT_IDENTITIES);
}

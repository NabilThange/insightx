/**
 * Conversation Summarizer
 * Manages conversation history to prevent token overflow in long sessions
 */

export class ConversationSummarizer {
  private sessionId: string;
  private summaryCache: string = '';
  private lastSummaryMessageCount: number = 0;

  // Update summary every N messages
  private readonly SUMMARY_INTERVAL = 10;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Check if summary needs updating based on message count
   */
  shouldUpdateSummary(messageCount: number): boolean {
    if (messageCount === 0) return false;
    
    // Update every SUMMARY_INTERVAL messages
    return messageCount > 0 && 
           messageCount % this.SUMMARY_INTERVAL === 0 &&
           messageCount !== this.lastSummaryMessageCount;
  }

  /**
   * Update the conversation summary
   */
  async updateSummary(conversationHistory: any[]): Promise<void> {
    try {
      if (conversationHistory.length === 0) {
        this.summaryCache = '';
        return;
      }

      // Extract key information from conversation
      const userQueries = conversationHistory.filter(m => m.role === 'user');
      const assistantResponses = conversationHistory.filter(m => m.role === 'assistant');

      // Count specific types of interactions
      const sqlQueries = conversationHistory.filter(m => 
        m.content?.includes('SELECT') || m.content?.includes('sql')
      ).length;

      const pythonAnalyses = conversationHistory.filter(m =>
        m.content?.includes('python') || m.content?.includes('statistical')
      ).length;

      const insights = conversationHistory.filter(m =>
        m.content?.includes('insight') || m.content?.includes('finding')
      ).length;

      // Build summary
      const summaryParts: string[] = [
        `📋 SESSION SUMMARY (${conversationHistory.length} messages)`,
        '',
        `User queries: ${userQueries.length}`,
        `Assistant responses: ${assistantResponses.length}`,
        `SQL analyses: ${sqlQueries}`,
        `Python analyses: ${pythonAnalyses}`,
        `Insights generated: ${insights}`,
        ''
      ];

      // Add recent topics (last 5 user queries)
      const recentQueries = userQueries.slice(-5);
      if (recentQueries.length > 0) {
        summaryParts.push('Recent topics:');
        recentQueries.forEach((query, idx) => {
          const preview = query.content?.slice(0, 80) || '';
          summaryParts.push(`${idx + 1}. ${preview}${preview.length >= 80 ? '...' : ''}`);
        });
      }

      this.summaryCache = summaryParts.join('\n');
      this.lastSummaryMessageCount = conversationHistory.length;

      console.log('[Summarizer] Updated summary for session:', this.sessionId);

    } catch (error) {
      console.error('[Summarizer] Failed to update summary:', error);
    }
  }

  /**
   * Get the current summary for use in agent context
   */
  async getSummaryForContext(): Promise<string> {
    if (!this.summaryCache) {
      return 'New session - no prior context';
    }
    return this.summaryCache;
  }

  /**
   * Get summary statistics
   */
  getSummaryStats(): {
    messageCount: number;
    lastUpdated: number;
    hasSummary: boolean;
  } {
    return {
      messageCount: this.lastSummaryMessageCount,
      lastUpdated: this.lastSummaryMessageCount,
      hasSummary: this.summaryCache.length > 0
    };
  }

  /**
   * Clear the summary cache
   */
  clearSummary(): void {
    this.summaryCache = '';
    this.lastSummaryMessageCount = 0;
  }

  /**
   * Create a compressed summary for very long sessions
   */
  async createCompressedSummary(fullHistory: any[]): Promise<string> {
    try {
      // For very long sessions (50+ messages), create ultra-compressed summary
      if (fullHistory.length < 50) {
        return this.summaryCache;
      }

      const userQueries = fullHistory.filter(m => m.role === 'user').length;
      const totalAnalyses = fullHistory.filter(m => 
        m.content?.includes('SELECT') || m.content?.includes('python')
      ).length;

      return `Long session: ${fullHistory.length} messages, ${userQueries} queries, ${totalAnalyses} analyses performed. Recent context available in full summary.`;

    } catch (error) {
      console.error('[Summarizer] Failed to create compressed summary:', error);
      return this.summaryCache;
    }
  }
}

/**
 * Helper function to create summarizer
 */
export function createSummarizer(sessionId: string): ConversationSummarizer {
  return new ConversationSummarizer(sessionId);
}

/**
 * Utility to check if conversation needs summarization
 */
export function needsSummarization(messageCount: number, interval: number = 10): boolean {
  return messageCount > 0 && messageCount % interval === 0;
}

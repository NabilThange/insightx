/**
 * InsightX Advanced Logging System
 * Provides consistent, tagged logging for orchestrator, tools, and system events.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';
type Tag = 'Orchestrator' | 'ToolExecutor' | 'Auth' | 'Supabase' | 'Sidebar' | 'API' | 'System';

class Logger {
    private formatTag(tag: Tag) {
        return `[${tag}]`;
    }

    private log(tag: Tag, message: string, data?: any, level: LogLevel = 'info') {
        const time = new Date().toLocaleTimeString();
        const tagStr = this.formatTag(tag);
        const fullMsg = `${time} ${tagStr} ${message}`;

        switch (level) {
            case 'success':
                console.log(`%c${fullMsg}`, 'color: #10b981; font-weight: bold;', data || '');
                break;
            case 'error':
                console.error(fullMsg, data || '');
                break;
            case 'warn':
                console.warn(fullMsg, data || '');
                break;
            case 'debug':
                console.debug(`%c${fullMsg}`, 'color: #6366f1;', data || '');
                break;
            default:
                console.log(`%c${fullMsg}`, 'color: #3b82f6;', data || '');
        }
    }

    orchestrator(message: string, data?: any) {
        this.log('Orchestrator', message, data, 'info');
    }

    tool(message: string, data?: any) {
        this.log('ToolExecutor', message, data, 'success');
    }

    auth(message: string, data?: any) {
        this.log('Auth', message, data, 'debug');
    }

    db(message: string, data?: any) {
        this.log('Supabase', message, data, 'info');
    }

    sidebar(message: string, data?: any) {
        this.log('Sidebar', message, data, 'debug');
    }

    api(message: string, data?: any) {
        this.log('API', message, data, 'info');
    }

    error(tag: Tag, message: string, error?: any) {
        this.log(tag, message, error, 'error');
    }
}

export const logger = new Logger();

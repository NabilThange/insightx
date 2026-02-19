'use client';

/**
 * Composer Response Renderer
 * Renders structured JSON responses from the Composer agent
 */

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ComposerResponse {
  text: string;
  metrics?: Record<string, any> | null;
  chart_spec?: {
    type: 'bar' | 'line' | 'pie' | 'scatter';
    data: any[];
    xAxis?: string;
    yAxis?: string;
    title?: string;
  } | null;
  confidence?: number;
  follow_ups?: string[];
  sql_used?: string | null;
  insight_type?: string;
  data_rows?: number;
  warning?: string | null;
}

interface ComposerResponseRendererProps {
  response: ComposerResponse;
  onFollowUpClick?: (question: string) => void;
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];

// Custom Tooltip matching InsightCard styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--stroke)',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        minWidth: '80px',
        textAlign: 'left',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', lineHeight: '1.2' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 600, color: 'var(--fg)', lineHeight: '1.2' }}>
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function ComposerResponseRenderer({ response, onFollowUpClick }: ComposerResponseRendererProps) {
  return (
    <div className="space-y-6">
      {/* Main Text Response */}
      <div className="prose prose-sm max-w-none markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mt-2 mb-1">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-bold mt-2 mb-1">{children}</h4>,
            p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-3 ml-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 ml-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => <strong className="font-bold text-[var(--fg)]">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[var(--stroke)] pl-4 py-2 my-3 italic text-[var(--text-muted)]">
                {children}
              </blockquote>
            ),
            code({ className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match;
              
              if (!isInline && match) {
                return (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={vscDarkPlus as any}
                    PreTag="div"
                    className="my-3 rounded-lg overflow-hidden"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              }
              
              return (
                <code className="bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 border border-[var(--stroke)] rounded-lg">
                <table className="w-full text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[var(--bg-surface)] border-b border-[var(--stroke)]">
                {children}
              </thead>
            ),
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr className="border-b border-[var(--stroke)] last:border-b-0">{children}</tr>,
            th: ({ children }) => (
              <th className="px-4 py-2 text-left font-semibold text-[var(--fg)]">{children}</th>
            ),
            td: ({ children }) => <td className="px-4 py-2">{children}</td>,
          }}
        >
          {response.text}
        </ReactMarkdown>
      </div>

      {/* Warning */}
      {response.warning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">⚠️</span>
            <p className="text-sm text-yellow-900">{response.warning}</p>
          </div>
        </div>
      )}

      {/* Metrics */}
      {response.metrics && Object.keys(response.metrics).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(response.metrics).map(([key, value]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-[var(--bg-elevated)] border border-[var(--stroke)] rounded-lg px-4 py-2"
            >
              <div className="text-xs text-[var(--text-muted)] capitalize">
                {key.replace(/_/g, ' ')}
              </div>
              <div className="text-sm font-semibold text-[var(--fg)] mt-1">
                {String(value)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Chart - With Report Card Styling */}
      {response.chart_spec && response.chart_spec.data && response.chart_spec.data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          className="chart-card"
        >
          {response.chart_spec.title && (
            <h3 className="chart-title">{response.chart_spec.title}</h3>
          )}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              {response.chart_spec.type === 'bar' && (
                <BarChart data={response.chart_spec.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" />
                  <XAxis
                    dataKey={response.chart_spec.xAxis || 'x'}
                    stroke="var(--fg)"
                    tick={{ fill: 'var(--fg)' }}
                  />
                  <YAxis stroke="var(--fg)" tick={{ fill: 'var(--fg)' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)', opacity: 0.5 }} />
                  <Legend />
                  <Bar
                    dataKey={response.chart_spec.yAxis || 'y'}
                    fill="#8B5CF6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              )}
              {response.chart_spec.type === 'line' && (
                <LineChart data={response.chart_spec.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" />
                  <XAxis
                    dataKey={response.chart_spec.xAxis || 'x'}
                    stroke="var(--fg)"
                    tick={{ fill: 'var(--fg)' }}
                  />
                  <YAxis stroke="var(--fg)" tick={{ fill: 'var(--fg)' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--stroke)', strokeWidth: 1 }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={response.chart_spec.yAxis || 'y'}
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--bg)', stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              )}
              {response.chart_spec.type === 'pie' && (
                <PieChart>
                  <Pie
                    data={response.chart_spec.data}
                    dataKey={response.chart_spec.yAxis || 'value'}
                    nameKey={response.chart_spec.xAxis || 'name'}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {response.chart_spec.data.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Confidence Badge */}
      {response.confidence !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <span className="text-sm text-[var(--text-muted)]">Confidence:</span>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              response.confidence >= 90
                ? 'bg-green-100 text-green-800'
                : response.confidence >= 70
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {response.confidence}%
          </div>
        </motion.div>
      )}

      {/* Follow-up Questions */}
      {response.follow_ups && response.follow_ups.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="space-y-2"
        >
          <h4 className="text-sm font-semibold text-[var(--fg)]">Follow-up questions:</h4>
          <div className="flex flex-wrap gap-2">
            {response.follow_ups.map((question, index) => (
              <motion.button
                key={index}
                whileHover={{ translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onFollowUpClick?.(question)}
                className="bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] border border-[var(--stroke)] rounded-full px-4 py-2 text-sm text-[var(--fg)] transition-colors"
              >
                {question}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* SQL Query (Collapsible) */}
      {response.sql_used && (
        <details className="bg-[var(--bg-elevated)] border border-[var(--stroke)] rounded-lg">
          <summary className="cursor-pointer px-4 py-3 font-semibold text-sm text-[var(--fg)] hover:bg-[var(--bg-surface)] transition-colors">
            📊 View SQL Query
          </summary>
          <div className="px-4 pb-4">
            <SyntaxHighlighter
              language="sql"
              style={vscDarkPlus as any}
              customStyle={{
                margin: 0,
                borderRadius: '8px',
                fontSize: '12px',
              }}
            >
              {response.sql_used}
            </SyntaxHighlighter>
          </div>
        </details>
      )}

      <style jsx>{`
        .chart-card {
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease-out;
          position: relative;
          overflow: hidden;
        }

        .chart-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08);
          border-color: var(--fg);
        }

        .chart-title {
          font-size: 1rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .chart-container {
          height: 300px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

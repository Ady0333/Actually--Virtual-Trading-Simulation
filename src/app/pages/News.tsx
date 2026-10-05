import { Zap } from 'lucide-react';
import { mockNews } from '../data/mockData';
import { useState } from 'react';

export default function News() {
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return {
          backgroundColor: 'var(--accent-dim)',
          color: 'var(--accent)'
        };
      case 'Negative':
        return {
          backgroundColor: 'var(--red-dim)',
          color: 'var(--red)'
        };
      default:
        return {
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-muted)'
        };
    }
  };

  const aiSummaries: Record<string, string> = {
    '1': 'AI Analysis: Strong quarterly earnings from major tech companies, particularly NVIDIA and Microsoft, are driving investor confidence. Positive revenue growth in AI sectors indicates sustained momentum.',
    '4': 'AI Analysis: Apple\'s product launch event is expected to showcase innovative features. Historical data shows positive market response to such announcements, with pre-order volumes typically exceeding expectations.',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-full overflow-y-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 
            className="text-2xl font-bold"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em'
            }}
          >
            Financial News
          </h1>
          <div className="relative">
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--red)' }}
            />
            <div 
              className="absolute inset-0 w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: 'var(--red)' }}
            />
          </div>
        </div>
        <p 
          className="text-sm"
          style={{ 
            fontFamily: 'var(--font-ui)',
            color: 'var(--text-secondary)'
          }}
        >
          Stay updated with live financial news and market insights
        </p>
      </div>

      {/* News Items */}
      <div className="space-y-4">
        {mockNews.map((item) => {
          const isExpanded = expandedNews === item.id;
          const hasAiSummary = item.id in aiSummaries;

          return (
            <div 
              key={item.id}
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-dim)'
              }}
            >
              <div 
                className="p-5 cursor-pointer"
                onClick={() => setExpandedNews(isExpanded ? null : item.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Source & Time */}
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="text-[9px] font-semibold uppercase tracking-wider"
                    style={{ 
                      fontFamily: 'var(--font-ui)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {item.sentiment === 'Positive' ? 'Bloomberg' : item.sentiment === 'Negative' ? 'Reuters' : 'CNBC'}
                  </span>
                  <span 
                    className="text-[11px]"
                    style={{ 
                      fontFamily: 'var(--font-ui)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {item.timestamp}
                  </span>
                </div>

                {/* Headline */}
                <h3 
                  className="text-lg font-bold leading-[1.4] mb-3"
                  style={{ 
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {item.headline}
                </h3>

                {/* Summary */}
                <p 
                  className="text-sm leading-relaxed mb-3"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {item.summary}
                </p>

                {/* Sentiment Badge */}
                <div>
                  <span 
                    className="inline-block px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      fontFamily: 'var(--font-ui)',
                      ...getSentimentStyle(item.sentiment)
                    }}
                  >
                    {item.sentiment}
                  </span>
                </div>
              </div>

              {/* AI Summary (Expandable) */}
              {isExpanded && hasAiSummary && (
                <div 
                  className="px-5 py-4 border-t italic"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-dim)'
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Zap 
                      className="w-4 h-4 flex-shrink-0 mt-0.5" 
                      style={{ color: 'var(--accent)' }}
                    />
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ 
                        fontFamily: 'var(--font-ui)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {aiSummaries[item.id]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

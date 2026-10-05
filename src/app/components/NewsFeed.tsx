/// <reference types="vite/client" />
import { useNavigate } from 'react-router';
import { useNews } from '../hooks/useNews';
import { RefreshCw } from 'lucide-react';

export function NewsFeed() {
  const navigate = useNavigate();
  const { news, loading, isLive, fetchNews, timeAgo } = useNews();

  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return { backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' };
      case 'Negative': return { backgroundColor: 'var(--red-dim)', color: 'var(--red)' };
      default: return { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' };
    }
  };

  const handleNewsClick = (newsId: string) => {
    navigate(`/news?article=${newsId}`);
  };

  return (
    <div
      className="rounded-lg border h-[420px] flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--border-dim)' }}>
        <h3 className="text-sm font-bold flex-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          Live News
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isLive ? 'var(--accent)' : 'var(--red)' }} />
            <div className="absolute inset-0 w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: isLive ? 'var(--accent)' : 'var(--red)' }} />
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
            {isLive ? 'Live' : 'Demo'}
          </span>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="w-6 h-6 flex items-center justify-center rounded"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <RefreshCw className="w-3 h-3" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* News Items */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border-b" style={{ borderColor: 'var(--border-dim)' }}>
              <div className="h-2 rounded mb-2 skeleton" style={{ width: '40%' }} />
              <div className="h-3 rounded mb-1 skeleton" style={{ width: '100%' }} />
              <div className="h-3 rounded mb-2 skeleton" style={{ width: '80%' }} />
              <div className="h-4 rounded skeleton" style={{ width: '60px' }} />
            </div>
          ))
        ) : (
          news.slice(0, 6).map((item: any, index: number) => (
            <div
              key={item.id}
              className="border-b cursor-pointer"
              style={{ borderColor: index === 5 ? 'transparent' : 'var(--border-dim)' }}
              onClick={() => handleNewsClick(item.id)}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>
                    {item.source}
                  </span>
                  <span className="text-[9px]" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>
                    {timeAgo(item.publishedAt)}
                  </span>
                </div>
                <h4
                  className="text-[13px] font-semibold leading-[1.4] mb-2"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--text-primary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {item.title}
                </h4>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold"
                    style={{ fontFamily: 'var(--font-ui)', ...getSentimentStyle(item.sentiment) }}
                  >
                    {item.sentiment}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
                    Read →
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .skeleton {
          background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}
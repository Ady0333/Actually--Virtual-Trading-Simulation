import { useNavigate } from 'react-router';
import { useMarketFeed } from '../hooks/useMarketFeed';
import { timeAgo } from '../lib/format';

export default function News() {
  const { news, connected } = useMarketFeed();
  const navigate = useNavigate();

  const sentimentStyle = (bullish: boolean) =>
    bullish
      ? { backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }
      : { backgroundColor: 'var(--red-dim)', color: 'var(--red)' };

  return (
    <div className="p-6 max-w-4xl mx-auto h-full overflow-y-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Market News
          </h1>
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: connected ? 'var(--accent)' : 'var(--red)' }} />
            {connected && (
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent)' }} />
            )}
          </div>
        </div>
        <p className="text-sm" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
          Simulated headlines that move prices in the market for about 3 minutes. A new one arrives every ~45 seconds.
        </p>
      </div>

      {/* News Items */}
      <div className="space-y-4">
        {news.length === 0 && (
          <div
            className="rounded-lg border p-8 text-center text-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}
          >
            {connected ? 'Waiting for the first headline…' : 'Connecting to the market feed…'}
          </div>
        )}

        {news.map((item) => {
          const bullish = item.bias === 'bullish';
          const target = item.ticker || (item.sector ? `${item.sector} sector` : 'the broad market');
          return (
            <div
              key={item.timestamp + item.headline}
              className="rounded-lg border overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}
            >
              <div className="p-5">
                {/* Tag & Time */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}
                  >
                    {item.ticker ? `Company · ${item.ticker}` : item.sector ? `Sector · ${item.sector}` : 'Macro'}
                  </span>
                  <span className="text-[11px]" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>
                    {timeAgo(item.timestamp)}
                  </span>
                </div>

                {/* Headline */}
                <h3
                  className="text-lg font-bold leading-[1.4] mb-3"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
                >
                  {item.headline}
                </h3>

                {/* Impact */}
                <p className="text-sm leading-relaxed mb-3" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
                  Expected impact: pushes {target} {bullish ? 'up' : 'down'} for the next few minutes.
                </p>

                <div className="flex items-center gap-2">
                  <span
                    className="inline-block px-2 py-1 rounded text-xs font-semibold"
                    style={{ fontFamily: 'var(--font-ui)', ...sentimentStyle(bullish) }}
                  >
                    {bullish ? 'Bullish' : 'Bearish'}
                  </span>
                  {item.ticker && (
                    <button
                      onClick={() => navigate(`/markets?ticker=${encodeURIComponent(item.ticker!)}`)}
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{ fontFamily: 'var(--font-ui)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                    >
                      Trade {item.ticker} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { API_BASE } from '../../config';
import { inr, authHeaders } from '../lib/format';

interface LeaderboardEntry {
  rank: number;
  username: string;
  net_worth: number;
  pnl: number;
  pnl_pct: number;
  total_trades: number;
  is_current_user: boolean;
}

interface LeaderboardData {
  total_traders: number;
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = () =>
      fetch(`${API_BASE}/api/leaderboard`, { headers: authHeaders() })
        .then(res => {
          if (!res.ok) throw new Error('Failed to load leaderboard');
          return res.json();
        })
        .then(d => { setData(d); setError(''); })
        .catch(e => setError(e.message));
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const entries = data?.entries ?? [];
  const currentUser = data?.me;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #FFD700, #FF9D00)', color: '#000', icon: '🥇' };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', color: '#000', icon: '🥈' };
    if (rank === 3) return { bg: 'linear-gradient(135deg, #CD7F32, #8B4513)', color: '#fff', icon: '🥉' };
    return { bg: 'var(--bg-elevated)', color: 'var(--text-muted)', icon: null };
  };

  // Podium order: 2nd, 1st, 3rd
  const podium = [entries[1], entries[0], entries[2]];

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5" style={{ color: 'var(--yellow, #f5c842)' }} />
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Leaderboard
          </h1>
        </div>
        <p className="text-sm" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
          All traders ranked by net worth (cash + holdings at live prices)
        </p>
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--red)', fontFamily: 'var(--font-ui)' }}>{error}</p>
      )}
      {!data && !error && (
        <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>Loading…</p>
      )}

      {/* Your Rank Card */}
      {currentUser && data && (
        <div className="rounded-lg border p-4 mb-5 flex items-center gap-4"
          style={{ backgroundColor: 'var(--accent-dim)', borderColor: 'var(--accent)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary, #000)', fontFamily: 'var(--font-ui)' }}>
            {initials(currentUser.username)}
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
              Your Rank
            </p>
            <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              #{currentUser.rank} out of {data.total_traders} traders
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>Net Worth</p>
            <p className="text-[15px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {inr(currentUser.net_worth)}
            </p>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-5 mt-4">
          {podium.map((entry, i) => {
            const heights = ['h-24', 'h-32', 'h-20'];
            const badge = getRankBadge(entry.rank);
            return (
              <div key={entry.rank}
                className={`${heights[i]} rounded-lg flex flex-col items-center justify-center p-3 relative`}
                style={{
                  backgroundColor: entry.is_current_user ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  border: `1px solid ${entry.is_current_user ? 'var(--accent)' : 'var(--border-dim)'}`,
                }}>
                <div className="absolute -top-3 text-xl">{badge.icon}</div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold mb-1"
                  style={{ background: badge.bg, color: badge.color }}>
                  {initials(entry.username)}
                </div>
                <p className="text-[11px] font-semibold text-center truncate max-w-full" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>
                  {entry.username.split(' ')[0]}
                </p>
                <p className="text-[10px] tabular-nums mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: entry.pnl >= 0 ? 'var(--accent)' : 'var(--red)' }}>
                  {entry.pnl >= 0 ? '+' : ''}{entry.pnl_pct.toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      {data && (
        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-dim)' }}>
            <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Full Rankings
            </h3>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_130px_100px_70px] px-4 py-2 border-b"
                style={{ borderColor: 'var(--border-dim)' }}>
                {['#', 'Trader', 'Net Worth', 'P/L', 'Trades'].map((col, i) => (
                  <span key={col} className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', textAlign: i >= 2 ? 'right' : 'left' }}>
                    {col}
                  </span>
                ))}
              </div>

              {entries.map((entry, index) => {
                const badge = getRankBadge(entry.rank);
                const isProfit = entry.pnl >= 0;
                return (
                  <div key={entry.rank}
                    className="grid grid-cols-[40px_1fr_130px_100px_70px] px-4 py-3 items-center"
                    style={{
                      borderBottom: index === entries.length - 1 ? 'none' : '1px solid var(--border-dim)',
                      backgroundColor: entry.is_current_user ? 'var(--accent-dim)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!entry.is_current_user) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (!entry.is_current_user) e.currentTarget.style.backgroundColor = 'transparent'; }}>

                    {/* Rank */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{ background: badge.bg, color: badge.color }}>
                      {badge.icon || entry.rank}
                    </div>

                    {/* Trader */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: entry.is_current_user ? 'var(--accent)' : 'var(--bg-elevated)', color: entry.is_current_user ? 'var(--bg-primary, #000)' : 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                        {initials(entry.username)}
                      </div>
                      <p className="text-[13px] font-medium truncate" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>
                        {entry.username} {entry.is_current_user && <span className="text-[10px] px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary, #000)' }}>You</span>}
                      </p>
                    </div>

                    {/* Net Worth */}
                    <p className="text-[13px] font-medium tabular-nums text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {inr(entry.net_worth, 0)}
                    </p>

                    {/* P/L */}
                    <div className="flex items-center justify-end gap-1">
                      {isProfit ? <TrendingUp className="w-3 h-3" style={{ color: 'var(--accent)' }} /> : <TrendingDown className="w-3 h-3" style={{ color: 'var(--red)' }} />}
                      <span className="text-[12px] font-medium tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: isProfit ? 'var(--accent)' : 'var(--red)' }}>
                        {isProfit ? '+' : ''}{entry.pnl_pct.toFixed(2)}%
                      </span>
                    </div>

                    {/* Trades */}
                    <p className="text-[12px] tabular-nums text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {entry.total_trades}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

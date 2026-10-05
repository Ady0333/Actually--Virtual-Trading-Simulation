import { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Medal } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  initials: string;
  netWorth: number;
  profitLoss: number;
  profitLossPercent: number;
  totalTrades: number;
  level: number;
  isCurrentUser?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'Arjun Sharma', initials: 'AS', netWorth: 1425000, profitLoss: 425000, profitLossPercent: 42.5, totalTrades: 84, level: 12 },
  { rank: 2, username: 'Priya Patel', initials: 'PP', netWorth: 1380000, profitLoss: 380000, profitLossPercent: 38.0, totalTrades: 71, level: 11 },
  { rank: 3, username: 'Rahul Verma', initials: 'RV', netWorth: 1295000, profitLoss: 295000, profitLossPercent: 29.5, totalTrades: 63, level: 10 },
  { rank: 4, username: 'Sneha Iyer', initials: 'SI', netWorth: 1215000, profitLoss: 215000, profitLossPercent: 21.5, totalTrades: 58, level: 9 },
  { rank: 5, username: 'John Doe', initials: 'JD', netWorth: 1185000, profitLoss: 185000, profitLossPercent: 18.5, totalTrades: 52, level: 8, isCurrentUser: true },
  { rank: 6, username: 'Amit Kumar', initials: 'AK', netWorth: 1120000, profitLoss: 120000, profitLossPercent: 12.0, totalTrades: 47, level: 7 },
  { rank: 7, username: 'Divya Nair', initials: 'DN', netWorth: 1085000, profitLoss: 85000, profitLossPercent: 8.5, totalTrades: 39, level: 7 },
  { rank: 8, username: 'Vikram Singh', initials: 'VS', netWorth: 1042000, profitLoss: 42000, profitLossPercent: 4.2, totalTrades: 31, level: 6 },
  { rank: 9, username: 'Kavya Reddy', initials: 'KR', netWorth: 1018000, profitLoss: 18000, profitLossPercent: 1.8, totalTrades: 28, level: 5 },
  { rank: 10, username: 'Rohan Gupta', initials: 'RG', netWorth: 985000, profitLoss: -15000, profitLossPercent: -1.5, totalTrades: 24, level: 4 },
];

export default function Leaderboard() {
  const [period, setPeriod] = useState<'all' | 'monthly' | 'weekly'>('all');
  const currentUser = MOCK_LEADERBOARD.find(e => e.isCurrentUser);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #FFD700, #FF9D00)', color: '#000', icon: '🥇' };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', color: '#000', icon: '🥈' };
    if (rank === 3) return { bg: 'linear-gradient(135deg, #CD7F32, #8B4513)', color: '#fff', icon: '🥉' };
    return { bg: 'var(--bg-elevated)', color: 'var(--text-muted)', icon: null };
  };

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
          Top traders ranked by portfolio performance
        </p>
      </div>

      {/* Your Rank Card */}
      {currentUser && (
        <div className="rounded-lg border p-4 mb-5 flex items-center gap-4"
          style={{ backgroundColor: 'var(--accent-dim)', borderColor: 'var(--accent)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary, #000)', fontFamily: 'var(--font-ui)' }}>
            {currentUser.initials}
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
              Your Rank
            </p>
            <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              #{currentUser.rank} out of {MOCK_LEADERBOARD.length} traders
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>Net Worth</p>
            <p className="text-[15px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              ₹{(currentUser.netWorth / 100000).toFixed(2)}L
            </p>
          </div>
        </div>
      )}

      {/* Period Filter */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'all', label: 'All Time' },
          { id: 'monthly', label: 'This Month' },
          { id: 'weekly', label: 'This Week' },
        ].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id as any)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-medium"
            style={{
              fontFamily: 'var(--font-ui)',
              backgroundColor: period === p.id ? 'var(--accent-dim)' : 'var(--bg-elevated)',
              border: `1px solid ${period === p.id ? 'var(--accent)' : 'var(--border-default)'}`,
              color: period === p.id ? 'var(--accent)' : 'var(--text-secondary)',
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[MOCK_LEADERBOARD[1], MOCK_LEADERBOARD[0], MOCK_LEADERBOARD[2]].map((entry, i) => {
          const heights = ['h-24', 'h-32', 'h-20'];
          const badge = getRankBadge(entry.rank);
          return (
            <div key={entry.rank}
              className={`${heights[i]} rounded-lg flex flex-col items-center justify-center p-3 relative`}
              style={{
                backgroundColor: entry.isCurrentUser ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                border: `1px solid ${entry.isCurrentUser ? 'var(--accent)' : 'var(--border-dim)'}`,
              }}>
              <div className="absolute -top-3 text-xl">{badge.icon}</div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold mb-1"
                style={{ background: badge.bg, color: badge.color }}>
                {entry.initials}
              </div>
              <p className="text-[11px] font-semibold text-center" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>
                {entry.username.split(' ')[0]}
              </p>
              <p className="text-[10px] tabular-nums mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                +{entry.profitLossPercent}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Full Rankings Table */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-dim)' }}>
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Full Rankings
          </h3>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_120px_120px_80px_60px] px-4 py-2 border-b"
          style={{ borderColor: 'var(--border-dim)' }}>
          {['#', 'Trader', 'Net Worth', 'P/L', 'Trades', 'Level'].map((col, i) => (
            <span key={col} className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', textAlign: i >= 2 ? 'right' : 'left' }}>
              {col}
            </span>
          ))}
        </div>

        {MOCK_LEADERBOARD.map((entry, index) => {
          const badge = getRankBadge(entry.rank);
          const isProfit = entry.profitLoss >= 0;
          return (
            <div key={entry.rank}
              className="grid grid-cols-[40px_1fr_120px_120px_80px_60px] px-4 py-3 items-center"
              style={{
                borderBottom: index === MOCK_LEADERBOARD.length - 1 ? 'none' : '1px solid var(--border-dim)',
                backgroundColor: entry.isCurrentUser ? 'var(--accent-dim)' : 'transparent',
              }}
              onMouseEnter={e => { if (!entry.isCurrentUser) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!entry.isCurrentUser) e.currentTarget.style.backgroundColor = 'transparent'; }}>

              {/* Rank */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ background: badge.bg, color: badge.color }}>
                {badge.icon || entry.rank}
              </div>

              {/* Trader */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: entry.isCurrentUser ? 'var(--accent)' : 'var(--bg-elevated)', color: entry.isCurrentUser ? 'var(--bg-primary, #000)' : 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                  {entry.initials}
                </div>
                <div>
                  <p className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>
                    {entry.username} {entry.isCurrentUser && <span className="text-[10px] px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary, #000)' }}>You</span>}
                  </p>
                </div>
              </div>

              {/* Net Worth */}
              <p className="text-[13px] font-medium tabular-nums text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                ₹{(entry.netWorth / 100000).toFixed(2)}L
              </p>

              {/* P/L */}
              <div className="flex items-center justify-end gap-1">
                {isProfit ? <TrendingUp className="w-3 h-3" style={{ color: 'var(--accent)' }} /> : <TrendingDown className="w-3 h-3" style={{ color: 'var(--red)' }} />}
                <span className="text-[12px] font-medium tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: isProfit ? 'var(--accent)' : 'var(--red)' }}>
                  {isProfit ? '+' : ''}{entry.profitLossPercent}%
                </span>
              </div>

              {/* Trades */}
              <p className="text-[12px] tabular-nums text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {entry.totalTrades}
              </p>

              {/* Level */}
              <div className="flex justify-end">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                  style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  Lv.{entry.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
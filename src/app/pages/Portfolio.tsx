import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { API_BASE } from '../../config';

const USD_TO_INR = 83.5;

interface Holding {
  ticker: string;
  shares: number;
  avg_price: number;
  current_price: number;
  market_value: number;
  pnl: number;
}

interface PortfolioData {
  cash: number;
  total_value: number;
  holdings: Holding[];
}

export default function Portfolio() {
  const { user } = useAuth();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 const fetchPortfolio = async () => {
  const token = localStorage.getItem('token');  // ADD THIS LINE
  if (!token) { setLoading(false); return; }
  setLoading(true);
  setError('');
  
    try {
      const res = await fetch(`${API_BASE}/api/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load portfolio');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  // Cash and values in INR
  const cashInr = (data?.cash ?? 0) * USD_TO_INR;
  const totalValueInr = (data?.total_value ?? 0) * USD_TO_INR;
  const holdingsInr = data?.holdings.map(h => ({
    ...h,
    avg_price_inr: h.avg_price * USD_TO_INR,
    current_price_inr: h.current_price * USD_TO_INR,
    market_value_inr: h.market_value * USD_TO_INR,
    pnl_inr: h.pnl * USD_TO_INR,
    pnl_pct: h.avg_price > 0 ? ((h.current_price - h.avg_price) / h.avg_price) * 100 : 0,
  })) ?? [];

  const totalPnl = holdingsInr.reduce((sum, h) => sum + h.pnl_inr, 0);
  const investedValue = holdingsInr.reduce((sum, h) => sum + h.avg_price_inr * h.shares, 0);
  const totalPnlPct = investedValue > 0 ? (totalPnl / investedValue) * 100 : 0;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          Please log in to view your portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            My Portfolio
          </h1>
          <p className="text-sm" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
            {user?.username}'s holdings and performance
          </p>
        </div>
        <button
          onClick={fetchPortfolio}
          className="flex items-center gap-1.5 px-3 h-8 rounded text-xs font-medium"
          style={{
            fontFamily: 'var(--font-ui)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--red-dim)', border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font-ui)' }}>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Portfolio Value', value: `₹${totalValueInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, color: 'var(--text-primary)' },
          { label: 'Cash Balance', value: `₹${cashInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, color: 'var(--accent)' },
          {
            label: 'Total P/L',
            value: `${totalPnl >= 0 ? '+' : ''}₹${Math.abs(totalPnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
            color: totalPnl >= 0 ? 'var(--accent)' : 'var(--red)',
            sub: `${totalPnl >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`,
          },
          { label: 'Holdings', value: `${holdingsInr.length} Stocks`, color: 'var(--text-primary)' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="rounded-lg border p-5"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>
              {label}
            </p>
            <p className="text-xl font-medium tabular-nums" style={{ fontFamily: 'var(--font-mono)', color }}>
              {value}
            </p>
            {sub && (
              <p className="text-xs mt-0.5 tabular-nums" style={{ fontFamily: 'var(--font-mono)', color }}>
                {sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Holdings Table */}
      <div className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-dim)' }}>
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Holdings
          </h3>
        </div>

        {holdingsInr.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-2xl mb-2">📊</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
              No holdings yet. Go to Markets and buy some stocks!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-dim)' }}>
                  {['Symbol', 'Shares', 'Avg Price', 'Current Price', 'Market Value', 'P/L'].map((col, i) => (
                    <th key={col}
                      className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', textAlign: i === 0 ? 'left' : 'right' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdingsInr.map((h, index) => {
                  const isProfit = h.pnl_inr >= 0;
                  return (
                    <tr key={h.ticker}
                      style={{ borderBottom: index === holdingsInr.length - 1 ? 'none' : '1px solid var(--border-dim)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          {h.ticker}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          {h.shares}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          ₹{h.avg_price_inr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          ₹{h.current_price_inr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          ₹{h.market_value_inr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isProfit
                            ? <TrendingUp className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                            : <TrendingDown className="w-3 h-3" style={{ color: 'var(--red)' }} />
                          }
                          <div>
                            <span className="text-[13px] font-medium tabular-nums"
                              style={{ fontFamily: 'var(--font-mono)', color: isProfit ? 'var(--accent)' : 'var(--red)' }}>
                              {isProfit ? '+' : ''}₹{Math.abs(h.pnl_inr).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs ml-1 tabular-nums"
                              style={{ fontFamily: 'var(--font-mono)', color: isProfit ? 'var(--accent)' : 'var(--red)' }}>
                              ({isProfit ? '+' : ''}{h.pnl_pct.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
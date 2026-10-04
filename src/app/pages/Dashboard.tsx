import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart, Activity } from 'lucide-react';
import { useNavigate } from 'react-router';
import { API_BASE } from '../../config';
import { useMarketFeed } from '../hooks/useMarketFeed';
import { inr, timeAgo, authHeaders } from '../lib/format';

interface PortfolioSummary {
  cash: number;
  total_value: number;
  total_pnl: number;
  total_pnl_pct: number;
}

interface Trade {
  id: number;
  type: 'buy' | 'sell';
  ticker: string;
  shares: number;
  total: number;
  timestamp: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { news } = useMarketFeed();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<Trade[] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          fetch(`${API_BASE}/api/portfolio`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/transactions?limit=6`, { headers: authHeaders() }),
        ]);
        if (pRes.ok) setPortfolio(await pRes.json());
        setRecentActivity(tRes.ok ? await tRes.json() : []);
      } catch {
        setRecentActivity([]);
      }
    };
    load();
    // Holdings are re-priced every tick; refresh the summary periodically
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const pnl = portfolio?.total_pnl ?? 0;
  const pnlPct = portfolio?.total_pnl_pct ?? 0;
  const isUp = pnl >= 0;
  const fmt = (v: number | undefined) => (portfolio ? inr(v ?? 0) : '…');

  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="container mx-auto px-6 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{fmt(portfolio?.total_value)}</p>
              {portfolio && (
                <p className={`text-xs mt-1 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {isUp ? '+' : ''}{pnlPct.toFixed(2)}% all time
                </p>
              )}
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Cash Balance</p>
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{fmt(portfolio?.cash)}</p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {fmt(portfolio ? portfolio.total_value - portfolio.cash : 0)}
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total P/L</p>
                {isUp ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
              </div>
              <p className={`text-3xl font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                {portfolio ? `${isUp ? '+' : '-'}${inr(Math.abs(pnl))}` : '…'}
              </p>
              {portfolio && (
                <p className={`text-xs mt-1 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
                </p>
              )}
            </div>
          </div>

          {/* Main Content - Recent Activity + Live News */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity - LEFT (2/3 width) */}
            <div className="lg:col-span-2 bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                  </h2>
                  <button onClick={() => navigate('/transactions')} className="text-sm text-primary hover:text-primary/80 transition">View All →</button>
                </div>
              </div>

              <div className="divide-y divide-border">
                {recentActivity === null ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">Loading…</div>
                ) : recentActivity.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No trades yet.{' '}
                    <button onClick={() => navigate('/markets')} className="text-primary hover:underline">Make your first trade →</button>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-accent/30 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'
                          }`}>
                            {activity.type === 'buy' ? (
                              <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {activity.type.toUpperCase()} {activity.ticker}
                            </p>
                            <p className="text-xs text-foreground/60">
                              x{activity.shares} shares
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{inr(activity.total)}</p>
                          <p className="text-xs text-foreground/60">{timeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live News Headlines - RIGHT (1/3 width) */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live News
                </h2>
              </div>

              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {news.length > 0 ? (
                  news.slice(0, 10).map((item) => (
                    <div key={item.timestamp + item.headline} className="p-4 hover:bg-accent/30 transition">
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.bias === 'bullish'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {item.bias === 'bullish' ? '📈' : '📉'}
                        </span>
                        {item.ticker && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {item.ticker}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-2">
                        {item.headline}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Waiting for live news...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

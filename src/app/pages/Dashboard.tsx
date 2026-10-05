import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart, Activity } from 'lucide-react';
import { useNavigate } from 'react-router';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';

const USD_TO_INR = 83.5;
import { API_BASE, WS_BASE } from '../../config';
const ws = new WebSocket(`${WS_BASE}/ws`);

interface NewsItem {
  headline: string;
  ticker?: string;
  sector?: string;
  timestamp: string;
  bias: 'bullish' | 'bearish';
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState({
    netWorth: 51957.46,
    cashBalance: 45678.32,
    portfolioValue: 6279.14,
    todayPnL: 58.14
  });

  // WebSocket for live news
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.news) {
        setNews(data.news);
      }
    };

    return () => ws.close();
  }, []);

  // Fetch portfolio stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/portfolio`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        const cashINR = data.cash * USD_TO_INR;
        const portfolioValueINR = (data.total_value - data.cash) * USD_TO_INR;
        const netWorthINR = data.total_value * USD_TO_INR;

        setStats({
          netWorth: netWorthINR,
          cashBalance: cashINR,
          portfolioValue: portfolioValueINR,
          todayPnL: 58.14 // Mock for now
        });
      } catch {
        // stats fetch failed silently
      }
    };

    fetchStats();
  }, []);

  const recentActivity = [
    { type: 'BUY', symbol: 'AAPL', shares: 10, price: 14900.57, time: '4h ago' },
    { type: 'SELL', symbol: 'GOOGL', shares: 5, price: 11716.72, time: '5h ago' },
    { type: 'BUY', symbol: 'MSFT', shares: 8, price: 34669.2, time: '1d ago' },
    { type: 'BUY', symbol: 'NVDA', shares: 3, price: 73342.23, time: '2d ago' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <main className="pt-16">
        <div className="container mx-auto px-6 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">₹{stats.netWorth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-green-500 mt-1">+0.93%</p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Cash Balance</p>
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">₹{stats.cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">₹{stats.portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Today P/L</p>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-500">+₹{stats.todayPnL.toFixed(2)}</p>
              <p className="text-xs text-green-500 mt-1">+0.93%</p>
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
                {recentActivity.map((activity, i) => (
                  <div key={i} className="p-4 hover:bg-accent/30 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.type === 'BUY' ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {activity.type === 'BUY' ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {activity.type} {activity.symbol}
                          </p>
                          <p className="text-xs text-foreground/60">
                            x{activity.shares} shares
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₹{activity.price.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-foreground/60">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
                  news.map((item, i) => (
                    <div key={i} className="p-4 hover:bg-accent/30 transition">
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
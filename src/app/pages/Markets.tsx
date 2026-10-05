import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, Plus, Minus } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';

const USD_TO_INR = 83.5;
import { API_BASE, WS_BASE } from '../../config';
const ws = new WebSocket(`${WS_BASE}/ws`);

interface Stock {
  ticker: string;  // CHANGED from symbol
  name: string;
  sector: string;
  price: number;
  change_pct: number;  // CHANGED from change
}

interface TradeModalProps {
  stock: Stock | null;
  onClose: () => void;
  onTrade: (ticker: string, quantity: number, action: 'buy' | 'sell') => void;
  userHoldings: Record<string, number>;
}

function TradeModal({ stock, onClose, onTrade, userHoldings }: TradeModalProps) {
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

  if (!stock) return null;

  const priceINR = stock.price * USD_TO_INR;
  const totalCost = priceINR * quantity;
  const availableShares = userHoldings[stock.ticker] || 0;

  const canSell = availableShares >= quantity;
  const canBuy = user && (user.cash * USD_TO_INR) >= totalCost;

  const handleTrade = () => {
    if (action === 'sell' && !canSell) {
      alert(`You only have ${availableShares} shares of ${stock.ticker}`);
      return;
    }
    if (action === 'buy' && !canBuy) {
      alert('Insufficient funds');
      return;
    }
    onTrade(stock.ticker, quantity, action);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-lg p-6 w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">{stock.sector}</p>
            <h2 className="text-lg font-semibold text-foreground">{stock.ticker} · {stock.name}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-background rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">CURRENT PRICE</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">₹{priceINR.toLocaleString('en-IN')}</p>
            <p className={`text-sm font-medium ${stock.change_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAction('buy')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${action === 'buy'
                ? 'bg-green-500 text-white'
                : 'bg-background text-foreground/50 hover:text-foreground border border-border'
              }`}
          >
            BUY
          </button>
          <button
            onClick={() => setAction('sell')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${action === 'sell'
                ? 'bg-red-500 text-white'
                : 'bg-background text-foreground/50 hover:text-foreground border border-border'
              }`}
          >
            SELL
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-muted-foreground mb-2">QUANTITY (SHARES)</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-background border border-border hover:bg-accent transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-background border border-border hover:bg-accent transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {action === 'sell' && (
            <p className="text-xs text-muted-foreground mt-2">
              You own {availableShares} shares
            </p>
          )}
        </div>

        <div className="mb-6 p-4 bg-background rounded-lg border border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price per share</span>
            <span className="font-medium">₹{priceINR.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span className="font-medium">{quantity} shares</span>
          </div>
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-medium">{action === 'buy' ? 'You Pay' : 'You Receive'}</span>
              <span className="text-lg font-bold">₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleTrade}
          disabled={(action === 'sell' && !canSell) || (action === 'buy' && !canBuy)}
          className={`w-full py-3 rounded-lg font-semibold transition ${action === 'buy'
              ? 'bg-green-500 hover:bg-green-600 text-white disabled:bg-green-500/50 disabled:cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/50 disabled:cursor-not-allowed'
            }`}
        >
          {action === 'buy' ? `Buy ${quantity} Shares` : `Sell ${quantity} Shares`}
        </button>

        {action === 'sell' && !canSell && (
          <p className="text-xs text-red-500 text-center mt-2">
            Insufficient shares to sell
          </p>
        )}
        {action === 'buy' && !canBuy && (
          <p className="text-xs text-red-500 text-center mt-2">
            Insufficient funds
          </p>
        )}
      </div>
    </div>
  );
}

export default function Markets() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [userHoldings, setUserHoldings] = useState<Record<string, number>>({});
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const holdings: Record<string, number> = {};
      data.holdings?.forEach((pos: any) => {
        holdings[pos.ticker] = pos.shares;
      });
      setUserHoldings(holdings);
    } catch {
      // holdings fetch failed silently
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws`);

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStocks(data.stocks);
      applyFilter(data.stocks, filter);
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    return () => ws.close();
  }, []);

  const applyFilter = (stockList: Stock[], filterType: 'all' | 'gainers' | 'losers') => {
    let filtered = [...stockList];
    if (filterType === 'gainers') {
      filtered = filtered.filter(s => s.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct);
    } else if (filterType === 'losers') {
      filtered = filtered.filter(s => s.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct);
    }
    setFilteredStocks(filtered);
  };

  useEffect(() => {
    applyFilter(stocks, filter);
  }, [filter, stocks]);

  const handleTrade = async (ticker: string, quantity: number, action: 'buy' | 'sell') => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = action === 'buy' ? '/api/buy' : '/api/sell';

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ticker, shares: quantity })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${ticker}`);
        refreshUser();
        fetchHoldings();
      } else {
        alert(data.detail || 'Trade failed');
      }
    } catch {
      alert('Trade failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <main className="container mx-auto px-6 pt-24 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">All Stocks</h1>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${wsConnected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {wsConnected ? 'Live' : 'Demo'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-card text-muted-foreground hover:bg-accent border border-border'
              }`}
          >
            All <span className="text-xs opacity-70">{stocks.length}</span>
          </button>
          <button
            onClick={() => setFilter('gainers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'gainers'
                ? 'bg-green-500 text-white'
                : 'bg-card text-muted-foreground hover:bg-accent border border-border'
              }`}
          >
            Gainers <span className="text-xs opacity-70">{stocks.filter(s => s.change_pct > 0).length}</span>
          </button>
          <button
            onClick={() => setFilter('losers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'losers'
                ? 'bg-red-500 text-white'
                : 'bg-card text-muted-foreground hover:bg-accent border border-border'
              }`}
          >
            Losers <span className="text-xs opacity-70">{stocks.filter(s => s.change_pct < 0).length}</span>
          </button>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-accent/50">
              <tr className="text-left text-xs text-muted-foreground uppercase">
                <th className="px-6 py-4 font-medium">#</th>
                <th className="px-6 py-4 font-medium">Symbol</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Sector</th>
                <th className="px-6 py-4 font-medium text-right">Price (₹)</th>
                <th className="px-6 py-4 font-medium text-right">Change %</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock, index) => (
                <tr key={stock.ticker} className="border-t border-border hover:bg-accent/30 transition">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{stock.ticker?.substring(0, 2) || 'N/A'}</span>
                      </div>
                      <span className="font-semibold text-foreground">{stock.ticker}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{stock.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 text-xs rounded bg-accent text-foreground">
                      {stock.sector}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">
                    ₹{(stock.price * USD_TO_INR).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex items-center gap-1 font-medium ${stock.change_pct >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {stock.change_pct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedStock(stock)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <TradeModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onTrade={handleTrade}
        userHoldings={userHoldings}
      />
    </div>
  );
}
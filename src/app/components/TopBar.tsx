import React, { useState, useRef, useEffect } from 'react';
import { Search, Wallet, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { useMarketFeed, type MarketStock } from '../hooks/useMarketFeed';
import { inr } from '../lib/format';

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MarketStock[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { stocks, connected } = useMarketFeed();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const q = searchQuery.trim().toLowerCase();
    const filtered = stocks.filter(stock =>
      stock.ticker.toLowerCase().includes(q) ||
      stock.name.toLowerCase().includes(q) ||
      stock.sector.toLowerCase().includes(q)
    );
    setSearchResults(filtered.slice(0, 10));
    setShowResults(true);
  }, [searchQuery, stocks]);

  return (
    <div className="relative shrink-0 z-40 bg-background border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block">Actually</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stocks — NVDA, TSLA, AAPL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Search Results Dropdown - FIXED WITH SOLID BACKGROUND */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl overflow-hidden max-h-96 overflow-y-auto z-50">
              <div className="px-3 py-2 bg-accent border-b border-border">
                <p className="text-xs text-muted-foreground font-medium">
                  {searchResults.length} RESULTS FOR "{searchQuery.toUpperCase()}"
                </p>
              </div>
              {searchResults.map((stock) => (
                <Link
                  key={stock.ticker}
                  to={`/markets?ticker=${encodeURIComponent(stock.ticker)}`}
                  onClick={() => {
                    setShowResults(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition border-b border-border last:border-0 bg-card"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{stock.ticker.substring(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{stock.ticker}</p>
                    <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-medium text-foreground">{inr(stock.price)}</span>
                    <p className={`text-xs ${stock.change_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
              <div className="px-4 py-2 bg-accent border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Click a result to trade it
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Market Status */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full ${connected ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className={`text-xs font-medium ${connected ? 'text-green-500' : 'text-red-500'}`}>{connected ? 'Market Live' : 'Connecting…'}</span>
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg">
            <Wallet className="w-4 h-4 text-primary" />
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground leading-none mb-0.5">Wallet</p>
              <p className="text-sm font-semibold text-foreground leading-none">
                {inr(user?.cash ?? 0)}
              </p>
            </div>
          </div>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-accent rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
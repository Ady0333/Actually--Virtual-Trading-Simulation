import React, { useState, useRef, useEffect } from 'react';
import { Search, Wallet, TrendingUp, TrendingDown, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';

const POPULAR_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'Equity', currency: 'USD' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', currency: 'USD' },
  { symbol: 'META', name: 'Meta Platforms', type: 'Equity', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Equity', currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', currency: 'USD' },
  { symbol: 'JPM', name: 'JPMorgan Chase', type: 'Equity', currency: 'USD' },
  { symbol: 'V', name: 'Visa Inc.', type: 'Equity', currency: 'USD' },
];

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof POPULAR_STOCKS>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

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

    const filtered = POPULAR_STOCKS.filter(stock =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
    setShowResults(true);
  }, [searchQuery]);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
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
                  key={stock.symbol}
                  to="/markets"
                  onClick={() => {
                    setShowResults(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition border-b border-border last:border-0 bg-card"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{stock.symbol.substring(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{stock.type}</span>
                    <p className="text-xs text-muted-foreground">{stock.currency}</p>
                  </div>
                </Link>
              ))}
              <div className="px-4 py-2 bg-accent border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Click any result to go to Markets page
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Market Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium text-green-500">NSE Open</span>
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg">
            <Wallet className="w-4 h-4 text-primary" />
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground leading-none mb-0.5">Wallet</p>
              <p className="text-sm font-semibold text-foreground leading-none">
                ₹{user ? (user.cash * 83.5).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
          </div>

          {/* P/L Badge (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-green-500/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-500">+₹0.00 (+0.00%)</span>
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
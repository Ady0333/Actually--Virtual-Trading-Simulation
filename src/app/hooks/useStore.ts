/// <reference types="vite/client" />
import { useState, useEffect, useCallback } from 'react';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
}

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  name: string;
  shares: number;
  price: number;
  total: number;
  date: string;
  time: string;
}

const COMPANY_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.', MSFT: 'Microsoft Corp.', GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com Inc.', TSLA: 'Tesla Inc.', NVDA: 'NVIDIA Corp.',
  META: 'Meta Platforms', NFLX: 'Netflix Inc.', JPM: 'JPMorgan Chase',
  V: 'Visa Inc.', AMD: 'Advanced Micro Devices', INTC: 'Intel Corp.',
  DIS: 'Walt Disney Co.', PYPL: 'PayPal Holdings', UBER: 'Uber Technologies',
  COIN: 'Coinbase Global', SPOT: 'Spotify Technology', SNAP: 'Snap Inc.',
  MA: 'Mastercard Inc.', UNH: 'UnitedHealth Group',
};

// Default mock prices as fallback
const MOCK_PRICES: Record<string, number> = {
  AAPL: 178.45, MSFT: 415.23, GOOGL: 142.68, AMZN: 178.92,
  TSLA: 234.56, NVDA: 878.45, META: 512.34, NFLX: 623.12,
  JPM: 198.72, V: 275.60, AMD: 168.90, INTC: 43.22,
  DIS: 111.34, PYPL: 62.45, UBER: 74.80, COIN: 198.30,
  SPOT: 312.45, SNAP: 11.23, MA: 462.18, UNH: 521.30,
};

// ── Singleton state (persists across component mounts) ──────────────────────
let _walletBalance = 45678.32;
let _holdings: Holding[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgPrice: 175.20, currentPrice: 178.45, totalValue: 1784.50, profitLoss: 32.50, profitLossPercent: 1.85 },
  { symbol: 'TSLA', name: 'Tesla Inc.', shares: 5, avgPrice: 245.00, currentPrice: 234.56, totalValue: 1172.80, profitLoss: -52.20, profitLossPercent: -4.26 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 8, avgPrice: 405.50, currentPrice: 415.23, totalValue: 3321.84, profitLoss: 77.84, profitLossPercent: 2.40 },
];
let _transactions: Transaction[] = [
  { id: '1', type: 'buy', symbol: 'AAPL', name: 'Apple Inc.', shares: 5, price: 175.20, total: 876.00, date: 'Feb 15, 2026', time: '10:30 AM' },
  { id: '2', type: 'buy', symbol: 'MSFT', name: 'Microsoft Corp.', shares: 3, price: 405.50, total: 1216.50, date: 'Feb 14, 2026', time: '2:15 PM' },
  { id: '3', type: 'sell', symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 2, price: 142.68, total: 285.36, date: 'Feb 13, 2026', time: '11:45 AM' },
  { id: '4', type: 'buy', symbol: 'TSLA', name: 'Tesla Inc.', shares: 5, price: 245.00, total: 1225.00, date: 'Feb 12, 2026', time: '9:20 AM' },
  { id: '5', type: 'buy', symbol: 'AAPL', name: 'Apple Inc.', shares: 5, price: 178.30, total: 891.50, date: 'Feb 11, 2026', time: '3:50 PM' },
  { id: '6', type: 'buy', symbol: 'MSFT', name: 'Microsoft Corp.', shares: 5, price: 410.00, total: 2050.00, date: 'Feb 10, 2026', time: '1:10 PM' },
];
let _livePrices: Record<string, number> = { ...MOCK_PRICES };
let _listeners: Array<() => void> = [];

function notify() { _listeners.forEach(fn => fn()); }

// ── Fetch live price from Alpha Vantage ─────────────────────────────────────
async function fetchPrice(symbol: string, apiKey: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );
    const data = await res.json();
    const q = data['Global Quote'];
    if (!q || !q['05. price']) return null;
    return parseFloat(q['05. price']);
  } catch { return null; }
}

// ── Recalculate holdings with latest prices ──────────────────────────────────
function recalcHoldings() {
  _holdings = _holdings.map(h => {
    const currentPrice = _livePrices[h.symbol] || h.avgPrice;
    const totalValue = currentPrice * h.shares;
    const profitLoss = (currentPrice - h.avgPrice) * h.shares;
    const profitLossPercent = ((currentPrice - h.avgPrice) / h.avgPrice) * 100;
    return { ...h, currentPrice, totalValue, profitLoss, profitLossPercent };
  });
}

// ── Main store hook ──────────────────────────────────────────────────────────
export function useStore() {
  const [, forceUpdate] = useState(0);
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY || '';

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    _listeners.push(listener);
    return () => { _listeners = _listeners.filter(l => l !== listener); };
  }, []);

  // Fetch live prices for holdings on mount
  useEffect(() => {
    if (!apiKey) return;
    const symbols = [...new Set(_holdings.map(h => h.symbol))].slice(0, 3);
    Promise.all(symbols.map(async s => {
      const price = await fetchPrice(s, apiKey);
      if (price) _livePrices[s] = price;
    })).then(() => { recalcHoldings(); notify(); });
  }, [apiKey]);

  const totalPortfolioValue = _holdings.reduce((s, h) => s + h.totalValue, 0);
  const totalProfitLoss = _holdings.reduce((s, h) => s + h.profitLoss, 0);
  const totalProfitLossPercent = totalPortfolioValue > 0
    ? (totalProfitLoss / (totalPortfolioValue - totalProfitLoss)) * 100 : 0;
  const netWorth = _walletBalance + totalPortfolioValue;

  // ── BUY ──────────────────────────────────────────────────────────────────
  const buyStock = useCallback(async (symbol: string, shares: number) => {
    let price = _livePrices[symbol] || MOCK_PRICES[symbol] || 100;
    if (apiKey) {
      const live = await fetchPrice(symbol, apiKey);
      if (live) { price = live; _livePrices[symbol] = live; }
    }
    const total = price * shares;
    if (_walletBalance < total) throw new Error(`Insufficient balance. Need $${total.toFixed(2)}`);

    _walletBalance -= total;

    const existing = _holdings.find(h => h.symbol === symbol);
    if (existing) {
      const newShares = existing.shares + shares;
      const newAvg = (existing.avgPrice * existing.shares + price * shares) / newShares;
      existing.shares = newShares;
      existing.avgPrice = newAvg;
    } else {
      _holdings.push({
        symbol, name: COMPANY_NAMES[symbol] || symbol,
        shares, avgPrice: price, currentPrice: price,
        totalValue: total, profitLoss: 0, profitLossPercent: 0,
      });
    }
    recalcHoldings();

    const now = new Date();
    _transactions.unshift({
      id: Date.now().toString(), type: 'buy', symbol,
      name: COMPANY_NAMES[symbol] || symbol, shares, price, total,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
    notify();
    return { price, total };
  }, [apiKey]);

  // ── SELL ─────────────────────────────────────────────────────────────────
  const sellStock = useCallback(async (symbol: string, shares: number) => {
    const holding = _holdings.find(h => h.symbol === symbol);
    if (!holding) throw new Error(`You don't own ${symbol}`);
    if (holding.shares < shares) throw new Error(`Only ${holding.shares} shares available`);

    let price = _livePrices[symbol] || holding.currentPrice;
    if (apiKey) {
      const live = await fetchPrice(symbol, apiKey);
      if (live) { price = live; _livePrices[symbol] = live; }
    }
    const total = price * shares;
    _walletBalance += total;

    holding.shares -= shares;
    if (holding.shares === 0) {
      _holdings = _holdings.filter(h => h.symbol !== symbol);
    } else {
      recalcHoldings();
    }

    const now = new Date();
    _transactions.unshift({
      id: Date.now().toString(), type: 'sell', symbol,
      name: COMPANY_NAMES[symbol] || symbol, shares, price, total,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
    notify();
    return { price, total };
  }, [apiKey]);

  return {
    walletBalance: _walletBalance,
    holdings: _holdings,
    transactions: _transactions,
    livePrices: _livePrices,
    totalPortfolioValue,
    totalProfitLoss,
    totalProfitLossPercent,
    netWorth,
    buyStock,
    sellStock,
    isLive: !!apiKey,
  };
}
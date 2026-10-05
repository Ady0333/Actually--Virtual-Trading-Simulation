import { create } from 'zustand';

const API = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000/ws';

const useStore = create((set, get) => ({
  // ── Auth State ──
  token: localStorage.getItem('actually_token') || null,
  username: localStorage.getItem('actually_user') || null,
  cash: 50000,
  totalValue: 50000,

  // ── Market State ──
  stocks: [],
  news: [],
  holdings: [],
  stockInfo: {},

  // ── WebSocket ──
  ws: null,

  // ── UI State ──
  tradeError: null,
  tradeSuccess: null,

  // ── Auth Actions ──
  setAuth: (token, username, cash) => {
    localStorage.setItem('actually_token', token);
    localStorage.setItem('actually_user', username);
    set({ token, username, cash });
  },

  logout: () => {
    localStorage.removeItem('actually_token');
    localStorage.removeItem('actually_user');
    const ws = get().ws;
    if (ws) ws.close();
    set({ token: null, username: null, cash: 50000, ws: null, holdings: [], stocks: [], news: [] });
  },

  login: async (username, password) => {
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    get().setAuth(data.token, data.username, data.cash);
    return data;
  },

  register: async (username, password) => {
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    get().setAuth(data.token, data.username, data.cash);
    return data;
  },

  // ── WebSocket ──
  connectWS: () => {
    const existing = get().ws;
    if (existing && existing.readyState <= 1) return;

    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        set({ stocks: data.stocks || [], news: data.news || [] });
      } catch (e) {}
    };
    ws.onclose = () => {
      set({ ws: null });
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (get().token) get().connectWS();
      }, 3000);
    };
    ws.onerror = () => ws.close();
    // Send periodic pings to keep alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === 1) ws.send('ping');
      else clearInterval(pingInterval);
    }, 30000);

    set({ ws });
  },

  // ── Portfolio ──
  fetchPortfolio: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      set({ cash: data.cash, totalValue: data.total_value, holdings: data.holdings });
    } catch (e) {}
  },

  // ── Stock Info ──
  fetchStockInfo: async (ticker) => {
    const token = get().token;
    if (!token || !ticker) return;
    // Don't refetch if we already have it
    if (get().stockInfo[ticker]) return;

    try {
      const res = await fetch(`${API}/api/stocks/${ticker}/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      set(s => ({ stockInfo: { ...s.stockInfo, [ticker]: data } }));
    } catch (e) {}
  },

  // ── Trading ──
  buyStock: async (ticker, shares) => {
    const token = get().token;
    set({ tradeError: null, tradeSuccess: null });
    try {
      const res = await fetch(`${API}/api/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticker, shares: parseInt(shares) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Buy failed');
      set({ tradeSuccess: data.message, cash: data.cash });
      get().fetchPortfolio();
    } catch (e) {
      set({ tradeError: e.message });
    }
  },

  sellStock: async (ticker, shares) => {
    const token = get().token;
    set({ tradeError: null, tradeSuccess: null });
    try {
      const res = await fetch(`${API}/api/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticker, shares: parseInt(shares) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Sell failed');
      set({ tradeSuccess: data.message, cash: data.cash });
      get().fetchPortfolio();
    } catch (e) {
      set({ tradeError: e.message });
    }
  },

  clearTradeMessages: () => set({ tradeError: null, tradeSuccess: null }),
}));

export default useStore;

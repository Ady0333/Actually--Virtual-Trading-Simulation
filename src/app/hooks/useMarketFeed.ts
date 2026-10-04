import { useEffect, useState } from 'react';
import { WS_BASE } from '../../config';

export interface MarketStock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change_pct: number;
}

export interface MarketNews {
  headline: string;
  ticker?: string | null;
  sector?: string | null;
  timestamp: string;
  bias: 'bullish' | 'bearish';
}

interface FeedState {
  stocks: MarketStock[];
  news: MarketNews[];
  connected: boolean;
}

// One shared WebSocket for the whole app, opened while at least one component
// is subscribed and reconnected automatically if the backend drops (e.g. a
// Render free-tier instance waking up).
let state: FeedState = { stocks: [], news: [], connected: false };
const listeners = new Set<(s: FeedState) => void>();
let socket: WebSocket | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 1000;

function emit(next: Partial<FeedState>) {
  state = { ...state, ...next };
  listeners.forEach(fn => fn(state));
}

function connect() {
  if (socket || listeners.size === 0) return;
  const ws = new WebSocket(`${WS_BASE}/ws`);
  socket = ws;

  ws.onopen = () => {
    retryDelay = 1000;
    emit({ connected: true });
  };
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      emit({ stocks: data.stocks ?? state.stocks, news: data.news ?? state.news });
    } catch {
      // ignore malformed frames
    }
  };
  ws.onclose = () => {
    if (socket === ws) socket = null;
    emit({ connected: false });
    if (listeners.size > 0 && !retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        connect();
      }, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  };
}

function disconnect() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  if (socket) {
    const ws = socket;
    socket = null;
    ws.onclose = null;
    ws.close();
  }
  state = { ...state, connected: false };
}

export function useMarketFeed(): FeedState {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => {
    listeners.add(setSnapshot);
    setSnapshot(state);
    connect();
    return () => {
      listeners.delete(setSnapshot);
      if (listeners.size === 0) disconnect();
    };
  }, []);

  return snapshot;
}

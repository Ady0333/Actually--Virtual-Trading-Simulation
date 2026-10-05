import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import useStore from '../store/useStore';

export default function Ticker() {
  const stocks = useStore((s) => s.stocks);

  // Duplicate array for seamless infinite scroll
  const doubled = useMemo(() => [...stocks, ...stocks], [stocks]);

  if (!stocks.length) {
    return (
      <div className="bg-surf-800 border-b border-surf-600 py-2 px-4 shadow-sm">
        <div className="text-xs text-brand animate-pulse text-center tracking-widest font-sans font-medium">
          CONNECTING TO MARKET FEED...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-surf-600 overflow-hidden shadow-sm relative">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      <div className="ticker-track py-2">
        {doubled.map((stock, i) => {
          const isUp = stock.change_pct >= 0;
          return (
            <div
              key={`${stock.ticker}-${i}`}
              className="flex items-center gap-2 px-5 whitespace-nowrap shrink-0 group"
            >
              <span className="text-xs font-bold text-gray-800 group-hover:text-brand transition-colors">{stock.ticker}</span>
              <span className={`text-xs font-bold ${isUp ? 'text-emerald-500' : 'text-crimson'}`}>
                ${stock.price.toFixed(2)}
              </span>
              <span className={`text-[10px] flex items-center gap-0.5 ${isUp ? 'text-emerald-600' : 'text-crimson'}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%
              </span>
              <span className="text-surf-600 text-xs">│</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

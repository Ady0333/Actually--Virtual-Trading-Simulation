import React from 'react';
import { Briefcase, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import useStore from '../store/useStore';

export default function Portfolio() {
  const holdings = useStore((s) => s.holdings);
  const cash = useStore((s) => s.cash);
  const totalValue = useStore((s) => s.totalValue);
  const stocks = useStore((s) => s.stocks);

  // Get live prices from WebSocket
  const getPrice = (ticker) => {
    const s = stocks.find((st) => st.ticker === ticker);
    return s ? s.price : 0;
  };

  const totalPnl = holdings.reduce((acc, h) => {
    const live = getPrice(h.ticker);
    return acc + (live - h.avg_price) * h.shares;
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-surf-600 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-surf-600 bg-gray-50/50 rounded-t-xl">
        <Briefcase className="w-4 h-4 text-brand" />
        <h2 className="text-sm font-bold text-gray-900 tracking-wider">PORTFOLIO</h2>
      </div>

      {/* Cash & Value summary */}
      <div className="grid grid-cols-2 gap-3 mb-4 mt-4 mx-4">
        <div className="bg-surf-800 rounded-lg p-3 border border-surf-600 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Wallet className="w-3 h-3 text-brand" />
            <span className="text-[10px] text-gray-500 font-bold tracking-wider">CASH</span>
          </div>
          <p className="text-sm font-bold text-gray-900 font-mono">${cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-surf-800 rounded-lg p-3 border border-surf-600 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Briefcase className="w-3 h-3 text-brand" />
            <span className="text-[10px] text-gray-500 font-bold tracking-wider">TOTAL P/L</span>
          </div>
          <p className={`text-sm font-bold font-mono ${totalPnl >= 0 ? 'text-emerald-600' : 'text-crimson'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Holdings list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {holdings.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">No positions yet</p>
            <p className="text-[10px] text-gray-700 mt-1">Buy some stocks to get started</p>
          </div>
        ) : (
          holdings.map((h) => {
            const livePrice = getPrice(h.ticker);
            const pnl = (livePrice - h.avg_price) * h.shares;
            const pnlPct = ((livePrice - h.avg_price) / h.avg_price) * 100;
            const isUp = pnl >= 0;
            const marketVal = livePrice * h.shares;

            return (
              <div
                key={h.ticker}
                className={`p-3 rounded-lg border transition-all mx-4 mb-2 shadow-sm
                  ${isUp
                    ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                    : 'bg-red-50 border-red-200 hover:border-red-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-surf-600/50">
                  <span className="text-xs font-bold text-gray-900">{h.ticker}</span>
                  <span className={`text-[10px] flex items-center gap-0.5 font-bold
                    ${isUp ? 'text-emerald-600' : 'text-crimson'}`}>
                    {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shares</span>
                    <span className="text-gray-900 font-mono">{h.shares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg</span>
                    <span className="text-gray-900 font-mono">${h.avg_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Live</span>
                    <span className={`font-mono font-bold ${isUp ? 'text-emerald-600' : 'text-crimson'}`}>${livePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">P/L</span>
                    <span className={`font-bold font-mono ${isUp ? 'text-emerald-600' : 'text-crimson'}`}>
                      {isUp ? '+' : ''}${pnl.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-surf-600/50 flex justify-between text-[10px]">
                  <span className="text-gray-500 font-medium">Market Value</span>
                  <span className="text-gray-900 font-bold font-mono">${marketVal.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

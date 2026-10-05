import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowDownToLine, TrendingUp, TrendingDown, Search, ExternalLink } from 'lucide-react';
import useStore from '../store/useStore';

export default function StockList() {
  const navigate = useNavigate();
  const stocks = useStore((s) => s.stocks);
  const buyStock = useStore((s) => s.buyStock);
  const sellStock = useStore((s) => s.sellStock);
  const tradeError = useStore((s) => s.tradeError);
  const tradeSuccess = useStore((s) => s.tradeSuccess);
  const clearTradeMessages = useStore((s) => s.clearTradeMessages);

  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState('');

  const setQty = (ticker, val) => {
    setQuantities((prev) => ({ ...prev, [ticker]: val }));
  };

  const filtered = stocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleTrade = async (action, ticker) => {
    const qty = parseInt(quantities[ticker]) || 0;
    if (qty <= 0) return;
    if (action === 'buy') await buyStock(ticker, qty);
    else await sellStock(ticker, qty);
    setQuantities((prev) => ({ ...prev, [ticker]: '' }));
    setTimeout(() => clearTradeMessages(), 4000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-surf-600 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surf-600 bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-gray-900 tracking-wider">MARKET</h2>
          <span className="text-[10px] text-gray-500 ml-1">({stocks.length})</span>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-36 bg-white border border-surf-600 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-800
              placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-sans shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Trade messages */}
      {tradeSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-3 mx-4 mt-4 text-[11px] font-semibold text-emerald-600 animate-fade-in">
          {tradeSuccess}
        </div>
      )}
      {tradeError && (
        <div className="bg-crimson/10 border border-crimson/20 rounded-lg px-3 py-2 mb-3 mx-4 mt-4 text-[11px] font-semibold text-crimson animate-fade-in">
          {tradeError}
        </div>
      )}

      {/* Stock list */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {filtered.map((stock) => {
          const isUp = stock.change_pct >= 0;
          const qty = quantities[stock.ticker] || '';
          return (
            <div
              key={stock.ticker}
              className="flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-surf-800 transition-colors group cursor-pointer"
              onClick={() => navigate(`/stock/${stock.ticker}`)}
            >
              {/* Ticker and price */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-gray-900 group-hover:text-brand transition-colors">{stock.ticker}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`text-[10px] font-bold flex items-center gap-0.5
                    ${isUp ? 'text-emerald-500' : 'text-crimson'}`}>
                    {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold ${isUp ? 'text-emerald-600' : 'text-crimson'}`}>
                    ${stock.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate font-medium">{stock.name}</span>
                </div>
              </div>

              {/* Quantity input */}
              <input
                type="number"
                min="1"
                value={qty}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setQty(stock.ticker, e.target.value)}
                placeholder="qty"
                className="w-14 bg-white border border-surf-600 rounded px-2 py-1.5 text-[11px] text-center
                  text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-mono shadow-sm transition-all"
              />

              {/* Buy / Sell */}
              <button
                onClick={(e) => { e.stopPropagation(); handleTrade('buy', stock.ticker); }}
                className="px-3 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold
                  hover:bg-emerald-100 transition-all tracking-wider shadow-sm"
              >
                BUY
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleTrade('sell', stock.ticker); }}
                className="px-3 py-1.5 rounded bg-red-50 border border-red-200 text-crimson text-[10px] font-bold
                  hover:bg-red-100 transition-all tracking-wider shadow-sm"
              >
                SELL
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

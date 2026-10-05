import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Activity, Info, BarChart3 } from 'lucide-react';
import useStore from '../store/useStore';

export default function StockDetail() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const { stocks, stockInfo, fetchStockInfo, tradeSuccess, tradeError, buyStock, sellStock, clearTradeMessages } = useStore();
  const [qty, setQty] = React.useState('');

  useEffect(() => {
    fetchStockInfo(ticker);
  }, [ticker, fetchStockInfo]);

  const liveStock = stocks.find(s => s.ticker === ticker);
  const info = stockInfo[ticker];

  const handleTrade = async (action) => {
    const q = parseInt(qty) || 0;
    if (q <= 0) return;
    if (action === 'buy') await buyStock(ticker, q);
    else await sellStock(ticker, q);
    setQty('');
    setTimeout(() => clearTradeMessages(), 4000);
  };

  if (!liveStock || !info) {
    return (
      <div className="min-h-screen bg-surf-900 flex items-center justify-center">
        <div className="text-brand animate-pulse tracking-widest text-sm font-sans flex items-center gap-2">
          <Activity className="w-5 h-5" />
          FETCHING DATA FOR {ticker}...
        </div>
      </div>
    );
  }

  const isUp = liveStock.change_pct >= 0;

  return (
    <div className="min-h-screen bg-surf-900 text-gray-800 p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full relative z-10">
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-6 text-sm tracking-wider font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
        </button>

        {/* Main Card */}
        <div className="card-glass rounded-xl p-8 mb-6 relative overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{ticker}</h1>
                <span className="bg-surf-600 px-2.5 py-1 rounded-md text-xs text-gray-700 font-semibold shadow-sm">
                  {info.sector}
                </span>
              </div>
              <p className="text-xl text-gray-500 font-medium">{info.name}</p>
            </div>

            <div className="text-right">
              <p className={`text-5xl font-extrabold tracking-tight mb-2 font-mono ${isUp ? 'text-emerald-500' : 'text-crimson'}`}>
                ${liveStock.price.toFixed(2)}
              </p>
              <p className={`text-lg font-bold flex items-center justify-end gap-1 ${isUp ? 'text-emerald-500' : 'text-crimson'}`}>
                {isUp ? '+' : ''}{liveStock.change_pct.toFixed(2)}%
                <Activity className="w-4 h-4 ml-1 opacity-70" />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Col: Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-surf-600">
                <h2 className="flex items-center gap-2 text-sm font-bold text-brand tracking-wider mb-4">
                  <Info className="w-4 h-4" /> COMPANY SUMMARY
                </h2>
                <p className="text-gray-600 leading-relaxed font-sans mb-5 text-sm">
                  {info.summary}
                </p>
                {info.url && (
                  <a href={info.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brand hover:text-brand-light transition-colors font-bold uppercase tracking-wider">
                    READ MORE ON WIKIPEDIA <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Col: Trade */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-surf-600">
                <h2 className="flex items-center gap-2 text-sm font-bold text-brand tracking-wider mb-5">
                  <BarChart3 className="w-4 h-4" /> QUICK TRADE
                </h2>
                
                {tradeSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 text-xs font-semibold text-emerald-600">
                    {tradeSuccess}
                  </div>
                )}
                {tradeError && (
                  <div className="bg-crimson/10 border border-crimson/20 rounded-lg px-3 py-2 mb-4 text-xs font-semibold text-crimson">
                    {tradeError}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">QUANTITY</label>
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder="0"
                      className="w-full bg-surf-800 border border-surf-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-mono transition-shadow shadow-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleTrade('buy')}
                      className="py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm tracking-wider"
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => handleTrade('sell')}
                      className="py-3 rounded-lg bg-crimson hover:bg-crimson-dim text-white text-xs font-bold transition-all shadow-sm tracking-wider"
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Newspaper, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import useStore from '../store/useStore';

export default function NewsFeed() {
  const news = useStore((s) => s.news);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-surf-600 h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-surf-600 bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-gray-900 tracking-wider">LIVE NEWS</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-surf-800 px-2 py-1 rounded-md border border-surf-600 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-[10px] text-gray-600 font-bold tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {news.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Waiting for headlines...</p>
          </div>
        ) : (
          news.map((item, i) => {
            const isBullish = item.bias === 'bullish';
            return (
              <div
                key={i}
                className={`p-3 rounded-lg border transition-all animate-fade-in mx-4 mb-2
                  ${isBullish
                    ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                    : 'bg-red-50 border-red-200 hover:border-red-300'
                  }`}
              >
                <div className="flex items-start gap-2">
                  {isBullish
                    ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    : <TrendingDown className="w-3.5 h-3.5 text-crimson mt-0.5 shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className="text-xs text-gray-800 leading-relaxed font-medium">{item.headline}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      {item.ticker && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded
                          ${isBullish ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          ${item.ticker}
                        </span>
                      )}
                      {item.sector && (
                        <span className="text-[10px] font-semibold text-gray-600 bg-surf-800 border border-surf-600 px-1.5 py-0.5 rounded shadow-sm">
                          {item.sector}
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-gray-500 ml-auto">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

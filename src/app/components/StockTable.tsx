import { TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '../data/mockData';
import { useState } from 'react';

interface StockTableProps {
  stocks: Stock[];
}

export function StockTable({ stocks }: StockTableProps) {
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const filteredStocks = stocks.filter(stock => {
    if (filter === 'gainers') return stock.change > 0;
    if (filter === 'losers') return stock.change < 0;
    return true;
  });

  const handleTrade = (symbol: string) => {
    console.log(`Trade ${symbol}`);
  };

  return (
    <div 
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-dim)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-dim)' }}>
        <h3 
          className="text-sm font-bold"
          style={{ 
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)'
          }}
        >
          Markets
        </h3>
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['all', 'gainers', 'losers'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className="h-6 px-3 rounded text-[11px] font-medium capitalize"
              style={{
                fontFamily: 'var(--font-ui)',
                backgroundColor: filter === filterType ? 'var(--bg-elevated)' : 'transparent',
                border: filter === filterType ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                color: filter === filterType ? 'var(--accent)' : 'var(--text-secondary)'
              }}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-dim)' }}>
              <th 
                className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-muted)',
                  width: '80px'
                }}
              >
                Symbol
              </th>
              <th 
                className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-muted)'
                }}
              >
                Company
              </th>
              <th 
                className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-muted)',
                  width: '100px'
                }}
              >
                Price
              </th>
              <th 
                className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-muted)',
                  width: '90px'
                }}
              >
                Change
              </th>
              <th 
                className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-muted)',
                  width: '90px'
                }}
              >
                Change%
              </th>
              <th 
                className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-muted)',
                  width: '80px'
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock, index) => {
              const isPositive = stock.change >= 0;
              const isSelected = selectedRow === stock.symbol;
              const isLastRow = index === filteredStocks.length - 1;
              
              return (
                <tr 
                  key={stock.symbol}
                  className="relative cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-dim)' : 'transparent',
                    borderBottom: isLastRow ? 'none' : '1px solid var(--border-dim)'
                  }}
                  onClick={() => setSelectedRow(stock.symbol)}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Active indicator */}
                  {isSelected && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-0.5"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                  
                  <td className="px-4 py-3">
                    <span 
                      className="text-[13px] font-semibold tabular-nums"
                      style={{ 
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {stock.symbol}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span 
                      className="text-xs"
                      style={{ 
                        fontFamily: 'var(--font-ui)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {stock.name}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3 text-right">
                    <span 
                      className="text-[13px] font-medium tabular-nums"
                      style={{ 
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      ${stock.price.toFixed(2)}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-2.5 h-2.5" style={{ color: 'var(--accent)' }} />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" style={{ color: 'var(--red)' }} />
                      )}
                      <span 
                        className="text-xs font-medium tabular-nums"
                        style={{ 
                          fontFamily: 'var(--font-mono)',
                          color: isPositive ? 'var(--accent)' : 'var(--red)'
                        }}
                      >
                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-right">
                    <span 
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium tabular-nums"
                      style={{ 
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: isPositive ? 'var(--accent-dim)' : 'var(--red-dim)',
                        color: isPositive ? 'var(--accent)' : 'var(--red)'
                      }}
                    >
                      {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrade(stock.symbol);
                      }}
                      className="h-6 px-3 rounded text-[11px] font-semibold"
                      style={{
                        fontFamily: 'var(--font-ui)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.color = 'var(--accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-strong)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

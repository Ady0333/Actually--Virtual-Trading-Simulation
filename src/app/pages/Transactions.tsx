import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { API_BASE } from '../../config';
import { inr, authHeaders } from '../lib/format';

interface Transaction {
  id: number;
  type: 'buy' | 'sell';
  ticker: string;
  name: string;
  shares: number;
  price: number;
  total: number;
  realized_pnl: number | null;
  timestamp: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/transactions?limit=500`, { headers: authHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load transactions');
        return res.json();
      })
      .then(setTransactions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const buyCount = transactions.filter((t) => t.type === 'buy').length;
  const sellCount = transactions.filter((t) => t.type === 'sell').length;

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 
          className="text-2xl font-bold mb-1"
          style={{ 
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}
        >
          Transactions
        </h1>
        <p 
          className="text-sm"
          style={{ 
            fontFamily: 'var(--font-ui)',
            color: 'var(--text-secondary)'
          }}
        >
          View your trading history and activity
        </p>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div 
          className="rounded-lg border p-5"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-dim)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <p 
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ 
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-muted)'
              }}
            >
              Total Transactions
            </p>
          </div>
          <p 
            className="text-2xl font-medium tabular-nums"
            style={{ 
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)'
            }}
          >
            {transactions.length}
          </p>
        </div>

        <div 
          className="rounded-lg border p-5"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-dim)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <p 
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ 
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-muted)'
              }}
            >
              Buy Orders
            </p>
          </div>
          <p 
            className="text-2xl font-medium tabular-nums"
            style={{ 
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)'
            }}
          >
            {buyCount}
          </p>
        </div>

        <div 
          className="rounded-lg border p-5"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-dim)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="w-4 h-4" style={{ color: 'var(--red)' }} />
            <p 
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ 
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-muted)'
              }}
            >
              Sell Orders
            </p>
          </div>
          <p 
            className="text-2xl font-medium tabular-nums"
            style={{ 
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)'
            }}
          >
            {sellCount}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-dim)'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-dim)' }}>
          <h3 
            className="text-sm font-bold"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)'
            }}
          >
            Recent Transactions
          </h3>
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
                    color: 'var(--text-muted)'
                  }}
                >
                  Type
                </th>
                <th 
                  className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--text-muted)'
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
                    color: 'var(--text-muted)'
                  }}
                >
                  Shares
                </th>
                <th 
                  className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--text-muted)'
                  }}
                >
                  Price
                </th>
                <th 
                  className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--text-muted)'
                  }}
                >
                  Total
                </th>
                <th 
                  className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--text-muted)'
                  }}
                >
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Loading…</td></tr>
              )}
              {!loading && (error || transactions.length === 0) && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-xs" style={{ color: error ? 'var(--red)' : 'var(--text-muted)' }}>
                  {error || 'No transactions yet — trades you make on the Markets page will show up here.'}
                </td></tr>
              )}
              {transactions.map((transaction, index) => {
                const isBuy = transaction.type === 'buy';
                const isLastRow = index === transactions.length - 1;
                const when = new Date(transaction.timestamp);

                return (
                  <tr 
                    key={transaction.id}
                    style={{
                      borderBottom: isLastRow ? 'none' : '1px solid var(--border-dim)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{
                            backgroundColor: isBuy ? 'var(--accent-dim)' : 'var(--red-dim)'
                          }}
                        >
                          {isBuy ? (
                            <ArrowUpRight className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                          ) : (
                            <ArrowDownLeft className="w-3 h-3" style={{ color: 'var(--red)' }} />
                          )}
                        </div>
                        <span 
                          className="text-xs font-semibold uppercase"
                          style={{ 
                            fontFamily: 'var(--font-ui)',
                            color: isBuy ? 'var(--accent)' : 'var(--red)'
                          }}
                        >
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className="text-[13px] font-semibold tabular-nums"
                        style={{ 
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {transaction.ticker}
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
                        {transaction.name}
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
                        {transaction.shares}
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
                        {inr(transaction.price)}
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
                        {inr(transaction.total)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p 
                          className="text-xs font-medium"
                          style={{ 
                            fontFamily: 'var(--font-ui)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {when.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p 
                          className="text-[10px]"
                          style={{ 
                            fontFamily: 'var(--font-ui)',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

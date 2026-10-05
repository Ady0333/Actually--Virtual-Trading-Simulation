import { ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';

interface Transaction {
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

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 5,
    price: 175.20,
    total: 876.00,
    date: 'Feb 15, 2026',
    time: '10:30 AM',
  },
  {
    id: '2',
    type: 'buy',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 3,
    price: 405.50,
    total: 1216.50,
    date: 'Feb 14, 2026',
    time: '2:15 PM',
  },
  {
    id: '3',
    type: 'sell',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 2,
    price: 142.68,
    total: 285.36,
    date: 'Feb 13, 2026',
    time: '11:45 AM',
  },
  {
    id: '4',
    type: 'buy',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 5,
    price: 245.00,
    total: 1225.00,
    date: 'Feb 12, 2026',
    time: '9:20 AM',
  },
  {
    id: '5',
    type: 'buy',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 5,
    price: 178.30,
    total: 891.50,
    date: 'Feb 11, 2026',
    time: '3:50 PM',
  },
  {
    id: '6',
    type: 'buy',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 5,
    price: 410.00,
    total: 2050.00,
    date: 'Feb 10, 2026',
    time: '1:10 PM',
  },
];

export default function Transactions() {
  const buyCount = mockTransactions.filter((t) => t.type === 'buy').length;
  const sellCount = mockTransactions.filter((t) => t.type === 'sell').length;

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
            {mockTransactions.length}
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
              {mockTransactions.map((transaction, index) => {
                const isBuy = transaction.type === 'buy';
                const isLastRow = index === mockTransactions.length - 1;

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
                        {transaction.symbol}
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
                        ${transaction.price.toFixed(2)}
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
                        ${transaction.total.toFixed(2)}
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
                          {transaction.date}
                        </p>
                        <p 
                          className="text-[10px]"
                          style={{ 
                            fontFamily: 'var(--font-ui)',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {transaction.time}
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

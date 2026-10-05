import { Wallet, TrendingUp, PieChart, Star } from 'lucide-react';

interface PortfolioSummaryProps {
  walletBalance: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export function PortfolioSummary({ walletBalance, totalValue, profitLoss, profitLossPercent }: PortfolioSummaryProps) {
  const isProfit = profitLoss >= 0;
  const totalAssets = walletBalance + totalValue;

  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-6 h-6 text-yellow-300" />
        <h3 className="text-lg font-bold text-white">Portfolio Summary</h3>
        <Star className="w-5 h-5 text-yellow-300 ml-auto" />
      </div>

      <div className="space-y-4">
        {/* Total Assets */}
        <div className="p-5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
          <p className="text-sm text-yellow-200 mb-1 font-semibold">💎 Total Assets</p>
          <p className="text-3xl font-bold text-white">
            ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Wallet Balance */}
        <div className="flex items-center justify-between p-4 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-300" />
            <span className="text-sm text-white font-semibold">💵 Cash Balance</span>
          </div>
          <span className="font-bold text-white text-lg">
            ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Invested Value */}
        <div className="flex items-center justify-between p-4 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-300" />
            <span className="text-sm text-white font-semibold">📈 Invested Value</span>
          </div>
          <span className="font-bold text-white text-lg">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Total P/L */}
        <div className={`p-5 rounded-xl border-2 shadow-xl ${isProfit ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300' : 'bg-gradient-to-br from-red-400 to-rose-500 border-red-300'}`}>
          <p className="text-sm text-white mb-1 font-semibold">{isProfit ? '🎉' : '💪'} Total Profit/Loss</p>
          <p className={`text-2xl font-bold text-white`}>
            {isProfit ? '+' : ''}${profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm text-white font-bold`}>
            {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
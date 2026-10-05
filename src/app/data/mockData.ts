export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  timestamp: string;
}

export interface PortfolioStock {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export const mockStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 2.35, changePercent: 1.33 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.68, change: -1.22, changePercent: -0.85 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.23, change: 5.67, changePercent: 1.38 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.92, change: -2.45, changePercent: -1.35 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 234.56, change: 8.92, changePercent: 3.95 },
  { symbol: 'META', name: 'Meta Platforms', price: 512.34, change: 3.21, changePercent: 0.63 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 878.45, change: 15.67, changePercent: 1.81 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 623.12, change: -4.32, changePercent: -0.69 },
];

export const mockNews: NewsItem[] = [
  {
    id: '1',
    headline: 'Tech Stocks Rally on Strong Earnings Reports',
    summary: 'Major technology companies exceeded Q4 expectations, driving market optimism. NVDA and MSFT lead gains with strong AI revenue growth.',
    sentiment: 'Positive',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    headline: 'Federal Reserve Maintains Interest Rates',
    summary: 'The Fed kept rates steady at 5.25%-5.50%, signaling a cautious approach to inflation management amid economic uncertainty.',
    sentiment: 'Neutral',
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    headline: 'Amazon Faces Regulatory Challenges in EU',
    summary: 'European regulators announce new antitrust investigation into Amazon\'s marketplace practices, potentially impacting future operations.',
    sentiment: 'Negative',
    timestamp: '6 hours ago',
  },
  {
    id: '4',
    headline: 'Apple Announces New Product Launch Event',
    summary: 'Apple confirms March event for next-generation devices. Analysts predict positive impact on Q2 revenue with strong pre-order expectations.',
    sentiment: 'Positive',
    timestamp: '8 hours ago',
  },
  {
    id: '5',
    headline: 'Global Markets Show Mixed Signals',
    summary: 'Asian markets closed lower while European indices remain flat. Investors await US employment data for direction.',
    sentiment: 'Neutral',
    timestamp: '10 hours ago',
  },
  {
    id: '6',
    headline: 'Tesla Production Targets Miss Estimates',
    summary: 'Tesla reports Q4 deliveries below analyst expectations, citing supply chain disruptions. Stock price shows increased volatility.',
    sentiment: 'Negative',
    timestamp: '12 hours ago',
  },
];

export const mockPortfolio: PortfolioStock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 10,
    avgPrice: 175.20,
    currentPrice: 178.45,
    totalValue: 1784.50,
    profitLoss: 32.50,
    profitLossPercent: 1.85,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 5,
    avgPrice: 245.00,
    currentPrice: 234.56,
    totalValue: 1172.80,
    profitLoss: -52.20,
    profitLossPercent: -4.26,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 8,
    avgPrice: 405.50,
    currentPrice: 415.23,
    totalValue: 3321.84,
    profitLoss: 77.84,
    profitLossPercent: 2.40,
  },
];

export const walletBalance = 45678.32;
export const totalPortfolioValue = mockPortfolio.reduce((sum, stock) => sum + stock.totalValue, 0);
export const totalProfitLoss = mockPortfolio.reduce((sum, stock) => sum + stock.profitLoss, 0);
export const totalProfitLossPercent = (totalProfitLoss / (totalPortfolioValue - totalProfitLoss)) * 100;
export const netWorth = walletBalance + totalPortfolioValue;
export const todayProfitLoss = 58.14;
export const todayProfitLossPercent = 0.93;
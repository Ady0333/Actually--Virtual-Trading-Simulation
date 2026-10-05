/// <reference types="vite/client" />
import { useState, useEffect } from 'react';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  bullets: string[];
}

// Determine sentiment from title/description
function getSentiment(text: string): 'Positive' | 'Negative' | 'Neutral' {
  const positive = ['surge', 'gain', 'rise', 'rally', 'beat', 'record', 'high', 'growth', 'profit', 'up', 'bull', 'strong', 'boost', 'exceed', 'soar'];
  const negative = ['fall', 'drop', 'decline', 'loss', 'crash', 'down', 'bear', 'miss', 'weak', 'cut', 'sell', 'fear', 'risk', 'debt', 'recession'];
  const lower = text.toLowerCase();
  const posScore = positive.filter(w => lower.includes(w)).length;
  const negScore = negative.filter(w => lower.includes(w)).length;
  if (posScore > negScore) return 'Positive';
  if (negScore > posScore) return 'Negative';
  return 'Neutral';
}

// Generate bullet points from description/content
function generateBullets(title: string, description: string): string[] {
  const text = description || title;
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  const bullets = sentences.slice(0, 3);
  if (bullets.length < 2) {
    bullets.push('Market analysts are monitoring this development closely.');
    bullets.push('Investors are advised to watch for further updates.');
  }
  return bullets.slice(0, 4);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Mock fallback news
const MOCK_NEWS: NewsArticle[] = [
  { id: '1', title: 'Tech Stocks Rally on Strong Earnings Reports', description: 'Major technology companies exceeded Q4 expectations. NVDA and MSFT lead gains with strong AI revenue growth. Investors remain optimistic about the sector outlook.', content: '', url: '#', source: 'Bloomberg', publishedAt: new Date(Date.now() - 7200000).toISOString(), sentiment: 'Positive', bullets: ['NVIDIA and Microsoft exceeded Q4 earnings expectations significantly', 'AI revenue growth is driving investor confidence across tech sector', 'Analysts upgraded price targets for several major tech companies'] },
  { id: '2', title: 'Federal Reserve Maintains Interest Rates at 5.25%', description: 'The Fed kept rates steady signaling a cautious approach to inflation management. Policymakers remain data-dependent for future decisions. Markets responded positively to the announcement.', content: '', url: '#', source: 'CNBC', publishedAt: new Date(Date.now() - 14400000).toISOString(), sentiment: 'Neutral', bullets: ['Fed holds rates steady at 5.25%-5.50% for third consecutive meeting', 'Powell signals data-dependent approach to future rate decisions', 'Markets interpreted the pause as a sign inflation is cooling'] },
  { id: '3', title: 'Amazon Faces Regulatory Challenges in European Markets', description: 'European regulators announce new antitrust investigation into Amazon marketplace practices. The investigation could impact future operations and revenue streams in the region.', content: '', url: '#', source: 'Reuters', publishedAt: new Date(Date.now() - 21600000).toISOString(), sentiment: 'Negative', bullets: ['EU regulators launch formal antitrust probe into Amazon marketplace', 'Investigation focuses on preferential treatment of Amazon own products', 'Potential fines could reach up to 10% of global annual revenue'] },
  { id: '4', title: 'Apple Announces New Product Launch Event for March', description: 'Apple confirms March event for next-generation devices. Analysts predict positive impact on Q2 revenue with strong pre-order expectations from global markets.', content: '', url: '#', source: 'Bloomberg', publishedAt: new Date(Date.now() - 28800000).toISOString(), sentiment: 'Positive', bullets: ['Apple schedules product event for late March at Apple Park campus', 'New iPhone and MacBook models expected to debut at the event', 'Pre-order demand projected to exceed previous launch cycles by 15%'] },
  { id: '5', title: 'Global Markets Show Mixed Signals Ahead of Jobs Data', description: 'Asian markets closed lower while European indices remain flat. Investors await US employment data for market direction. Volatility index remains elevated.', content: '', url: '#', source: 'Financial Times', publishedAt: new Date(Date.now() - 36000000).toISOString(), sentiment: 'Neutral', bullets: ['Asian markets fell 0.8% on concerns about China economic slowdown', 'European stocks flat as traders await US non-farm payroll data', 'VIX volatility index rose 3 points signaling increased uncertainty'] },
  { id: '6', title: 'Tesla Deliveries Miss Q4 Estimates Amid Supply Issues', description: 'Tesla reports Q4 deliveries below analyst expectations citing supply chain disruptions. Stock price shows increased volatility in after-hours trading session.', content: '', url: '#', source: 'Reuters', publishedAt: new Date(Date.now() - 43200000).toISOString(), sentiment: 'Negative', bullets: ['Tesla delivered 484,000 vehicles in Q4, missing the 500,000 estimate', 'Supply chain disruptions at Gigafactory Berlin cited as main cause', 'CEO Elon Musk promises production improvements in coming quarters'] },
];

export function useNews() {
  const [news, setNews] = useState<NewsArticle[]>(MOCK_NEWS);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const apiKey = import.meta.env.VITE_NEWS_API_KEY || '';

  useEffect(() => {
    if (!apiKey) return;
    fetchNews();
  }, [apiKey]);

  const fetchNews = async () => {
    if (!apiKey) return;
    setLoading(true);
    try {
      // NewsAPI — finance/stock market only
      const res = await fetch(
        `https://newsapi.org/v2/everything?` +
        `q=stock+market+OR+finance+OR+investing+OR+earnings+OR+nasdaq+OR+BSE+OR+NSE&` +
        `language=en&` +
        `sortBy=publishedAt&` +
        `pageSize=10&` +
        `apiKey=${apiKey}`
      );
      const data = await res.json();

      if (data.status === 'ok' && data.articles?.length > 0) {
        const articles: NewsArticle[] = data.articles
          .filter((a: any) => a.title && a.title !== '[Removed]')
          .slice(0, 10)
          .map((a: any, i: number) => ({
            id: String(i + 1),
            title: a.title,
            description: a.description || a.title,
            content: a.content || '',
            url: a.url,
            source: a.source?.name || 'News',
            publishedAt: a.publishedAt,
            sentiment: getSentiment(a.title + ' ' + (a.description || '')),
            bullets: generateBullets(a.title, a.description || ''),
          }));
        setNews(articles);
        setIsLive(true);
      }
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  return { news, loading, isLive, fetchNews, timeAgo };
}
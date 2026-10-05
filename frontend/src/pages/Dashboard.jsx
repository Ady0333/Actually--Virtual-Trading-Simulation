import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, DollarSign, Briefcase } from 'lucide-react';
import useStore from '../store/useStore';
import Ticker from '../components/Ticker';
import NewsFeed from '../components/NewsFeed';
import StockList from '../components/StockList';
import Portfolio from '../components/Portfolio';

export default function Dashboard() {
  const { token, username, cash, totalValue, connectWS, fetchPortfolio, logout } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
    connectWS();
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const portfolioGain = totalValue - 50000;
  const isGain = portfolioGain >= 0;

  return (
    <div className="min-h-screen bg-surf-900 flex flex-col">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-brand/5 blur-[150px]" />
      </div>

      {/* Ticker Tape */}
      <div className="relative z-10 border-b border-surf-600 bg-white">
        <Ticker />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-surf-600 px-6 py-4 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-brand/20 flex items-center justify-center shadow-sm">
               <Activity className="w-6 h-6 text-brand" />
            </div>
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-brand-gradient tracking-[0.25em]">ACTUALLY</h1>
          </div>

          {/* Learning Center */}
          <div className="hidden xl:flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest mr-2 uppercase border-r border-surf-600 pr-4">Academy</span>
            {[
              { id: 'p7HKvqRI_Bo', title: 'How the Stock Market Works' },
              { id: 'ZCFkWDdmXG8', title: 'Stock Market in 5 Minutes' },
              { id: '8NjhwuccwXE', title: 'Stock Market For Beginners' },
              { id: 'WEDIj9JBTC8', title: 'Basics of Stock Market' },
              { id: 'iTEaA8m1Mfc', title: 'Investing 101' }
            ].map(video => (
              <a 
                key={video.id} 
                href={`https://www.youtube.com/watch?v=${video.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative rounded overflow-hidden border border-surf-600 shadow-sm hover:border-brand transition-all hover:shadow-md hover:-translate-y-0.5 flex-shrink-0"
                title={video.title}
              >
                <img 
                  src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} 
                  alt={video.title} 
                  className="w-24 h-[54px] object-cover opacity-85 group-hover:opacity-100 transition-opacity" 
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="bg-brand text-white rounded px-2 py-0.5 text-[9px] font-bold shadow-sm group-hover:scale-110 transition-transform tracking-wider">
                    WATCH
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 tracking-wider">TRADER</p>
              <p className="text-xs text-neon font-medium">{username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-surf-800 border border-surf-600 text-gray-400
                hover:text-crimson hover:bg-surf-700 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid — 3 Column */}
      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6"
        style={{ height: 'calc(100vh - 120px)' }}>
        
        {/* Left — News */}
        <div className="hidden lg:block overflow-hidden">
          <NewsFeed />
        </div>

        {/* Center — Stocks */}
        <div className="overflow-hidden">
          <StockList />
        </div>

        {/* Right — Portfolio */}
        <div className="overflow-hidden">
          <Portfolio />
        </div>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, TrendingUp, ShieldAlert, BarChart3, Target, Zap, Info } from 'lucide-react';
import useStore from '../store/useStore';
import Ticker from '../components/Ticker';

export default function Landing() {
  const navigate = useNavigate();
  const token = useStore((s) => s.token);
  const connectWS = useStore((s) => s.connectWS);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    connectWS();
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [connectWS]);

  const handleCTA = () => {
    if (token) navigate('/dashboard');
    else navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-brand selection:text-white pb-20 pt-10">
      
      {/* Ticker at the top */}
      <div className="fixed w-full top-0 z-[60] border-b border-surf-600 bg-white">
        <Ticker />
      </div>

      {/* Navbar */}
      <nav className={`fixed w-full top-[37px] z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-surf-600 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-brand/20 flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-brand" />
            </div>
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-brand-gradient tracking-[0.2em]">ACTUALLY</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/auth')}
              className="text-gray-500 font-bold text-xs tracking-wider hover:text-brand transition-colors hidden md:block"
            >
              LOGIN
            </button>
            <button
              onClick={handleCTA}
              className="bg-brand-gradient hover:opacity-90 transition-opacity text-white px-6 py-2.5 rounded-lg font-bold text-xs tracking-widest shadow-md"
            >
              LET'S PLAY
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 lg:pt-48 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/5 border border-brand/10 text-brand text-[10px] font-bold tracking-widest uppercase mb-10 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          The Most Realistic Market Sandbox
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-8 max-w-4xl mx-auto">
          Learn by <span className="text-transparent bg-clip-text bg-brand-gradient">failing.</span><br />
          Master the market.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
          Losing money in the real world is devastating. Here, it's the curriculum.<br />
          Experience the brutal reality of trading with <span className="font-bold text-gray-800">₹ 1,00,000</span> in virtual cash. Make mistakes, blow up your portfolio, and build your intuition.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <button
            onClick={handleCTA}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-brand-gradient text-white font-extrabold tracking-widest text-sm flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/20 transition-all duration-300"
          >
            START TRADING NOW <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs font-bold text-gray-400 tracking-wider">100% FREE. NO ADS.</p>
        </div>
      </section>

      {/* Hero UI Abstract Mockup - BULL VS BEAR BATTLE */}
      <section className="px-6 max-w-5xl mx-auto mb-32 animate-fade-in relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60%] bg-brand/5 blur-[120px] rounded-[100%] pointer-events-none" />
        
        <div className="relative bg-white rounded-3xl border border-surf-600 shadow-2xl overflow-hidden aspect-video flex flex-col group">
          {/* Mock Header  */}
          <div className="h-16 border-b border-surf-600 flex items-center px-8 justify-between bg-gray-50/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="font-mono text-xs font-bold text-gray-400 tracking-widest uppercase">
              Simulator Arena 
            </div>
          </div>
          
          {/* Battle Body */}
          <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50/30">
            {/* Background elements */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <BarChart3 className="w-96 h-96 text-gray-900" />
            </div>

            {/* Battle Container */}
            <div className="relative w-full max-w-3xl h-64 flex flex-col sm:flex-row items-center justify-between">
              {/* Bull Side */}
              <div className="absolute left-10 md:left-24 animate-bull flex flex-col items-center z-20">
                <img src="/pixel_bull.png" alt="Bull" className="w-32 md:w-48 h-auto object-contain filter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ mixBlendMode: 'multiply' }} />
                <span className="mt-2 text-emerald-600 font-extrabold tracking-widest text-lg bg-emerald-50 px-3 py-1 rounded shadow-sm">BULLS</span>
              </div>

              {/* Shockwave epicenter */}
              <div className="absolute left-1/2 top-1/2 rounded-full border-4 border-brand lg:border-[8px] opacity-0 animate-shockwave z-10" 
                   style={{ width: '100px', height: '100px' }} />
              
              {/* Collision Text */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <span className="text-4xl font-black text-brand italic tracking-widest opacity-0 animate-shockwave block" style={{ animationDelay: '0.05s' }}>VS</span>
              </div>

              {/* Bear Side */}
              <div className="absolute right-10 md:right-24 animate-bear flex flex-col items-center z-20">
                <img src="/pixel_bear.png" alt="Bear" className="w-32 md:w-48 h-auto object-contain filter drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" style={{ mixBlendMode: 'multiply' }} />
                <span className="mt-2 text-crimson font-extrabold tracking-widest text-lg bg-red-50 px-3 py-1 rounded shadow-sm">BEARS</span>
              </div>
            </div>
            
            <p className="mt-8 relative z-20 text-gray-400 font-bold tracking-widest text-sm text-center uppercase">
              The market is a battleground.<br />
              <span className="text-brand">Who will you bet on?</span>
            </p>
          </div>
        </div>
      </section>

      {/* The Philosophy Section */}
      <section className="py-24 bg-white border-y border-surf-600 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-16">
            <h2 className="text-sm font-bold text-brand tracking-widest uppercase mb-4">The Philosophy</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              Theoretical knowledge means nothing without skin in the game.
            </h3>
            <p className="text-xl text-gray-500 leading-relaxed font-medium">
              Over 90% of beginners lose money in their first year of trading because they don't understand market psychology. You can read a hundred books, but panic-selling a massive dip is an emotion you must experience to conquer. That's why we built Actually.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 border border-surf-600 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-brand" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Zero Ramifications</h4>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">Test aggressive strategies, short sell massive trends, and make risky plays. If you lose it all, you just learn. Your real bank account remains fully intact.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-gray-50 border border-surf-600 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Psychological Training</h4>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">We recreate the anxiety of a bleeding portfolio and the euphoria of a massive gain. Master your emotions here before the real markets test them.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-gray-50 border border-surf-600 hover:shadow-lg transition-all hover:-translate-y-1 lg:col-span-1 md:col-span-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                <Info className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Organic Execution</h4>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">Watch real companies react to simulated global news. Learn how to parse headlines, gauge market bias, and execute trades instantly without the lag of traditional paper trading platforms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Are Better Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-brand tracking-widest uppercase mb-4">Why Actually?</h2>
          <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight">Better than the alternatives.</h3>
        </div>

        <div className="bg-white rounded-3xl border border-surf-600 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-surf-600">
            {/* The Rest */}
            <div className="p-12 lg:p-16">
              <h4 className="text-2xl font-bold text-gray-400 mb-8 tracking-tight">Typical Simulators</h4>
              <ul className="space-y-6">
                {[
                  "Delayed 15-minute price data",
                  "Clunky, outdated interfaces from 2012",
                  "Plagued by banner ads and paywalls",
                  "Sign-up requires your phone number and endless forms"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-gray-500 font-medium">
                    <span className="text-crimson font-bold shrink-0 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Actually */}
            <div className="p-12 lg:p-16 bg-brand/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <h4 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Actually</h4>
                <ul className="space-y-6">
                  {[
                    "Lightning-fast local market engine processing instantly",
                    "Premium, minimalist UI designed for absolute focus",
                    "100% Free. No ads. No premium tiers. No BS.",
                    "Instant 1-click registration. Start trading in 3 seconds."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-gray-800 font-medium font-sans">
                      <span className="text-brand font-bold shrink-0 mt-0.5"><Zap className="w-5 h-5" /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="pb-32 pt-16 px-6 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Ready to lose your fake money?</h2>
        <button
          onClick={handleCTA}
          className="px-10 py-5 rounded-2xl bg-brand-gradient text-white font-extrabold tracking-widest text-sm flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/30 transition-all duration-300 mx-auto"
        >
          ENTER THE SIMULATOR <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-surf-600 py-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <div className="flex items-center gap-2 opacity-50">
            <Activity className="w-4 h-4 text-gray-900" />
            <span className="text-gray-900 font-extrabold tracking-[0.2em] text-xs">ACTUALLY © {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

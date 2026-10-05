import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Terminal, Eye, EyeOff, ArrowRight, UserPlus, LogIn, Activity } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surf-900 flex items-center justify-center p-4">
      {/* Subtle luxury background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand/5 blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-light/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in flex flex-col items-center">
        {/* Luxury Logo Header */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-surf-600 flex items-center justify-center shadow-lg">
            <Activity className="w-8 h-8 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-brand-gradient tracking-widest">ACTUALLY</h1>
            <p className="mt-2 text-xl font-light text-gray-800 tracking-wide font-sans">
              Welcome to the MARKET
            </p>
          </div>
        </div>

        {/* Auth Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-crimson/10 border border-crimson/20 rounded-lg text-crimson text-sm font-medium animate-fade-in w-full">
            {error}
          </div>
        )}

        {/* Auth Card */}
        <div className="w-full card-glass rounded-2xl p-8 border-surf-600 shadow-2xl">
          {/* Tab switcher */}
          <div className="flex mb-8 border border-surf-600 rounded-xl overflow-hidden bg-surf-800/50">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold tracking-wider transition-all flex items-center justify-center gap-2
                ${isLogin ? 'bg-gradient-to-r from-brand/10 to-brand-light/10 text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LogIn className="w-4 h-4" /> LOGIN
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold tracking-wider transition-all flex items-center justify-center gap-2
                ${!isLogin ? 'bg-gradient-to-r from-brand-light/10 to-brand/10 text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <UserPlus className="w-4 h-4" /> REGISTER
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs text-gray-400 mb-2 tracking-wider">
                <span className="text-neon/60">{'>'}</span> USERNAME
              </label>
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="enter username"
                required
                className="w-full bg-surf-800 border border-surf-600 rounded-xl px-4 py-3 text-sm text-gray-900
                  placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30
                  font-sans transition-all shadow-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-400 mb-2 tracking-wider">
                <span className="text-neon/60">{'>'}</span> PASSWORD
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surf-800 border border-surf-600 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900
                    placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30
                    font-sans transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-crimson/10 border border-crimson/30 rounded-lg px-4 py-2 text-sm text-crimson">
                <span className="text-crimson/70">ERR:</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-brand-gradient hover:opacity-90 text-white font-bold py-3.5 rounded-xl tracking-wider flex items-center justify-center gap-2
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="animate-pulse-neon">PROCESSING...</span>
              ) : (
                <>
                  {isLogin ? 'AUTHENTICATE' : 'CREATE ACCOUNT'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Initial balance info */}
          {!isLogin && (
            <div className="mt-6 pt-4 border-t border-midnight-500">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">INITIAL BALANCE:</span>
                <span className="text-neon font-semibold glow-green">$50,000.00</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-600 tracking-widest">
          <span className="text-neon/20">■</span> SIMULATED MARKET • NO REAL MONEY <span className="text-neon/20">■</span>
        </div>
      </div>
    </div>
  );
}

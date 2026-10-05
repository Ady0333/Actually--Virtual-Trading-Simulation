import React, { useState } from 'react';
import { Moon, Sun, Globe, Bell, Database, User, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import TopBar from '../components/TopBar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import { API_BASE } from '../../config';

// ── Change Password Modal ──────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!currentPw || !newPw || !confirmPw) { setError('All fields are required'); return; }
    if (newPw.length < 4) { setError('New password must be at least 4 characters'); return; }
    if (newPw !== confirmPw) { setError('New passwords do not match'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to change password');
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Change Password</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg transition">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-green-500 font-medium">Password changed successfully!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: 'Current Password', value: currentPw, set: setCurrentPw, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
              { label: 'New Password', value: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(p => !p) },
              { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw, show: showNew, toggle: () => {} },
            ].map(({ label, value, set, show, toggle }) => (
              <div key={label}>
                <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => set(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  />
                  {label !== 'Confirm New Password' && (
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {error && <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reset Portfolio Modal ──────────────────────────────────────────
function ResetPortfolioModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { refreshUser } = useAuth();

  const handleReset = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reset-portfolio`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Reset failed');
      await refreshUser();
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Reset Portfolio</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg transition">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-green-500 font-medium">Portfolio reset to ₹1,00,000!</p>
          </div>
        ) : (
          <>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-5">
              <p className="text-sm font-semibold text-red-500 mb-1">⚠️ This action cannot be undone</p>
              <p className="text-xs text-foreground/70">All your holdings will be sold and your cash will be reset to <strong>₹1,00,000</strong>. Your trade history will be cleared.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition">
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Resetting...' : 'Yes, Reset'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Settings Page ─────────────────────────────────────────────
export default function Settings() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showResetPortfolio, setShowResetPortfolio] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showResetPortfolio && <ResetPortfolioModal onClose={() => setShowResetPortfolio(false)} />}

      <main className="container mx-auto px-6 pt-24 pb-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your preferences and account settings</p>

        {/* Appearance */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-3 block">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-lg border-2 transition hover:border-primary/50 ${
                  theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border bg-accent/50'
                }`}
              >
                <Moon className="w-5 h-5 mx-auto mb-2 text-foreground" />
                <p className="text-sm font-medium text-foreground">Dark</p>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-lg border-2 transition hover:border-primary/50 ${
                  theme === 'light' ? 'border-primary bg-primary/10' : 'border-border bg-accent/50'
                }`}
              >
                <Sun className="w-5 h-5 mx-auto mb-2 text-foreground" />
                <p className="text-sm font-medium text-foreground">Light</p>
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Language</label>
            <p className="text-xs text-muted-foreground mb-2">App display language</p>
            <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Price Alerts', desc: 'Get notified when stocks hit your target price', defaultChecked: true },
              { label: 'Trade Confirmations', desc: 'Get notified when trades are executed', defaultChecked: true },
              { label: 'Market News', desc: 'Receive breaking market news and updates', defaultChecked: false },
              { label: 'Weekly Report', desc: 'Portfolio performance summary every Monday', defaultChecked: false },
            ].map(({ label, desc, defaultChecked }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
                  <div className="w-11 h-6 bg-accent rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Account</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between px-4 py-3 bg-background rounded-lg hover:bg-accent transition text-sm text-foreground"
            >
              <div className="text-left">
                <p className="font-medium">Edit Profile</p>
                <p className="text-xs text-muted-foreground">Update your name and avatar</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-background rounded-lg hover:bg-accent transition text-sm text-foreground"
            >
              <div className="text-left">
                <p className="font-medium">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
            <button
              onClick={() => setShowResetPortfolio(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-background rounded-lg hover:bg-red-500/10 transition text-sm text-foreground"
            >
              <div className="text-left">
                <p className="font-medium text-red-500">Reset Portfolio</p>
                <p className="text-xs text-muted-foreground">Reset all trades and start fresh with ₹1,00,000</p>
              </div>
              <span className="text-red-500/70">→</span>
            </button>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Data & Privacy</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-background rounded-lg hover:bg-accent transition text-sm text-foreground">
              Download My Data
            </button>
            <button className="w-full text-left px-4 py-3 bg-background rounded-lg hover:bg-accent transition text-sm text-foreground">
              Privacy Settings
            </button>
            <button className="w-full text-left px-4 py-3 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition text-sm text-red-500">
              Delete Account
            </button>
          </div>
        </div>

        <button className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition">
          Save Settings
        </button>
      </main>
    </div>
  );
}

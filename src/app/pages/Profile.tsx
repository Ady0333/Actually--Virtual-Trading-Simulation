import { useState, useEffect } from 'react';
import { User, Calendar, Award, Target, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

import { API_BASE } from '../../config';

interface TradingStats {
  total_trades: number;
  successful_trades: number;
  trading_days: number;
  win_rate: number;
}

// ── Edit Profile Modal ────────────────────────────────────────────
function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) { setError('Display name cannot be empty'); return; }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ display_name: displayName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Update failed');
      await refreshUser();
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="rounded-xl p-6 w-full max-w-sm mx-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Edit Profile
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--accent-dim)' }}>
              <span className="text-lg">✓</span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
              Profile updated!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={{
                  fontFamily: 'var(--font-ui)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
              />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg"
                style={{ color: 'var(--red)', backgroundColor: 'var(--red-dim)', border: '1px solid var(--red)', fontFamily: 'var(--font-ui)' }}>
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 h-9 rounded-lg text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-ui)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', backgroundColor: 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 h-9 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2"
                style={{
                  fontFamily: 'var(--font-ui)',
                  backgroundColor: loading ? 'var(--bg-elevated)' : 'var(--accent)',
                  color: loading ? 'var(--text-muted)' : 'var(--bg-root)',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────
export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState<TradingStats>({ total_trades: 0, successful_trades: 0, trading_days: 0, win_rate: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // silent
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Holdings', value: statsLoading ? '…' : String(stats.total_trades) },
    { label: 'Profitable', value: statsLoading ? '…' : String(stats.successful_trades) },
    { label: 'Active Days', value: statsLoading ? '…' : String(stats.trading_days) },
    { label: 'Win Rate', value: statsLoading ? '…' : `${stats.win_rate}%` },
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Profile
        </h1>
        <p className="text-sm" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
          Manage your account and view achievements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}>
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-2xl font-bold"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-root)', fontFamily: 'var(--font-ui)' }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                {user?.username || 'User'}
              </h3>
              <div
                className="px-3 py-1 rounded-full mb-5 text-xs font-medium"
                style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
              >
                Trader
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full h-9 rounded-md text-[13px] font-semibold"
                style={{ fontFamily: 'var(--font-ui)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', backgroundColor: 'transparent', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                Achievements
              </h3>
            </div>
            <div className="space-y-2">
              {[
                { label: 'First Trade', icon: '🎯', earned: stats.total_trades >= 1 },
                { label: 'Profit Master', icon: '💰', earned: stats.successful_trades >= 1 },
                { label: 'Active Trader', icon: '🔥', earned: stats.total_trades >= 5 },
              ].map(({ label, icon, earned }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 rounded-md"
                  style={{ backgroundColor: 'var(--bg-elevated)', opacity: earned ? 1 : 0.4 }}
                >
                  <span className="text-lg">{icon}</span>
                  <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>
                    {label}
                  </span>
                  {!earned && (
                    <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                      Locked
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Personal Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>Username</p>
                  <p className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>
                    {user?.username || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>Account Type</p>
                  <p className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>
                    Virtual Trader
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Statistics */}
          <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                Trading Statistics
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {statCards.map(({ label, value }) => (
                <div key={label} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-dim)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>
                    {label}
                  </p>
                  <p className="text-2xl font-medium tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
              Based on current portfolio holdings
            </p>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Go to Markets', sub: 'Browse and trade 50+ stocks', onClick: () => navigate('/markets') },
                { label: 'View Portfolio', sub: 'Check your holdings and P&L', onClick: () => navigate('/portfolio') },
                { label: 'Settings', sub: 'Change password and preferences', onClick: () => navigate('/settings') },
              ].map(({ label, sub, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="w-full flex items-center justify-between p-3 rounded-md text-left"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                >
                  <div>
                    <p className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-[11px]" style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>{sub}</p>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

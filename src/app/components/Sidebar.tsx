import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Eye,
  Receipt,
  User,
  Settings,
  Trophy,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navSections = [
    {
      label: 'MAIN',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
        { path: '/markets', label: 'Markets', icon: TrendingUp },
      ]
    },
    {
      label: 'TRADING',
      items: [
        { path: '/transactions', label: 'Transactions', icon: Receipt },
      ]
    },
    {
      label: 'ACCOUNT',
      items: [
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/settings', label: 'Settings', icon: Settings },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      ]
    }
  ];

  return (
    <aside 
      className="w-[200px] h-screen flex flex-col"
      style={{ 
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-dim)'
      }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="flex items-center gap-2">
          {/* Geometric diamond logo */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path 
              d="M10 2L15 10L10 18L5 10L10 2Z" 
              fill="var(--accent)" 
              opacity="0.2"
            />
            <path 
              d="M10 2L15 10L10 18L5 10L10 2Z" 
              stroke="var(--accent)" 
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span 
            className="font-bold text-lg tracking-tight"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)'
            }}
          >
            Actually
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6 last:mb-0">
            {/* Section Label */}
            <div 
              className="px-3 mb-1 text-[9px] font-semibold uppercase tracking-wider"
              style={{ 
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em'
              }}
            >
              {section.label}
            </div>
            
            {/* Section Items */}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="relative flex items-center gap-2 h-11 px-3 rounded-lg group"
                      style={{
                        backgroundColor: isActive ? 'var(--accent-dim)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                          style={{ backgroundColor: 'var(--accent)' }}
                        />
                      )}
                      
                      <Icon 
                        className="w-4 h-4 flex-shrink-0" 
                        style={{ 
                          color: isActive ? 'var(--accent)' : 'inherit',
                          strokeWidth: isActive ? 2.5 : 2
                        }}
                      />
                      <span 
                        className="text-[13px] font-medium"
                        style={{ fontFamily: 'var(--font-ui)' }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom User Card */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="flex items-center gap-2 p-2 rounded-lg mb-2">
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-card)',
              fontFamily: 'var(--font-ui)'
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span
                className="text-xs font-semibold truncate"
                style={{
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-primary)'
                }}
              >
                {user?.username || 'User'}
              </span>
              <span 
                className="text-[10px] font-medium tabular-nums"
                style={{ 
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)'
                }}
              >
                Lv.5
              </span>
            </div>
            {/* XP Progress bar */}
            <div 
              className="h-1 rounded-full mt-1 overflow-hidden"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
            >
              <div 
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  width: '68%'
                }}
              />
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full h-9 px-3 rounded-lg text-[13px] font-medium"
          style={{
            fontFamily: 'var(--font-ui)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

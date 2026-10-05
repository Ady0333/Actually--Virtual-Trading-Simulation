import { Outlet, useLocation, Navigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import LandingPage from './LandingPage';

// Inner layout shown when user is logged in
function AppLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-root)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar now reads from AuthContext — no props needed */}
        <TopBar />
        <main className={`flex-1 ${isDashboard ? 'overflow-hidden' : 'overflow-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-root)' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <AppLayout />;
}
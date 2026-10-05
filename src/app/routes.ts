import { createBrowserRouter } from 'react-router';
import Root from './pages/Root';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import Transactions from './pages/Transactions';
import News from './pages/News';
import Markets from './pages/Markets';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    Component: Login,
  },
  // Protected routes (Root checks auth and redirects to /login if not logged in)
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: 'portfolio', Component: Portfolio },
      { path: 'markets', Component: Markets },
      { path: 'news', Component: News },
      { path: 'profile', Component: Profile },
      { path: 'transactions', Component: Transactions },
      { path: 'settings', Component: Settings },
      { path: 'leaderboard', Component: Leaderboard },
    ],
  },
]);
import { createBrowserRouter } from 'react-router';
import type { ComponentType } from 'react';
import Root from './pages/Root';

// Pages are code-split so the initial bundle only carries what's on screen.
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    lazy: page(() => import('./pages/Login')),
  },
  // Protected routes (Root shows the landing page when not logged in)
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, lazy: page(() => import('./pages/Dashboard')) },
      { path: 'portfolio', lazy: page(() => import('./pages/Portfolio')) },
      { path: 'markets', lazy: page(() => import('./pages/Markets')) },
      { path: 'news', lazy: page(() => import('./pages/News')) },
      { path: 'profile', lazy: page(() => import('./pages/Profile')) },
      { path: 'transactions', lazy: page(() => import('./pages/Transactions')) },
      { path: 'settings', lazy: page(() => import('./pages/Settings')) },
      { path: 'leaderboard', lazy: page(() => import('./pages/Leaderboard')) },
    ],
  },
]);

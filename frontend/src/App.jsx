import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Landing from './pages/Landing';

function App() {
  const token = useStore((s) => s.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={token ? <Navigate to="/dashboard" replace /> : <Auth />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/auth" replace />} />
        <Route path="/stock/:ticker" element={token ? <StockDetail /> : <Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

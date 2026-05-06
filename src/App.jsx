// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Login from './pages/Login';
import WorkOrders from './pages/WorkOrders';
import Categories from './pages/Category';
import Locations from './pages/Location';
import Users from './pages/User';

// Komponen Penjaga Rute
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    // Tendang ke halaman login jika tidak punya token
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Login (Bebas akses) */}
        <Route path="/login" element={<Login />} />

        {/* Rute Dasbor (Dilindungi ProtectedRoute) */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="work-orders" element={<WorkOrders />} />

          {/* Master Data */}
          <Route path="categories" element={<Categories />} />
          <Route path="locations" element={<Locations />} />

          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
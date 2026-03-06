import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import POS from './pages/POS';
import { Sales, Customers, Suppliers } from './pages/SalesCustomersSuppliers';
import { Accounts, Expenses, Income } from './pages/Accounts';
import { Purchases, LowStock, Reports, ProfitLoss, StockReport, Categories } from './pages/OtherPages';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/pos" element={<PrivateRoute><POS /></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
      <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
      <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
      <Route path="/suppliers" element={<PrivateRoute><Suppliers /></PrivateRoute>} />
      <Route path="/purchases" element={<PrivateRoute><Purchases /></PrivateRoute>} />
      <Route path="/low-stock" element={<PrivateRoute><LowStock /></PrivateRoute>} />
      <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
      <Route path="/income" element={<PrivateRoute><Income /></PrivateRoute>} />
      <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/reports/profit-loss" element={<PrivateRoute><ProfitLoss /></PrivateRoute>} />
      <Route path="/reports/stock" element={<PrivateRoute><StockReport /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="bottom-right" toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13 },
          success: { style: { borderLeft: '4px solid #28c76f' } },
          error: { style: { borderLeft: '4px solid #ea5455' } },
        }} />
      </AuthProvider>
    </BrowserRouter>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, useOutletContext } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Analytics from './pages/Analytics';

function DashboardPage() {
  const { setSidebarOpen } = useOutletContext();
  return <Dashboard setSidebarOpen={setSidebarOpen} />;
}
function ProductsPage() {
  const { setSidebarOpen } = useOutletContext();
  return <Products setSidebarOpen={setSidebarOpen} />;
}
function ProductDetailPage() {
  const { setSidebarOpen } = useOutletContext();
  return <ProductDetail setSidebarOpen={setSidebarOpen} />;
}
function AnalyticsPage() {
  const { setSidebarOpen } = useOutletContext();
  return <Analytics setSidebarOpen={setSidebarOpen} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedRoute>
          <ProductsProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>
            </Routes>
          </ProductsProvider>
        </ProtectedRoute>
      </AuthProvider>
    </BrowserRouter>
  );
}

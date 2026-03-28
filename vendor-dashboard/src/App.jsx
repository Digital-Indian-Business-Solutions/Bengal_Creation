import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vendors from './pages/Vendors'
import PendingVendors from './pages/PendingVendors'
import VendorDetails from './pages/VendorDetails'
import VendorProducts from './pages/VendorProducts'
import Analytics from './pages/Analytics'
import SearchVendor from './pages/SearchVendor'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <main className="lg:ml-[260px] pt-16 min-h-screen">
        <div className="p-4 lg:p-6 max-w-[1400px]">
          <Routes>
            <Route path="/"                          element={<Dashboard />} />
            <Route path="/vendors"                   element={<Vendors />} />
            <Route path="/vendors/:id"               element={<VendorDetails />} />
            <Route path="/vendors/:vendorId/products" element={<VendorProducts />} />
            <Route path="/pending"                   element={<PendingVendors />} />
            <Route path="/analytics"                 element={<Analytics />} />
            <Route path="/search"                    element={<SearchVendor />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <p className="font-display font-bold text-7xl text-gray-100 dark:text-gray-800 mb-2 select-none">
                  404
                </p>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Page not found</p>
                <a href="/" className="btn-primary mt-5 text-sm">↩ Go to Dashboard</a>
              </div>
            } />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public — redirects to dashboard if already authed */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Protected — redirects to /login if not authed */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            />
          </Routes>

          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                fontWeight: '500',
                borderRadius: '12px',
                padding: '10px 14px',
                boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#ecfdf5' },
                style: {
                  background: '#fff',
                  color: '#1e293b',
                  border: '1px solid #d1fae5',
                },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
                style: {
                  background: '#fff',
                  color: '#1e293b',
                  border: '1px solid #fee2e2',
                },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

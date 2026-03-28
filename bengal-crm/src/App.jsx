import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import OrderModal from './components/OrderModal';
import DashboardPage from './pages/DashboardPage';
import CartLeadsPage from './pages/CartLeadsPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import FollowUpsPage from './pages/FollowUpsPage';
import LoginPage from './pages/LoginPage';
import { useLeads } from './hooks/useLeads';
import { PAGE_TITLES } from './constants';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { auth, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState(null);

  // Show login screen when not authenticated
  if (!auth) return <LoginPage />;

  const {
    loading, error, load,
    search, setSearch,
    filterDistrict, setFilterDistrict,
    filterVendor, setFilterVendor,
    filterAmount, setFilterAmount,
    filterDate, setFilterDate,
    filterType, setFilterType,
    districts, vendors,
    statuses, setStatus,
    filtered, followUps,
    clearFilters, exportCSV,
    stats,
  } = useLeads();

  const filterProps = {
    districts, vendors,
    filterDistrict, setFilterDistrict,
    filterVendor, setFilterVendor,
    filterAmount, setFilterAmount,
    filterDate, setFilterDate,
    filterType, setFilterType,
    onClear: clearFilters,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar page={page} setPage={setPage} stats={stats} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
          padding: '13px 22px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, flexShrink: 0,
        }}>
          <div style={{ fontWeight: 600, fontSize: 17, color: 'var(--text)' }}>
            {PAGE_TITLES[page]}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-base)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '7px 12px', width: 270,
            }}>
              <span style={{ color: 'var(--text3)', fontSize: 13 }}>🔍</span>
              <input
                placeholder="Search name, phone, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text)', fontSize: 13, width: '100%',
                }}
              />
              {search && (
                <span onClick={() => setSearch('')} style={{ color: 'var(--text3)', cursor: 'pointer', fontSize: 13 }}>✕</span>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={load}
              disabled={loading}
              style={{
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                color: 'var(--text2)', borderRadius: 8, padding: '7px 12px',
                cursor: loading ? 'default' : 'pointer', fontSize: 13,
                opacity: loading ? .5 : 1,
              }}
              title="Refresh data"
            >
              {loading ? '⟳' : '↻'} Refresh
            </button>

            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: error ? 'var(--red)' : 'var(--green)', display: 'inline-block' }} />
              {error ? 'Offline' : 'Live'}
            </div>

            {/* User + Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                  {(process.env.REACT_APP_ADMIN_EMAIL || 'admin@bengalcreations.in').split('@')[0]}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Administrator</div>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5bf5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {(process.env.REACT_APP_ADMIN_EMAIL || 'A')[0].toUpperCase()}
              </div>
              <button
                onClick={logout}
                title="Sign out"
                style={{
                  background: 'rgba(242,87,87,0.1)', color: 'var(--red)',
                  border: '1px solid rgba(242,87,87,0.25)', borderRadius: 7,
                  padding: '6px 11px', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'rgba(242,87,87,0.2)')}
                onMouseLeave={(e) => (e.target.style.background = 'rgba(242,87,87,0.1)')}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '20px 22px', overflowY: 'auto' }}>

          {/* Loading state */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 28, animation: 'spin 1s linear infinite' }}>⟳</div>
              <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading from api.bengalcreations.in…</div>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{
              background: 'rgba(242,87,87,0.08)', border: '1px solid rgba(242,87,87,0.25)',
              borderRadius: 10, padding: '16px 20px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--red)', fontSize: 14 }}>API Error</div>
                <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>{error}</div>
              </div>
              <button onClick={load} style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>Retry</button>
            </div>
          )}

          {/* Pages */}
          {!loading && (
            <>
              {page === 'dashboard' && (
                <DashboardPage
                  leads={filtered} statuses={statuses} setStatus={setStatus}
                  onRowClick={setSelectedLead} onExport={exportCSV} stats={stats}
                />
              )}
              {page === 'carts' && (
                <CartLeadsPage
                  leads={filtered} statuses={statuses} setStatus={setStatus}
                  onRowClick={setSelectedLead} onExport={exportCSV}
                  filterProps={filterProps} stats={stats}
                />
              )}
              {page === 'orders' && (
                <OrdersPage
                  leads={filtered} statuses={statuses} setStatus={setStatus}
                  onRowClick={setSelectedLead} onExport={exportCSV} filterProps={filterProps}
                />
              )}
              {page === 'customers' && (
                <CustomersPage leads={filtered} statuses={statuses} setStatus={setStatus} />
              )}
              {page === 'followups' && (
                <FollowUpsPage
                  leads={followUps} statuses={statuses} setStatus={setStatus}
                  onRowClick={setSelectedLead}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Order / Cart detail modal */}
      {selectedLead && <OrderModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}

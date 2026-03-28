import React from 'react';
import { NAV_ITEMS } from '../constants';

export default function Sidebar({ page, setPage, stats }) {
  return (
    <nav style={{
      width: 230, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', position: 'sticky', top: 0,
      height: '100vh', overflowY: 'auto', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34,
          background: 'linear-gradient(135deg,#4f8ef7,#7c5bf5)',
          borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Space Mono', fontWeight: 700, fontSize: 12, color: '#fff',
        }}>BC</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Bengal CRM</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Marketing Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '10px 0', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, padding: '0 16px 6px', marginTop: 6 }}>
          Navigation
        </div>
        {NAV_ITEMS.map((n) => {
          const active = page === n.id;
          // badge count
          const badge = n.id === 'followups' ? stats?.pendingCalls : n.id === 'carts' ? stats?.cartCount : null;
          return (
            <div
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 16px', cursor: 'pointer',
                color: active ? 'var(--accent)' : 'var(--text2)',
                fontSize: 13.5, fontWeight: 500,
                background: active ? 'rgba(79,142,247,0.08)' : 'transparent',
                borderLeft: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
                transition: 'all .14s',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text)'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
              </span>
              {badge > 0 && (
                <span style={{
                  background: n.id === 'followups' ? 'var(--red)' : 'var(--accent)',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  borderRadius: 99, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                }}>{badge}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Powered by</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>api.bengalcreations.in</div>
      </div>
    </nav>
  );
}

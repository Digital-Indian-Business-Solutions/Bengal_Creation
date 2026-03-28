import React, { useMemo } from 'react';
import StatusSelect from '../components/StatusSelect';
import { AVATAR_GRADIENTS } from '../constants';
import { exportCustomerPDF } from '../services/pdfExport';

function initials(name) {
  return (name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function CustomersPage({ leads, statuses, setStatus }) {
  const unique = useMemo(() => {
    const seen = new Set();
    return leads.filter((l) => {
      const key = l.customer.phone || l.customer.email || l._id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [leads]);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'var(--text2)', fontSize: 13 }}>{unique.length} unique customers</div>
        <button
          onClick={() => exportCustomerPDF(unique, statuses)}
          style={{ background: 'rgba(242,87,87,0.1)', color: 'var(--red)', border: '1px solid rgba(242,87,87,0.25)', borderRadius: 7, padding: '6px 14px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}
        >📄 Export PDF</button>
      </div>
      {unique.map((l, i) => (
        <div key={l._id} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {/* Avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 14, color: '#fff', flexShrink: 0,
          }}>
            {initials(l.customer.name)}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{l.customer.name || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{l.customer.email || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'Space Mono,monospace', marginTop: 2 }}>{l.customer.phone || '—'}</div>
          </div>

          {/* Amount + district */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--green)', fontFamily: 'Space Mono,monospace', fontWeight: 700 }}>
              ₹{l.totalAmount.toLocaleString()}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5,
              background: l.type === 'cart' ? 'rgba(167,139,250,0.15)' : 'rgba(79,142,247,0.15)',
              color: l.type === 'cart' ? 'var(--purple)' : 'var(--accent)',
            }}>
              {l.type === 'cart' ? '🛒' : '📦'} {l.district || 'Unknown'}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            {l.customer.phone && (
              <a href={`tel:${l.customer.phone}`} style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'rgba(34,201,122,0.12)', color: 'var(--green)',
                  border: '1px solid rgba(34,201,122,0.25)', borderRadius: 6,
                  padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>📞 Call</button>
              </a>
            )}
            <StatusSelect value={statuses[l._id] || 'not_called'} onChange={(v) => setStatus(l._id, v)} style={{ width: 140 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';
import StatCard from '../components/StatCard';
import StatusSelect from '../components/StatusSelect';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { exportCustomerPDF } from '../services/pdfExport';

function initials(name) {
  return (name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function FollowUpsPage({ leads, statuses, setStatus, onRowClick }) {
  const followUpList = leads.filter((l) => statuses[l._id] === 'follow_up');
  const notCalledList = leads.filter((l) => statuses[l._id] === 'not_called');

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard icon="🔁" label="Follow Up Later" value={followUpList.length}  sub="Scheduled callbacks"  color="amber" />
        <StatCard icon="📵" label="Not Called"       value={notCalledList.length} sub="Yet to contact"       color="red"   />
        <StatCard icon="📋" label="Total Pending"    value={leads.length}         sub="Needs attention"      color="blue"  />
      </div>

      {leads.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <button
            onClick={() => exportCustomerPDF(leads, statuses)}
            style={{ background: 'rgba(242,87,87,0.1)', color: 'var(--red)', border: '1px solid rgba(242,87,87,0.25)', borderRadius: 7, padding: '6px 14px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}
          >📄 Export PDF</button>
        </div>
      )}

      {leads.length === 0 ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text3)', fontSize: 15 }}>
          🎉 All customers have been contacted!
        </div>
      ) : (
        leads.map((l) => {
          const status = statuses[l._id] || 'not_called';
          const sc = STATUS_COLORS[status];
          return (
            <div key={l._id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
              padding: '13px 16px', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}>
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 14, color: '#fff', flexShrink: 0,
              }}>
                {initials(l.customer.name)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{l.customer.name || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--accent)', fontFamily: 'Space Mono,monospace' }}>{l.customer.phone || '—'}</span>
                  <span>·</span>
                  <span style={{ color: 'var(--green)', fontFamily: 'Space Mono,monospace' }}>₹{l.totalAmount.toLocaleString()}</span>
                  <span>·</span>
                  <span>{l.district || 'Unknown'}</span>
                  <span>·</span>
                  <span
                    onClick={() => onRowClick(l)}
                    style={{ color: 'var(--purple)', cursor: 'pointer', fontFamily: 'Space Mono,monospace', fontSize: 11 }}
                  >
                    {l._id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5, flexShrink: 0,
                background: `${sc.border}33`, color: sc.color, border: `1px solid ${sc.border}`,
              }}>
                {STATUS_LABELS[status]}
              </span>

              {/* Type badge */}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, flexShrink: 0,
                background: l.type === 'cart' ? 'rgba(167,139,250,0.15)' : 'rgba(79,142,247,0.15)',
                color: l.type === 'cart' ? 'var(--purple)' : 'var(--accent)',
              }}>
                {l.type === 'cart' ? '🛒' : '📦'}
              </span>

              {/* Call button */}
              {l.customer.phone && (
                <a href={`tel:${l.customer.phone}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <button style={{
                    background: 'rgba(34,201,122,0.12)', color: 'var(--green)',
                    border: '1px solid rgba(34,201,122,0.25)', borderRadius: 6,
                    padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>📞 Call</button>
                </a>
              )}

              {/* Status select */}
              <StatusSelect value={status} onChange={(v) => setStatus(l._id, v)} style={{ width: 145, flexShrink: 0 }} />
            </div>
          );
        })
      )}
    </div>
  );
}

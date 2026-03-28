import React, { useState } from 'react';

export default function OrderModal({ lead, onClose }) {
  if (!lead) return null;
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
      }}
    >
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border2)',
        borderRadius: 16, width: 580, maxWidth: '96vw', maxHeight: '88vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
            {lead.type === 'cart' ? '🛒 Cart' : '📦 Order'} Details
            <span style={{ color: 'var(--text3)', fontSize: 12, marginLeft: 10, fontFamily: 'Space Mono' }}>
              {lead._id.slice(-8).toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '18px 22px' }}>
          {/* Customer info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {[
              { k: 'Customer',    v: lead.customer.name },
              { k: 'Phone',       v: lead.customer.phone || '—', mono: true, color: 'var(--accent)' },
              { k: 'Email',       v: lead.customer.email || '—', small: true },
              { k: 'Date',        v: lead.createdAt?.slice(0, 10) },
              { k: 'District',    v: lead.district || '—' },
              { k: 'Total',       v: `₹${lead.totalAmount.toLocaleString()}`, mono: true, color: 'var(--green)', bold: true },
            ].map(({ k, v, mono, color, bold, small }) => (
              <div key={k} style={{ background: 'var(--bg-base)', borderRadius: 8, padding: '9px 13px' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: small ? 12 : 13, color: color || 'var(--text)', fontWeight: bold ? 700 : 500, fontFamily: mono ? 'Space Mono,monospace' : 'inherit' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Products */}
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 10 }}>
            Products ({lead.items.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lead.items.map((item, i) => (
              <ProductRow key={i} item={item} />
            ))}
          </div>

          {/* Actions */}
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            {lead.customer.phone && (
              <a href={`tel:${lead.customer.phone}`} style={{ textDecoration: 'none' }}>
                <button style={{ background: 'rgba(34,201,122,0.12)', color: 'var(--green)', border: '1px solid rgba(34,201,122,0.3)', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  📞 Call Customer
                </button>
              </a>
            )}
            <button onClick={onClose} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13 }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductRow({ item }) {
  const [imgErr, setImgErr] = useState(false);
  const img = item.images?.[0];
  return (
    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 10, padding: 13, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {/* Real product image from Cloudinary */}
      {img && !imgErr ? (
        <img
          src={img}
          alt={item.productName}
          onError={() => setImgErr(true)}
          style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: 'var(--bg-card2)' }}
        />
      ) : (
        <div style={{ width: 60, height: 60, borderRadius: 8, background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🧣</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{item.productName}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <span>🏪 {item.vendorName}</span>
          {item.district && <span>📍 {item.district}</span>}
          <span>Qty: {item.quantity}</span>
        </div>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700, color: 'var(--green)', marginTop: 5 }}>
          ₹{item.price.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400, fontFamily: 'inherit' }}>/ unit</span>
        </div>
      </div>
      <div style={{ fontFamily: 'Space Mono,monospace', fontWeight: 700, color: 'var(--green)', fontSize: 13, flexShrink: 0 }}>
        ₹{(item.price * item.quantity).toLocaleString()}
      </div>
    </div>
  );
}

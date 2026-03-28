import React from 'react';
const COLORS = { green: 'var(--green)', blue: 'var(--accent)', amber: 'var(--amber)', red: 'var(--red)', purple: 'var(--purple)' };

export default function StatCard({ label, value, sub, color = 'blue', icon }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px' }}>{label}</div>
        {icon && <span style={{ fontSize: 18, opacity: .6 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: COLORS[color] || COLORS.blue, marginBottom: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text2)' }}>{sub}</div>}
    </div>
  );
}

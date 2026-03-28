import React from 'react';

const sel = {
  background: 'var(--bg-base)', border: '1px solid var(--border)',
  color: 'var(--text)', borderRadius: 7, padding: '7px 10px',
  fontSize: 12.5, outline: 'none', cursor: 'pointer',
};

export default function FilterBar({
  districts, vendors,
  filterDistrict, setFilterDistrict,
  filterVendor, setFilterVendor,
  filterAmount, setFilterAmount,
  filterDate, setFilterDate,
  filterType, setFilterType,
  onClear,
}) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 16px', marginBottom: 16,
      display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.7px' }}>Filters</span>

      <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={sel}>
        <option value="All">All Types</option>
        <option value="cart">🛒 Cart</option>
        <option value="order">📦 Order</option>
      </select>

      <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} style={sel}>
        {districts.map((d) => <option key={d}>{d}</option>)}
      </select>

      <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} style={sel}>
        {vendors.map((v) => <option key={v}>{v}</option>)}
      </select>

      <input
        type="number"
        placeholder="Min ₹ amount"
        value={filterAmount}
        onChange={(e) => setFilterAmount(e.target.value)}
        style={{ ...sel, width: 130 }}
      />

      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        style={sel}
      />

      <button
        onClick={onClear}
        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}
      >
        ✕ Clear
      </button>
    </div>
  );
}

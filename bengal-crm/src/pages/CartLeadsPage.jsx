import React from 'react';
import FilterBar from '../components/FilterBar';
import LeadsTable from '../components/LeadsTable';
import StatCard from '../components/StatCard';

export default function CartLeadsPage({ leads, statuses, setStatus, onRowClick, onExport, filterProps, stats }) {
  const cartLeads = leads.filter((l) => l.type === 'cart');
  const cartValue = cartLeads.reduce((a, b) => a + b.totalAmount, 0);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard icon="🛒" label="Cart Leads"    value={cartLeads.length}                          sub="Active carts"         color="purple" />
        <StatCard icon="💸" label="Cart Value"    value={`₹${(cartValue/1000).toFixed(1)}K`}        sub="Potential revenue"    color="amber" />
        <StatCard icon="⏳" label="Pending Calls" value={stats.pendingCalls}                        sub="Need follow-up"       color="red" />
      </div>
      <FilterBar {...filterProps} />
      <LeadsTable leads={cartLeads} statuses={statuses} setStatus={setStatus} onRowClick={onRowClick} onExport={onExport} title="Cart Leads" />
    </>
  );
}

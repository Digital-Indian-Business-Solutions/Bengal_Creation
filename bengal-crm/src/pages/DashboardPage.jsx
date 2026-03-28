import React from 'react';
import StatCard from '../components/StatCard';
import LeadsTable from '../components/LeadsTable';

export default function DashboardPage({ leads, statuses, setStatus, onRowClick, onExport, stats }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard icon="💰" label="Total Revenue"   value={`₹${(stats.totalRevenue/1000).toFixed(1)}K`}  sub="All orders"            color="green" />
        <StatCard icon="📅" label="Total Leads"     value={stats.totalLeads}                              sub={`${stats.cartCount} carts · ${stats.orderCount} orders`} color="blue" />
        <StatCard icon="📞" label="Calls Done"       value={stats.callsDone}                               sub={`${stats.interested} interested`} color="amber" />
        <StatCard icon="⏳" label="Pending Calls"   value={stats.pendingCalls}                            sub="Not yet contacted"    color="red" />
      </div>
      <LeadsTable leads={leads} statuses={statuses} setStatus={setStatus} onRowClick={onRowClick} onExport={onExport} title="All Leads" />
    </>
  );
}

import React from 'react';
import FilterBar from '../components/FilterBar';
import LeadsTable from '../components/LeadsTable';

export default function OrdersPage({ leads, statuses, setStatus, onRowClick, onExport, filterProps }) {
  const orderLeads = leads.filter((l) => l.type === 'order');
  return (
    <>
      <FilterBar {...filterProps} />
      <LeadsTable leads={orderLeads} statuses={statuses} setStatus={setStatus} onRowClick={onRowClick} onExport={onExport} title="Orders" />
    </>
  );
}

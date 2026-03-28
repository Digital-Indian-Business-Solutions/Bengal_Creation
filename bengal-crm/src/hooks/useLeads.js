import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchCarts, fetchOrders, normaliseCart, normaliseOrder } from '../services/api';

export function useLeads() {
  const [allLeads, setAllLeads]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [statuses, setStatuses]   = useState({});

  // Filters
  const [search, setSearch]             = useState('');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterVendor, setFilterVendor]     = useState('All');
  const [filterAmount, setFilterAmount]     = useState('');
  const [filterDate, setFilterDate]         = useState('');
  const [filterType, setFilterType]         = useState('All'); // All | cart | order

  // Load data from real API
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [carts, orders] = await Promise.all([fetchCarts(), fetchOrders()]);
      const normalised = [
        ...carts.map(normaliseCart),
        ...orders.map(normaliseOrder),
      ];
      setAllLeads(normalised);
      // Initialise statuses for any new ids
      setStatuses((prev) => {
        const next = { ...prev };
        normalised.forEach((l) => { if (!next[l._id]) next[l._id] = 'not_called'; });
        return next;
      });
    } catch (e) {
      setError('Failed to load data from api.bengalcreations.in');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = (id, val) => setStatuses((s) => ({ ...s, [id]: val }));

  // Derive unique filter options from data
  const districts = useMemo(() => {
    const s = new Set(allLeads.map((l) => l.district).filter(Boolean));
    return ['All', ...Array.from(s).sort()];
  }, [allLeads]);

  const vendors = useMemo(() => {
    const s = new Set(allLeads.flatMap((l) => l.items.map((i) => i.vendorName)).filter(Boolean));
    return ['All', ...Array.from(s).sort()];
  }, [allLeads]);

  // Filtered leads
  const filtered = useMemo(() => {
    return allLeads.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        l.customer.name.toLowerCase().includes(q) ||
        l.customer.phone.includes(q) ||
        l.customer.email.toLowerCase().includes(q);
      const matchDist   = filterDistrict === 'All' || l.district === filterDistrict;
      const matchVendor = filterVendor   === 'All' || l.items.some((i) => i.vendorName === filterVendor);
      const matchAmt    = !filterAmount  || l.totalAmount >= Number(filterAmount);
      const matchDate   = !filterDate    || l.createdAt?.slice(0, 10) === filterDate;
      const matchType   = filterType     === 'All' || l.type === filterType;
      return matchSearch && matchDist && matchVendor && matchAmt && matchDate && matchType;
    });
  }, [allLeads, search, filterDistrict, filterVendor, filterAmount, filterDate, filterType]);

  const clearFilters = () => {
    setFilterDistrict('All');
    setFilterVendor('All');
    setFilterAmount('');
    setFilterDate('');
    setFilterType('All');
  };

  // Stats
  const stats = useMemo(() => {
    const orders     = allLeads.filter((l) => l.type === 'order');
    const today      = new Date().toISOString().slice(0, 10);
    const todayLeads = orders.filter((l) => l.createdAt?.slice(0, 10) === today);
    const vals       = Object.values(statuses);
    return {
      totalRevenue:  orders.reduce((a, b) => a + b.totalAmount, 0),
      todayRevenue:  todayLeads.reduce((a, b) => a + b.totalAmount, 0),
      callsDone:     vals.filter((v) => v !== 'not_called').length,
      pendingCalls:  vals.filter((v) => v === 'not_called').length,
      interested:    vals.filter((v) => v === 'interested').length,
      totalLeads:    allLeads.length,
      cartCount:     allLeads.filter((l) => l.type === 'cart').length,
      orderCount:    allLeads.filter((l) => l.type === 'order').length,
    };
  }, [allLeads, statuses]);

  const followUps = useMemo(
    () => allLeads.filter((l) => ['follow_up', 'not_called'].includes(statuses[l._id])),
    [allLeads, statuses]
  );

  const exportCSV = (data) => {
    const header = ['ID', 'Type', 'Customer', 'Phone', 'Email', 'Amount', 'District', 'Date', 'Status'];
    const rows = data.map((l) => [
      l._id, l.type, l.customer.name, l.customer.phone, l.customer.email,
      l.totalAmount, l.district, l.createdAt?.slice(0, 10), statuses[l._id],
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'bengal_crm_export.csv';
    a.click();
  };

  return {
    loading, error, load,
    search, setSearch,
    filterDistrict, setFilterDistrict,
    filterVendor, setFilterVendor,
    filterAmount, setFilterAmount,
    filterDate, setFilterDate,
    filterType, setFilterType,
    districts, vendors,
    statuses, setStatus,
    filtered, allLeads, followUps,
    clearFilters, exportCSV,
    stats,
  };
}

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useProducts } from '../context/ProductsContext';
import TopBar from '../components/TopBar';
import { SkeletonCard } from '../components/Skeleton';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const PALETTE = ['#ff7f07','#1ab87a','#f93a50','#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#10b981','#ec4899','#6366f1'];

const chartOpts = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#241e13',
      titleFont: { family: 'DM Sans', size: 12 },
      bodyFont: { family: 'DM Sans', size: 12 },
      padding: 10,
      cornerRadius: 8,
    },
    title: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9a8360', maxRotation: 30 },
      border: { display: false },
    },
    y: {
      grid: { color: '#e8e3d8' },
      ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9a8360' },
      border: { display: false },
    },
  },
});

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { font: { family: 'DM Sans', size: 11 }, color: '#574830', padding: 12, boxWidth: 12 },
    },
    tooltip: {
      backgroundColor: '#241e13',
      titleFont: { family: 'DM Sans', size: 12 },
      bodyFont: { family: 'DM Sans', size: 12 },
      padding: 10,
      cornerRadius: 8,
    },
  },
};

function groupCount(arr, fn) {
  const map = {};
  arr.forEach(item => { const k = fn(item); map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function groupSum(arr, keyFn, valFn) {
  const map = {};
  arr.forEach(item => { const k = keyFn(item); map[k] = (map[k] || 0) + valFn(item); });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export default function Analytics({ setSidebarOpen }) {
  const { products, loading } = useProducts();

  const stats = useMemo(() => {
    if (!products.length) return null;
    const total = products.length;
    const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const avgPrice = Math.round(products.reduce((s, p) => s + (p.price || 0), 0) / total);
    const maxPrice = Math.max(...products.map(p => p.price || 0));
    const minPrice = Math.min(...products.filter(p => p.price > 0).map(p => p.price || 0));

    // By district
    const byDistrict = groupCount(products, p => p.district || 'Unknown').slice(0, 8);
    // By vendor
    const byVendor = groupCount(products, p => p.vendor?.shopName || 'Unknown').slice(0, 8);
    // By category
    const byCategory = groupCount(products, p => p.category?.name || 'Uncategorized');
    // Stock by district
    const stockByDistrict = groupSum(products, p => p.district || 'Unknown', p => p.stock || 0).slice(0, 8);
    // Price buckets
    const priceBuckets = { '₹0–500': 0, '₹500–1k': 0, '₹1k–2k': 0, '₹2k–5k': 0, '₹5k+': 0 };
    products.forEach(p => {
      if (p.price <= 500) priceBuckets['₹0–500']++;
      else if (p.price <= 1000) priceBuckets['₹500–1k']++;
      else if (p.price <= 2000) priceBuckets['₹1k–2k']++;
      else if (p.price <= 5000) priceBuckets['₹2k–5k']++;
      else priceBuckets['₹5k+']++;
    });
    // Monthly additions
    const monthly = {};
    products.forEach(p => {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + 1;
    });
    const sortedMonths = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);

    return { total, totalStock, outOfStock, lowStock, avgPrice, maxPrice, minPrice, byDistrict, byVendor, byCategory, stockByDistrict, priceBuckets, sortedMonths };
  }, [products]);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Analytics" setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {loading || !stats ? (
            [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <KpiCard label="Total Products" value={stats.total} color="text-ink-900" bg="bg-ink-100" />
              <KpiCard label="Total Stock" value={stats.totalStock.toLocaleString()} color="text-jade-700" bg="bg-jade-50" />
              <KpiCard label="Low Stock" value={stats.lowStock} color="text-saffron-700" bg="bg-saffron-50" />
              <KpiCard label="Out of Stock" value={stats.outOfStock} color="text-crimson-700" bg="bg-crimson-50" />
              <KpiCard label="Avg Price" value={`₹${stats.avgPrice.toLocaleString()}`} color="text-ink-700" bg="bg-ink-50" />
              <KpiCard label="Max Price" value={`₹${stats.maxPrice.toLocaleString()}`} color="text-saffron-700" bg="bg-saffron-50" />
            </>
          )}
        </div>

        {!loading && stats && (
          <>
            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <ChartCard title="Products by District">
                <div style={{ height: 240 }}>
                  <Bar
                    data={{
                      labels: stats.byDistrict.map(([k]) => k),
                      datasets: [{
                        data: stats.byDistrict.map(([, v]) => v),
                        backgroundColor: PALETTE,
                        borderRadius: 6,
                        borderSkipped: false,
                      }],
                    }}
                    options={chartOpts()}
                  />
                </div>
              </ChartCard>

              <ChartCard title="Products by Category">
                <div style={{ height: 240 }}>
                  <Doughnut
                    data={{
                      labels: stats.byCategory.map(([k]) => k),
                      datasets: [{
                        data: stats.byCategory.map(([, v]) => v),
                        backgroundColor: PALETTE,
                        borderWidth: 2,
                        borderColor: '#ffffff',
                      }],
                    }}
                    options={doughnutOpts}
                  />
                </div>
              </ChartCard>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <ChartCard title="Top Vendors by Product Count">
                <div style={{ height: 240 }}>
                  <Bar
                    data={{
                      labels: stats.byVendor.map(([k]) => k),
                      datasets: [{
                        data: stats.byVendor.map(([, v]) => v),
                        backgroundColor: PALETTE.map(c => c + 'cc'),
                        borderColor: PALETTE,
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                      }],
                    }}
                    options={{ ...chartOpts(), indexAxis: 'y', scales: { x: { grid: { color: '#e8e3d8' }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9a8360' }, border: { display: false } }, y: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9a8360' }, border: { display: false } } } }}
                  />
                </div>
              </ChartCard>

              <ChartCard title="Price Distribution">
                <div style={{ height: 240 }}>
                  <Bar
                    data={{
                      labels: Object.keys(stats.priceBuckets),
                      datasets: [{
                        label: 'Products',
                        data: Object.values(stats.priceBuckets),
                        backgroundColor: '#ff7f0733',
                        borderColor: '#ff7f07',
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                      }],
                    }}
                    options={chartOpts()}
                  />
                </div>
              </ChartCard>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <ChartCard title="Stock Distribution by District">
                <div style={{ height: 240 }}>
                  <Bar
                    data={{
                      labels: stats.stockByDistrict.map(([k]) => k),
                      datasets: [{
                        data: stats.stockByDistrict.map(([, v]) => v),
                        backgroundColor: '#1ab87a33',
                        borderColor: '#1ab87a',
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                      }],
                    }}
                    options={chartOpts()}
                  />
                </div>
              </ChartCard>

              <ChartCard title="Products Added Over Time">
                <div style={{ height: 240 }}>
                  <Line
                    data={{
                      labels: stats.sortedMonths.map(([k]) => {
                        const [y, m] = k.split('-');
                        return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                      }),
                      datasets: [{
                        label: 'Products',
                        data: stats.sortedMonths.map(([, v]) => v),
                        borderColor: '#ff7f07',
                        backgroundColor: '#ff7f0715',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ff7f07',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      }],
                    }}
                    options={chartOpts()}
                  />
                </div>
              </ChartCard>
            </div>

            {/* Insight tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InsightTable title="District Performance" rows={stats.byDistrict} col1="District" col2="Products" />
              <InsightTable title="Vendor Performance" rows={stats.byVendor} col1="Vendor" col2="Products" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, color, bg }) {
  return (
    <div className={`card p-4 ${bg}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1">{label}</div>
      <div className={`font-display font-bold text-2xl ${color}`}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-ink-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InsightTable({ title, rows, col1, col2 }) {
  const total = rows.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-ink-50">
        <h3 className="font-display font-semibold text-ink-800">{title}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ink-50/60 border-b border-ink-100">
            <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">{col1}</th>
            <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">{col2}</th>
            <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map(([name, count], i) => (
            <tr key={name} className="border-b border-ink-50 hover:bg-ink-50/60 transition-colors">
              <td className="px-5 py-2.5 text-ink-700 font-medium truncate max-w-[140px]">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: PALETTE[i % PALETTE.length] + '33', color: PALETTE[i % PALETTE.length] }}>{i + 1}</span>
                  {name}
                </div>
              </td>
              <td className="px-5 py-2.5 text-right font-mono font-semibold text-ink-800">{count}</td>
              <td className="px-5 py-2.5 text-right text-ink-400 text-xs">{Math.round(count / total * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React from 'react';
import { useProducts } from '../context/ProductsContext';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard } from '../components/Skeleton';
import AlertBanner from '../components/AlertBanner';
import TopBar from '../components/TopBar';

function StatCard({ label, value, sub, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`stat-card ${onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <div className="font-display font-bold text-3xl text-ink-900">{value}</div>
      {sub && <div className="text-xs text-ink-400">{sub}</div>}
    </div>
  );
}

function RecentRow({ product }) {
  const navigate = useNavigate();
  const isOut = product.stock === 0;
  const isLow = product.stock > 0 && product.stock <= 5;
  return (
    <tr
      className={`border-b border-ink-50 hover:bg-ink-50 cursor-pointer transition-colors
        ${isOut ? 'bg-crimson-50' : isLow ? 'bg-saffron-50/50' : ''}`}
      onClick={() => navigate(`/products/${product._id}`)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.images?.[0]
            ? <img src={product.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover border border-ink-100 flex-shrink-0" />
            : <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center text-ink-300 flex-shrink-0 text-xs">?</div>
          }
          <span className="font-medium text-sm text-ink-800 line-clamp-1">{product.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-ink-500">{product.category?.name || '—'}</td>
      <td className="px-4 py-3 text-sm font-mono font-medium text-ink-800">₹{product.price?.toLocaleString()}</td>
      <td className="px-4 py-3 text-sm">
        {isOut
          ? <span className="badge bg-crimson-100 text-crimson-700">❌ Out of Stock</span>
          : isLow
            ? <span className="badge bg-saffron-100 text-saffron-700">⚠ {product.stock}</span>
            : <span className="badge bg-jade-100 text-jade-700">{product.stock}</span>
        }
      </td>
    </tr>
  );
}

export default function Dashboard({ setSidebarOpen }) {
  const { products, loading } = useProducts();
  const navigate = useNavigate();

  const total = products.length;
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const avgPrice = total ? Math.round(products.reduce((s, p) => s + (p.price || 0), 0) / total) : 0;

  const recent = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <AlertBanner />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {loading ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />) : <>
            <StatCard label="Total Products" value={total} sub="All time" icon={<BoxIcon />} color="bg-saffron-100 text-saffron-600" onClick={() => navigate('/products')} />
            <StatCard label="Total Stock" value={totalStock.toLocaleString()} sub="Units available" icon={<StackIcon />} color="bg-jade-100 text-jade-600" />
            <StatCard label="Low Stock" value={lowStock} sub="≤5 units left" icon={<WarnIcon />} color="bg-saffron-100 text-saffron-600" onClick={() => navigate('/products?filter=low')} />
            <StatCard label="Out of Stock" value={outOfStock} sub="Needs restocking" icon={<AlertIcon />} color="bg-crimson-100 text-crimson-600" onClick={() => navigate('/products?filter=out')} />
            <StatCard label="Avg. Price" value={`₹${avgPrice.toLocaleString()}`} sub="Across all products" icon={<PriceIcon />} color="bg-ink-100 text-ink-500" />
          </>}
        </div>

        {/* Recent Products */}
        <div className="card">
          <div className="px-5 py-4 border-b border-ink-50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink-800">Recently Added</h2>
            <button onClick={() => navigate('/products')} className="text-xs text-saffron-600 font-semibold hover:underline">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Product</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Category</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Price</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Stock</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-ink-50">
                      {[...Array(4)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 rounded shimmer w-24" /></td>
                      ))}
                    </tr>
                  ))
                  : recent.map(p => <RecentRow key={p._id} product={p} />)
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* District / Vendor quick stats */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <QuickList
              title="Products by District"
              items={groupBy(products, p => p.district || 'Unknown')}
              onClick={d => navigate(`/products?district=${encodeURIComponent(d)}`)}
            />
            <QuickList
              title="Products by Vendor"
              items={groupBy(products, p => p.vendor?.shopName || 'Unknown')}
              onClick={v => navigate(`/products?vendor=${encodeURIComponent(v)}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function groupBy(arr, fn) {
  const map = {};
  arr.forEach(item => {
    const key = fn(item);
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
}

function QuickList({ title, items, onClick }) {
  const max = items[0]?.[1] || 1;
  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-ink-800 mb-4">{title}</h3>
      <div className="flex flex-col gap-2.5">
        {items.map(([name, count]) => (
          <div key={name} className="flex items-center gap-3 cursor-pointer group" onClick={() => onClick(name)}>
            <div className="text-sm text-ink-600 w-28 truncate group-hover:text-saffron-600 transition-colors">{name}</div>
            <div className="flex-1 bg-ink-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-saffron-400 h-full rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <div className="text-xs font-mono font-semibold text-ink-500 w-6 text-right">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoxIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" /></svg>;
}
function StackIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
}
function WarnIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
}
function AlertIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
}
function PriceIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

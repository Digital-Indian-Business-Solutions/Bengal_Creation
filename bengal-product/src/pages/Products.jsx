import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { SkeletonRow } from '../components/Skeleton';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import BulkStockModal from '../components/BulkStockModal';
import TopBar from '../components/TopBar';
import AlertBanner from '../components/AlertBanner';
import { exportToCSV } from '../utils/exportCSV';

const PAGE_SIZE = 10;

export default function Products({ setSidebarOpen }) {
  const { products, loading, error, fetchProducts, updateStock, categories, vendors, districts } = useProducts();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCat, setFilterCat] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterDistrict, setFilterDistrict] = useState(searchParams.get('district') || '');
  const [filterStock, setFilterStock] = useState(searchParams.get('filter') || '');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [showBulk, setShowBulk] = useState(false);

  useEffect(() => {
    const v = searchParams.get('vendor');
    const d = searchParams.get('district');
    const f = searchParams.get('filter');
    if (v) setFilterVendor(v);
    if (d) setFilterDistrict(d);
    if (f) setFilterStock(f);
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.vendor?.shopName?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q)
      );
    }
    if (filterCat) list = list.filter(p => p.category?.name === filterCat);
    if (filterVendor) list = list.filter(p => p.vendor?.shopName === filterVendor);
    if (filterDistrict) list = list.filter(p => p.district === filterDistrict);
    if (filterStock === 'low') list = list.filter(p => p.stock > 0 && p.stock <= 5);
    if (filterStock === 'out') list = list.filter(p => p.stock === 0);

    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'stock_asc') list.sort((a, b) => a.stock - b.stock);
    else if (sortBy === 'stock_desc') list.sort((a, b) => b.stock - a.stock);
    return list;
  }, [products, search, filterCat, filterVendor, filterDistrict, filterStock, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearch(''); setFilterCat(''); setFilterVendor('');
    setFilterDistrict(''); setFilterStock(''); setSortBy('newest'); setPage(1);
    setSearchParams({});
  };

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === paginated.length ? [] : paginated.map(p => p._id));

  const handleStockChange = async (p, delta) => {
    const newStock = Math.max(0, p.stock + delta);
    await updateStock(p._id, newStock);
  };

  const hasActiveFilters = search || filterCat || filterVendor || filterDistrict || filterStock;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Products" search={search} setSearch={v => { setSearch(v); setPage(1); }} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <AlertBanner />

        {/* Toolbar */}
        <div className="card mb-4">
          <div className="p-4 flex flex-wrap items-center gap-3">
            {/* Mobile search */}
            <div className="relative flex-1 min-w-[180px] sm:hidden">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search…" className="input pl-9" />
            </div>

            {/* Filters */}
            <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} className="input w-auto text-sm">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterVendor} onChange={e => { setFilterVendor(e.target.value); setPage(1); }} className="input w-auto text-sm">
              <option value="">All Vendors</option>
              {vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filterDistrict} onChange={e => { setFilterDistrict(e.target.value); setPage(1); }} className="input w-auto text-sm">
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterStock} onChange={e => { setFilterStock(e.target.value); setPage(1); }} className="input w-auto text-sm">
              <option value="">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} className="input w-auto text-sm">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low→High</option>
              <option value="price_desc">Price: High→Low</option>
              <option value="stock_asc">Stock: Low→High</option>
              <option value="stock_desc">Stock: High→Low</option>
            </select>

            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-xs text-crimson-600 font-semibold hover:underline flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Reset
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {selected.length > 0 && (
                <button onClick={() => setShowBulk(true)} className="btn-secondary flex items-center gap-1.5 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 10h16M4 13h8" /></svg>
                  Bulk Stock ({selected.length})
                </button>
              )}
              <button onClick={() => exportToCSV(filtered)} className="btn-secondary flex items-center gap-1.5 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export CSV
              </button>
              <button onClick={fetchProducts} className="btn-secondary p-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>

          <div className="px-4 py-2 border-t border-ink-50 text-xs text-ink-400 font-medium">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card p-6 text-center text-crimson-600 mb-4">
            <p className="font-semibold">{error}</p>
            <button onClick={fetchProducts} className="btn-primary mt-3">Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleAll} />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400 hidden md:table-cell">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400 hidden lg:table-cell">District</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400 hidden xl:table-cell">Orig. Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400 hidden lg:table-cell">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
                  : paginated.length === 0
                    ? (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-ink-400">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <span className="font-medium">No products found</span>
                        </div>
                      </td></tr>
                    )
                    : paginated.map(p => (
                      <ProductRow
                        key={p._id}
                        product={p}
                        selected={selected.includes(p._id)}
                        onToggle={() => toggleSelect(p._id)}
                        onEdit={() => setEditProduct(p)}
                        onDelete={() => setDeleteProduct(p)}
                        onIncrease={() => handleStockChange(p, 1)}
                        onDecrease={() => handleStockChange(p, -1)}
                        onView={() => navigate(`/products/${p._id}`)}
                      />
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-ink-100 flex items-center justify-between">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                      ${page === i + 1 ? 'bg-saffron-500 text-white' : 'hover:bg-ink-100 text-ink-500'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>

      {editProduct && <EditModal product={editProduct} onClose={() => setEditProduct(null)} />}
      {deleteProduct && <DeleteModal product={deleteProduct} onClose={() => setDeleteProduct(null)} />}
      {showBulk && <BulkStockModal selectedIds={selected} onClose={() => { setShowBulk(false); setSelected([]); }} />}
    </div>
  );
}

function ProductRow({ product: p, selected, onToggle, onEdit, onDelete, onIncrease, onDecrease, onView }) {
  const isOut = p.stock === 0;
  const isLow = p.stock > 0 && p.stock <= 5;

  return (
    <tr className={`border-b border-ink-50 transition-colors hover:bg-ink-50/60
      ${isOut ? 'table-row-out' : isLow ? 'table-row-low' : ''}`}>
      <td className="px-4 py-3">
        <input type="checkbox" checked={selected} onChange={onToggle} onClick={e => e.stopPropagation()} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onView}>
          {p.images?.[0]
            ? <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-ink-100 flex-shrink-0" />
            : <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center text-ink-300 flex-shrink-0 text-xs">IMG</div>
          }
          <div>
            <div className="font-medium text-ink-800 hover:text-saffron-600 transition-colors line-clamp-1 max-w-[160px]">{p.name}</div>
            <div className="text-xs text-ink-400 font-mono">{p._id?.slice(-6)}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="badge bg-ink-100 text-ink-600">{p.category?.name || '—'}</span>
      </td>
      <td className="px-4 py-3 text-ink-500 hidden md:table-cell text-xs">{p.vendor?.shopName || '—'}</td>
      <td className="px-4 py-3 text-ink-500 hidden lg:table-cell text-xs">{p.district || '—'}</td>
      <td className="px-4 py-3 font-mono font-semibold text-ink-800">₹{p.price?.toLocaleString() ?? '—'}</td>
      <td className="px-4 py-3 font-mono text-ink-400 line-through text-xs hidden xl:table-cell">
        {p.orginalPrice ? `₹${p.orginalPrice.toLocaleString()}` : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`font-mono font-semibold text-sm ${isOut ? 'text-crimson-600' : isLow ? 'text-saffron-600' : 'text-jade-600'}`}>
            {isOut ? '❌' : isLow ? '⚠' : ''} {p.stock}
          </span>
          <div className="flex gap-1">
            <button onClick={onDecrease} title="Decrease" className="w-5 h-5 rounded bg-crimson-100 hover:bg-crimson-200 text-crimson-600 flex items-center justify-center text-xs font-bold transition-colors">−</button>
            <button onClick={onIncrease} title="Increase" className="w-5 h-5 rounded bg-jade-100 hover:bg-jade-200 text-jade-600 flex items-center justify-center text-xs font-bold transition-colors">+</button>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-ink-400 text-xs hidden lg:table-cell">
        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button onClick={onView} title="View" className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-400 hover:text-ink-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button onClick={onEdit} title="Edit" className="p-1.5 rounded-lg hover:bg-saffron-50 text-ink-400 hover:text-saffron-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={onDelete} title="Delete" className="p-1.5 rounded-lg hover:bg-crimson-50 text-ink-400 hover:text-crimson-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

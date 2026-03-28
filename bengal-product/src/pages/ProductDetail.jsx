import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import TopBar from '../components/TopBar';
import api from '../utils/api';

export default function ProductDetail({ setSidebarOpen }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, updateStock } = useProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const local = products.find(p => p._id === id);
    if (local) { setProduct(local); setLoading(false); return; }
    api.getProduct(id)
      .then(r => {
        const d = r.data?.data || r.data;
        setProduct(d);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id, products]);

  if (loading) return (
    <div className="flex flex-col h-full">
      <TopBar title="Product Detail" setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-saffron-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col h-full">
      <TopBar title="Product Detail" setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex items-center justify-center flex-col gap-3 text-ink-400">
        <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="font-semibold">Product not found</p>
        <button onClick={() => navigate('/products')} className="btn-primary">Back to Products</button>
      </div>
    </div>
  );

  const isOut = product.stock === 0;
  const isLow = product.stock > 0 && product.stock <= 5;
  const discount = product.orginalPrice && product.orginalPrice > product.price
    ? Math.round(((product.orginalPrice - product.price) / product.orginalPrice) * 100)
    : null;

  const images = product.images?.length ? product.images : [];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Product Detail" setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-ink-400 mb-4">
          <button onClick={() => navigate('/products')} className="hover:text-saffron-600 transition-colors">Products</button>
          <span>/</span>
          <span className="text-ink-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
          {/* Left: Images */}
          <div className="flex flex-col gap-3">
            <div className="card overflow-hidden aspect-square flex items-center justify-center bg-ink-50">
              {images[activeImg]
                ? <img src={images[activeImg]} alt={product.name} className="w-full h-full object-contain p-4" />
                : <div className="text-ink-300 flex flex-col items-center gap-2">
                    <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm">No image</span>
                  </div>
              }
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-saffron-500' : 'border-ink-100 hover:border-ink-300'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="font-display font-bold text-2xl text-ink-900 leading-tight">{product.name}</h1>
                {isOut
                  ? <span className="badge bg-crimson-100 text-crimson-700 flex-shrink-0">❌ Out of Stock</span>
                  : isLow
                    ? <span className="badge bg-saffron-100 text-saffron-700 flex-shrink-0">⚠ Low Stock</span>
                    : <span className="badge bg-jade-100 text-jade-700 flex-shrink-0">✓ In Stock</span>
                }
              </div>
              {product.description && (
                <p className="text-ink-500 text-sm leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="card p-4 flex items-end gap-3">
              <div>
                <div className="text-xs text-ink-400 uppercase tracking-wider font-semibold mb-1">Price</div>
                <div className="font-display font-bold text-3xl text-ink-900">₹{product.price?.toLocaleString()}</div>
              </div>
              {product.orginalPrice && product.orginalPrice !== product.price && (
                <div>
                  <div className="text-xs text-ink-400 uppercase tracking-wider font-semibold mb-1">MRP</div>
                  <div className="text-ink-400 line-through text-lg font-mono">₹{product.orginalPrice?.toLocaleString()}</div>
                </div>
              )}
              {discount && (
                <span className="badge bg-jade-100 text-jade-700 mb-1">{discount}% OFF</span>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              <MetaItem label="Category" value={product.category?.name || '—'} icon="🏷" />
              <MetaItem label="Vendor" value={product.vendor?.shopName || '—'} icon="🏪" />
              <MetaItem label="District" value={product.district || '—'} icon="📍" />
              <MetaItem
                label="Stock"
                value={<span className={isOut ? 'text-crimson-600' : isLow ? 'text-saffron-600' : 'text-jade-600'}>{isOut ? '❌ 0' : `${isLow ? '⚠ ' : ''}${product.stock}`}</span>}
                icon="📦"
              />
              <MetaItem label="Created" value={new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} icon="📅" />
              <MetaItem label="Updated" value={new Date(product.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} icon="🔄" />
            </div>

            {/* Stock Controls */}
            <div className="card p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Stock Management</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateStock(product._id, Math.max(0, product.stock - 1))}
                  className="flex-1 py-2 rounded-lg bg-crimson-50 hover:bg-crimson-100 text-crimson-700 font-semibold text-sm border border-crimson-200 transition-all active:scale-95"
                >
                  − Decrease Stock
                </button>
                <div className="w-16 text-center font-mono font-bold text-xl text-ink-800">{product.stock}</div>
                <button
                  onClick={() => updateStock(product._id, product.stock + 1)}
                  className="flex-1 py-2 rounded-lg bg-jade-50 hover:bg-jade-100 text-jade-700 font-semibold text-sm border border-jade-200 transition-all active:scale-95"
                >
                  + Increase Stock
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setEditOpen(true)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Product
              </button>
              <button onClick={() => setDeleteOpen(true)} className="btn-danger flex items-center justify-center gap-2 px-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {editOpen && <EditModal product={product} onClose={() => setEditOpen(false)} />}
      {deleteOpen && <DeleteModal product={product} onClose={() => { setDeleteOpen(false); navigate('/products'); }} />}
    </div>
  );
}

function MetaItem({ label, value, icon }) {
  return (
    <div className="bg-ink-50 rounded-xl p-3">
      <div className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-1">{icon} {label}</div>
      <div className="text-sm font-medium text-ink-800">{value}</div>
    </div>
  );
}

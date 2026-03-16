import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, ImageOff, Tag, DollarSign, Archive } from 'lucide-react'
import toast from 'react-hot-toast'
import { vendorAPI } from '../services/api'

// Guard: coerce any accidentally-populated object field to a display string
function safeStr(val) {
  if (val === null || val === undefined) return null
  if (typeof val === 'object') return val.name || val.title || String(val._id) || '—'
  return String(val)
}

function ProductRow({ product }) {
  const [imgErr, setImgErr] = useState(false)
  const img = product.image || product.images?.[0] || product.thumbnail

  return (
    <tr className="table-row-hover animate-fade-in">
      <td className="px-4 py-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {img && !imgErr
            ? <img src={img} alt={product.name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
            : <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
          }
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-tight">
          {safeStr(product.name || product.productName) || '—'}
        </p>
        {product.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{safeStr(product.description)}</p>
        )}
      </td>
      <td className="px-4 py-3">
        {safeStr(product.category)
          ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium border border-purple-100 dark:border-purple-500/20">
              <Tag className="w-2.5 h-2.5" />{safeStr(product.category)}
            </span>
          )
          : <span className="text-gray-400 text-xs">—</span>
        }
      </td>
      <td className="px-4 py-3">
        <span className="font-mono font-semibold text-sm text-gray-900 dark:text-gray-100">
          ₹{Number(product.price || 0).toLocaleString('en-IN')}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`font-mono text-sm font-medium ${
          (product.stock || 0) === 0        ? 'text-red-500 dark:text-red-400'
          : (product.stock || 0) < 10       ? 'text-amber-500 dark:text-amber-400'
          :                                   'text-emerald-600 dark:text-emerald-400'
        }`}>
          {product.stock ?? '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
        {product.createdAt
          ? new Date(product.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—'}
      </td>
    </tr>
  )
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-3"><div className="skeleton w-10 h-10 rounded-xl" /></td>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded-md" style={{ width: `${50 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function VendorProducts() {
  const { vendorId } = useParams()    // vendorId = "VEND-xxx" from the URL
  const navigate = useNavigate()
  const [products,    setProducts]    = useState([])
  const [vendorName,  setVendorName]  = useState('')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [products, vendor] = await Promise.all([
          vendorAPI.getVendorProducts(vendorId),
          vendorAPI.getVendor(vendorId).catch(() => null),
        ])
        setProducts(products)
        if (vendor) setVendorName(vendor.name || vendor.shopName || '')
      } catch {
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [vendorId])

  const totalStock = products.reduce((s, p) => s + (Number(p.stock) || 0), 0)
  const totalValue = products.reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.stock) || 0), 0)

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Stats strip */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Package,  label: 'Total Products',   value: products.length,                          color: 'blue'    },
            { icon: Archive,  label: 'Total Stock',       value: totalStock.toLocaleString(),              color: 'purple'  },
            { icon: DollarSign, label: 'Inventory Value', value: `₹${totalValue.toLocaleString('en-IN')}`, color: 'emerald' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                color === 'blue'    ? 'bg-brand-50   dark:bg-brand-500/10'   :
                color === 'purple'  ? 'bg-purple-50  dark:bg-purple-500/10'  :
                                      'bg-emerald-50 dark:bg-emerald-500/10'
              }`}>
                <Icon className={`w-4 h-4 ${
                  color === 'blue'    ? 'text-brand-600   dark:text-brand-400'   :
                  color === 'purple'  ? 'text-purple-600  dark:text-purple-400'  :
                                        'text-emerald-600 dark:text-emerald-400'
                }`} />
              </div>
              <div>
                <p className="font-display font-bold text-gray-900 dark:text-white text-lg leading-tight">{value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-display font-bold text-gray-900 dark:text-white">
            {vendorName ? `${vendorName}'s Products` : 'Vendor Products'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
            {loading ? '...' : `${products.length} product${products.length !== 1 ? 's' : ''} listed`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Image', 'Product', 'Category', 'Price', 'Stock', 'Listed On'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {loading
                ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                : products.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Package className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-400 dark:text-gray-500 font-medium">No products found</p>
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">This vendor has not listed any products yet</p>
                    </td>
                  </tr>
                )
                : products.map((p, i) => <ProductRow key={p._id || p.id || i} product={p} />)
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

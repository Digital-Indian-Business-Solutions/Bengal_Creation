import { useNavigate } from 'react-router-dom'
import { Eye, CheckCircle, Trash2, Package, MoreHorizontal, Download } from 'lucide-react'
import { generateVendorPDF } from '../utils/generateVendorPDF'
import { vendorAPI } from '../services/api'
import toast from 'react-hot-toast'
import { useState, useRef, useEffect } from 'react'

// vendor.status is 'verified' | 'pending' — set by normalizeVendor
function StatusBadge({ isVerified }) {
  return isVerified
    ? <span className="badge-verified">Verified</span>
    : <span className="badge-pending">Pending</span>
}

function ActionMenu({ vendor, onVerify, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // vendor.id = vendorId string like "VEND-xxx" (set by normalizeVendor)
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10 animate-fade-in">
          <button
            onClick={() => { navigate(`/vendors/${vendor.id}`); setOpen(false) }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-brand-500" /> View Details
          </button>
          <button
            onClick={() => { navigate(`/vendors/${vendor.id}/products`); setOpen(false) }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Package className="w-3.5 h-3.5 text-purple-500" /> View Products
          </button>
          <button
            onClick={async () => {
              setOpen(false)
              const tid = toast.loading('Generating PDF…')
              try {
                const prods = await vendorAPI.getVendorProducts(vendor.id)
                await generateVendorPDF(vendor, prods)
                toast.success('PDF downloaded!', { id: tid })
              } catch {
                toast.error('PDF generation failed', { id: tid })
              }
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" /> Download PDF
          </button>
          {!vendor.isVerified && (
            <button
              onClick={() => { onVerify(vendor.id); setOpen(false) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Verify Vendor
            </button>
          )}
          <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
          <button
            onClick={() => { onDelete(vendor); setOpen(false) }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Vendor
          </button>
        </div>
      )}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="skeleton h-4 rounded-md" style={{ width: `${55 + Math.random() * 35}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function VendorTable({ vendors, loading, onVerify, onDelete }) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {['Vendor ID', 'Vendor', 'Email', 'Phone', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    )
  }

  if (!vendors?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Package className="w-7 h-7 text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-base font-medium text-gray-500 dark:text-gray-400">No vendors found</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            {['Vendor ID', 'Vendor', 'Email', 'Phone', 'Status', 'Created', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="table-row-hover group animate-fade-in">
              {/* Vendor ID */}
              <td className="px-4 py-3.5">
                <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                  {vendor.vendorId || vendor._id?.slice(-6)}
                </span>
              </td>

              {/* Name + shop */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800">
                    {vendor.logo
                      ? <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                      : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                          {(vendor.name || 'V')[0].toUpperCase()}
                        </div>
                      )
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 leading-tight whitespace-nowrap">
                      {vendor.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                      {vendor.shopName || '—'}
                    </p>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 max-w-[180px] truncate">
                {vendor.email || '—'}
              </td>

              {/* Phone */}
              <td className="px-4 py-3.5 font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {vendor.phone || '—'}
              </td>

              {/* Status */}
              <td className="px-4 py-3.5">
                <StatusBadge isVerified={vendor.isVerified} />
              </td>

              {/* Created */}
              <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                {vendor.createdAt
                  ? new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </td>

              {/* Actions */}
              <td className="px-4 py-3.5">
                <ActionMenu vendor={vendor} onVerify={onVerify} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

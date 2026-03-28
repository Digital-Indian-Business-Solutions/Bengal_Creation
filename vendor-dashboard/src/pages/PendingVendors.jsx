import { useEffect, useState } from 'react'
import { CheckCircle, FileText, Mail, Phone, Clock, RefreshCw, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { vendorAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

function PendingCard({ vendor, onApprove, approving }) {
  const navigate = useNavigate()

  // documents were flattened by normalizeVendor
  const docCount = [vendor.tradeLicense, vendor.aadhaarCard, vendor.panCard, vendor.otherDoc]
    .filter(Boolean).length

  return (
    <div className="card card-hover p-5 animate-slide-up">
      <div className="flex items-start gap-4">
        {/* Avatar / Logo */}
        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800">
          {vendor.logo
            ? <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
            : (
              <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white font-bold text-lg">
                {(vendor.name || 'V')[0].toUpperCase()}
              </div>
            )
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{vendor.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{vendor.shopName || '—'}</p>
            </div>
            <span className="badge-pending flex-shrink-0">Pending</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{vendor.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{vendor.phone || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-IN') : '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{docCount > 0 ? `${docCount} document${docCount > 1 ? 's' : ''} submitted` : 'No documents'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(`/vendors/${vendor.id}`)}
          className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
        >
          <User className="w-3.5 h-3.5" />
          View Profile
        </button>
        <button
          onClick={() => onApprove(vendor.id)}
          disabled={approving === vendor.id}
          className="btn-success text-xs py-1.5 px-3 flex-1 justify-center"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {approving === vendor.id ? 'Approving...' : 'Approve'}
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32 rounded-md" />
          <div className="skeleton h-3 w-48 rounded-md" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-3 rounded-md" />)}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="skeleton h-8 flex-1 rounded-xl" />
        <div className="skeleton h-8 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

export default function PendingVendors() {
  const [vendors,   setVendors]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [approving, setApproving] = useState(null)

  const fetchPending = async () => {
    setLoading(true)
    try {
      // returns array of normalised vendors
      const data = await vendorAPI.getPendingVendors()
      setVendors(data)
    } catch {
      toast.error('Failed to load pending vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPending() }, [])

  const handleApprove = async (vendorId) => {
    setApproving(vendorId)
    try {
      await vendorAPI.verifyVendor(vendorId)
      toast.success('Vendor approved!')
      setVendors(vs => vs.filter(v => v.id !== vendorId))
    } catch (e) {
      toast.error(e.message || 'Approval failed')
    } finally {
      setApproving(null)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Pending Approvals</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
            {loading ? '...' : `${vendors.length} vendor${vendors.length !== 1 ? 's' : ''} awaiting review`}
          </p>
        </div>
        <button onClick={fetchPending} disabled={loading} className="btn-secondary text-xs py-1.5 px-3">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          : vendors.length === 0
          ? (
            <div className="col-span-full card flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-400">All caught up!</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No vendors awaiting approval</p>
            </div>
          )
          : vendors.map(v => (
            <PendingCard key={v.id} vendor={v} onApprove={handleApprove} approving={approving} />
          ))
        }
      </div>
    </div>
  )
}

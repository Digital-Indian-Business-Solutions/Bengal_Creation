import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import VendorTable from '../components/VendorTable'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import { vendorAPI } from '../services/api'
import { Trash2 } from 'lucide-react'

export default function Vendors() {
  const [vendors,     setVendors]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,    setDeleting]    = useState(false)
  const limit = 10

  const fetchVendors = useCallback(async (p) => {
    setLoading(true)
    try {
      // vendorAPI.getVendors returns { vendors, total, totalPages }
      const { vendors, totalPages: tp } = await vendorAPI.getVendors(p, limit)
      setVendors(vendors)
      setTotalPages(tp)
    } catch (e) {
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVendors(page) }, [page])

  const handleVerify = async (vendorId) => {
    try {
      await vendorAPI.verifyVendor(vendorId)
      toast.success('Vendor verified successfully!')
      // Update status in-place using the normalised `id` field
      setVendors(vs =>
        vs.map(v => v.id === vendorId ? { ...v, status: 'verified', isVerified: true } : v)
      )
    } catch (e) {
      toast.error(e.message || 'Verification failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await vendorAPI.deleteVendor(deleteTarget.id)
      toast.success('Vendor deleted')
      setVendors(vs => vs.filter(v => v.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-display font-bold text-gray-900 dark:text-white">All Vendors</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {loading ? '...' : `${vendors.length} vendors loaded`}
            </p>
          </div>
          <button
            onClick={() => fetchVendors(page)}
            disabled={loading}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <VendorTable
          vendors={vendors}
          loading={loading}
          onVerify={handleVerify}
          onDelete={setDeleteTarget}
        />

        {!loading && vendors.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-center font-semibold text-gray-900 dark:text-white mb-2">
            Delete vendor permanently?
          </h3>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            This will permanently remove{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {deleteTarget?.name}
            </span>{' '}
            and all their data. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 justify-center">
              {deleting ? 'Deleting...' : 'Delete Vendor'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

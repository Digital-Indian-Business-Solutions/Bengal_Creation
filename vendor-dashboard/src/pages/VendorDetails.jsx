import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, Trash2, Package, Mail, Phone,
  MapPin, FileText, ExternalLink, Shield, Store, User,
  Download, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import { vendorAPI } from '../services/api'
import { generateVendorPDF } from '../utils/generateVendorPDF'

// ─── Document card with in-modal PDF / image viewer ────────────────────────
function DocCard({ label, url, icon: Icon }) {
  const [open, setOpen] = useState(false)
  if (!url) return null

  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
  const isPDF   = /\.pdf$/i.test(url)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700
          hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10
          transition-all duration-150 group text-left w-full"
      >
        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Click to view</p>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={label} maxWidth="max-w-3xl">
        <div className="p-4">
          {isImage ? (
            <img src={url} alt={label} className="w-full rounded-xl object-contain max-h-[70vh] bg-gray-50 dark:bg-gray-800" />
          ) : isPDF ? (
            <iframe src={url} className="w-full h-[70vh] rounded-xl border-0" title={label} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">Preview not available</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <ExternalLink className="w-4 h-4" /> Open in New Tab
              </a>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
      </div>
      <div>
        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5 whitespace-pre-line">{value}</p>
      </div>
    </div>
  )
}

export default function VendorDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendor,       setVendor]       = useState(null)
  const [products,     setProducts]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [verifying,    setVerifying]    = useState(false)
  const [deleteModal,  setDeleteModal]  = useState(false)
  const [deleting,     setDeleting]     = useState(false)
  const [pdfLoading,   setPdfLoading]   = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const v = await vendorAPI.getVendor(id)
        setVendor(v)
        // Pre-fetch products so PDF can use them too
        if (v && (v.products?.length > 0 || v.id)) {
          try {
            const prods = await vendorAPI.getVendorProducts(v.id)
            setProducts(prods)
          } catch {
            // products not critical for page load
          }
        }
      } catch {
        toast.error('Failed to load vendor details')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleVerify = async () => {
    setVerifying(true)
    try {
      await vendorAPI.verifyVendor(vendor.id)
      toast.success('Vendor verified!')
      setVendor(v => ({ ...v, status: 'verified', isVerified: true }))
    } catch (e) {
      toast.error(e.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await vendorAPI.deleteVendor(vendor.id)
      toast.success('Vendor deleted')
      navigate('/vendors')
    } catch (e) {
      toast.error(e.message || 'Delete failed')
      setDeleting(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!vendor) return
    setPdfLoading(true)
    const tid = toast.loading('Generating PDF report…')
    try {
      // Make sure we have fresh products
      let prods = products
      if (prods.length === 0 && vendor.products?.length > 0) {
        prods = await vendorAPI.getVendorProducts(vendor.id)
        setProducts(prods)
      }
      await generateVendorPDF(vendor, prods)
      toast.success('PDF downloaded!', { id: tid })
    } catch (e) {
      console.error(e)
      toast.error('Failed to generate PDF', { id: tid })
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-32 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="skeleton h-72 rounded-2xl lg:col-span-2" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="card flex flex-col items-center justify-center py-20">
        <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Vendor not found</p>
        <button onClick={() => navigate('/vendors')} className="btn-secondary mt-4 text-sm">
          Back to Vendors
        </button>
      </div>
    )
  }

  const isVerified = vendor.isVerified === true

  const docs = [
    { label: 'Trade License',  url: vendor.tradeLicense, icon: FileText },
    { label: 'Aadhaar Card',   url: vendor.aadhaarCard,  icon: Shield   },
    { label: 'PAN Card',       url: vendor.panCard,      icon: FileText },
    { label: 'Other Document', url: vendor.otherDoc,     icon: FileText },
  ]
  const hasDocs = docs.some(d => d.url)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Back + action bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm py-1.5 px-3">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* ── Download PDF ── */}
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-accent-600
              hover:from-brand-700 hover:to-accent-700 text-white font-medium text-sm rounded-xl
              transition-all duration-150 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pdfLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              : <><Download className="w-4 h-4" /> Download PDF</>
            }
          </button>

          <button
            onClick={() => navigate(`/vendors/${vendor.id}/products`)}
            className="btn-secondary text-sm py-1.5 px-3"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Products ({vendor.products?.length ?? 0})</span>
          </button>

          {!isVerified && (
            <button onClick={handleVerify} disabled={verifying} className="btn-success text-sm py-1.5 px-3">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{verifying ? 'Verifying...' : 'Approve Vendor'}</span>
            </button>
          )}

          <button onClick={() => setDeleteModal(true)} className="btn-danger text-sm py-1.5 px-3">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Profile card ── */}
        <div className="lg:col-span-2 card overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 relative overflow-hidden">
            {vendor.banner && (
              <img src={vendor.banner} alt="Banner" className="w-full h-full object-cover opacity-70" />
            )}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
              backgroundSize: '20px 20px',
            }} />
          </div>

          <div className="px-6 pb-6">
            {/* Logo + status */}
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-900 shadow-md overflow-hidden flex-shrink-0">
                {vendor.logo
                  ? <img src={vendor.logo} alt="Logo" className="w-full h-full object-cover" />
                  : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white font-bold text-xl">
                      {(vendor.name || 'V')[0].toUpperCase()}
                    </div>
                  )
                }
              </div>
              <div className="mt-10">
                {isVerified
                  ? <span className="badge-verified"><CheckCircle className="w-3 h-3 mr-1 inline" />Verified</span>
                  : <span className="badge-pending">Pending</span>
                }
              </div>
            </div>

            <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">{vendor.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5 mb-1">
              <Store className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{vendor.shopName || '—'}</p>
            </div>
            <p className="text-xs font-mono text-gray-400 dark:text-gray-500">
              ID: {vendor.vendorId || vendor._id}
            </p>

            {vendor.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed border-l-2 border-brand-200 dark:border-brand-700 pl-3">
                {vendor.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <InfoRow icon={Mail}    label="Email"            value={vendor.email} />
              <InfoRow icon={Phone}   label="Phone"            value={vendor.phone} />
              <InfoRow icon={MapPin}  label="Address"          value={vendor.address} />
              <InfoRow icon={Package} label="Products listed"  value={String(vendor.products?.length ?? 0)} />
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* Documents */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" />
              Documents
            </h3>
            {hasDocs
              ? <div className="space-y-2">{docs.map(d => <DocCard key={d.label} {...d} />)}</div>
              : (
                <div className="flex flex-col items-center py-8 text-center">
                  <FileText className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">No documents uploaded</p>
                </div>
              )
            }
          </div>

          {/* Account meta */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-3 text-sm">Account Info</h3>
            <dl className="space-y-2.5 text-xs">
              {[
                ['Vendor ID',    vendor.vendorId],
                ['Status',       isVerified ? '✓ Verified' : '⏳ Pending'],
                ['Joined',       vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'],
                ['Last Updated', vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-2">
                  <dt className="text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wide flex-shrink-0">{k}</dt>
                  <dd className="font-medium text-gray-700 dark:text-gray-300 text-right font-mono break-all">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* PDF download card */}
          <div className="card p-5 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-500/5 dark:to-purple-500/5 border-brand-100 dark:border-brand-500/20">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Vendor Report</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Full profile + all products</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5
                bg-gradient-to-r from-brand-600 to-accent-600
                hover:from-brand-700 hover:to-accent-700
                text-white font-medium text-sm rounded-xl
                transition-all duration-150 shadow-sm hover:shadow-md
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pdfLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : <><Download className="w-4 h-4" /> Download PDF</>
              }
            </button>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
              {vendor.name?.replace(/\s+/g,'_').toLowerCase()}_{vendor.vendorId}.pdf
            </p>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Confirm Delete">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Delete this vendor?</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span className="font-medium text-gray-700 dark:text-gray-300">{vendor.name}</span> and all
            associated data will be permanently removed.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 justify-center">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.bengalcreations.in/api/vendors'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bc_session')
      window.location.href = '/login'
    }
    const msg = error.response?.data?.message || error.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

// ─── Normalizers ────────────────────────────────────────────────────────────
// Normalize a vendor object so the rest of the UI can use consistent field names.
// Real API uses: isVerified (bool), documents nested obj, vendorId as route key.
export function normalizeVendor(v) {
  if (!v) return v
  return {
    ...v,
    // expose a unified `id` = vendorId string  (used for API calls like /vendors/:vendorId)
    id: v.vendorId || v._id,
    // flatten documents up one level for easy access
    tradeLicense:  v.documents?.tradeLicense  || v.tradeLicense  || null,
    aadhaarCard:   v.documents?.aadhaarCard   || v.aadhaarCard   || null,
    panCard:       v.documents?.panCard       || v.panCard       || null,
    otherDoc:      v.documents?.otherDoc      || v.otherDoc      || null,
    // unified status string derived from isVerified boolean
    status: v.isVerified ? 'verified' : 'pending',
  }
}

// Normalize the analytics summary from the real shape:
// { totalVendors, verified, pending, totalProducts }
export function normalizeAnalytics(a) {
  if (!a) return a
  return {
    totalVendors:    a.totalVendors    ?? 0,
    verifiedVendors: a.verified        ?? a.verifiedVendors ?? 0,
    pendingVendors:  a.pending         ?? a.pendingVendors  ?? 0,
    totalProducts:   a.totalProducts   ?? 0,
    monthlyRegistrations: a.monthlyRegistrations || [],
  }
}

// ─── Product normalizer ─────────────────────────────────────────────────────
// The products API may return populated sub-documents as objects e.g.
// category: { _id: '...', name: 'Handicraft' }  →  flatten to string
export function normalizeProduct(p) {
  if (!p) return p
  return {
    ...p,
    // category can be string or { _id, name }
    category: typeof p.category === 'object' && p.category !== null
      ? (p.category.name || p.category.title || String(p.category._id) || '—')
      : (p.category || null),
    // vendor can be populated object
    vendor: typeof p.vendor === 'object' && p.vendor !== null
      ? (p.vendor.name || p.vendor.vendorId || String(p.vendor._id))
      : (p.vendor || null),
    // subcategory same pattern
    subcategory: typeof p.subcategory === 'object' && p.subcategory !== null
      ? (p.subcategory.name || p.subcategory.title || null)
      : (p.subcategory || null),
    // ensure numeric fields are numbers
    price: p.price != null ? Number(p.price) : null,
    stock: p.stock != null ? Number(p.stock) : null,
  }
}

// ─── API methods ─────────────────────────────────────────────────────────────
export const vendorAPI = {
  // GET /vendors?page=1&limit=10  → { success, vendors: [...] }
  getVendors: async (page = 1, limit = 10) => {
    const res = await api.get(`/vendors?page=${page}&limit=${limit}`)
    const vendors = (res.data?.vendors || res.data?.data || []).map(normalizeVendor)
    const total   = res.data?.total ?? vendors.length
    const totalPages = res.data?.totalPages|| Math.ceil(total / limit) || 1
    return { vendors, total, totalPages }
  },

  // GET /vendors/:vendorId  → { success, vendor: {...} }
  getVendor: async (vendorId) => {
    const res = await api.get(`/vendors/${vendorId}`)
    return normalizeVendor(res.data?.vendor || res.data?.data || res.data)
  },

  // GET /vendors/pending/all  → { success, vendors: [...] }
  getPendingVendors: async () => {
    const res = await api.get('/vendors/pending/all')
    return (res.data?.vendors || res.data?.data || []).map(normalizeVendor)
  },

  // PATCH /vendors/verify/:vendorId
  verifyVendor: (vendorId) => api.patch(`/vendors/verify/${vendorId}`),

  // DELETE /vendors/:vendorId
  deleteVendor: (vendorId) => api.delete(`/vendors/${vendorId}`),

  // GET /vendors/:vendorId/products  → { success, products: [...] }
  getVendorProducts: async (vendorId) => {
    const res = await api.get(`/vendors/${vendorId}/products`)
    const raw = res.data?.products || res.data?.data || []
    return raw.map(normalizeProduct)
  },

  // GET /vendors/search/query?q=keyword
  searchVendors: async (q) => {
    const res = await api.get(`/vendors/search/query?q=${encodeURIComponent(q)}`)
    return (res.data?.vendors || res.data?.data || []).map(normalizeVendor)
  },

  // GET /vendors/analytics/summary  → { success, analytics: { totalVendors, verified, pending, totalProducts } }
  getAnalytics: async () => {
    const res = await api.get('/vendors/analytics/summary')
    return normalizeAnalytics(res.data?.analytics || res.data?.data || res.data)
  },
}

export default api

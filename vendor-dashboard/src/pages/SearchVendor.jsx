import { useState, useRef, useCallback } from 'react'
import { Search, X, Store, Mail, Phone, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { vendorAPI } from '../services/api'

function ResultCard({ vendor }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/vendors/${vendor.id}`)}
      className="card card-hover p-4 cursor-pointer group animate-slide-up"
    >
      <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white">{vendor.name}</h3>
            <span className={vendor.isVerified ? 'badge-verified' : 'badge-pending'}>
              {vendor.isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Store className="w-3 h-3 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{vendor.shopName || '—'}</p>
          </div>
          <div className="flex items-center gap-4 mt-1">
            {vendor.email && (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Mail className="w-3 h-3" />
                <span className="truncate max-w-[160px]">{vendor.email}</span>
              </span>
            )}
            {vendor.phone && (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Phone className="w-3 h-3" />
                {vendor.phone}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2"><div className="skeleton h-4 w-32 rounded-md" /><div className="skeleton h-4 w-16 rounded-full" /></div>
          <div className="skeleton h-3 w-48 rounded-md" />
          <div className="skeleton h-3 w-40 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default function SearchVendor() {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef(null)
  const inputRef    = useRef(null)

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    try {
      // vendorAPI.searchVendors returns normalised array
      const data = await vendorAPI.searchVendors(q)
      setResults(data)
    } catch {
      toast.error('Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 400)
  }

  const handleClear = () => {
    setQuery(''); setResults([]); setSearched(false)
    inputRef.current?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    doSearch(query)
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Search Vendors</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500">Find vendors by name, email, shop name, or phone</p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className={`absolute left-4 w-[18px] h-[18px] transition-colors ${query ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search by name, email, shop name..."
            className="input pl-11 pr-24 py-3.5 text-base shadow-sm"
            autoFocus
          />
          <div className="absolute right-3 flex items-center gap-2">
            {query && (
              <button type="button" onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button type="submit" className="btn-primary text-xs py-1.5 px-3">Search</button>
          </div>
        </div>
      </form>

      {/* Hint chips */}
      {!searched && (
        <div className="flex flex-wrap gap-2 justify-center animate-fade-in">
          {['Tanishka', 'KOUSHIKI', 'Bitan Mart', 'kolkata'].map(hint => (
            <button
              key={hint}
              onClick={() => { setQuery(hint); doSearch(hint) }}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-mono"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2.5">
        {loading
          ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          : results.length > 0
          ? (
            <>
              <p className="text-xs text-gray-400 font-mono px-1">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>
              {results.map(v => <ResultCard key={v.id} vendor={v} />)}
            </>
          )
          : (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="font-medium text-gray-500 dark:text-gray-400">
                {searched ? `No vendors found for "${query}"` : 'Start searching'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {searched ? 'Try a different name, email, or shop name' : 'Type a vendor name, email, or shop name above'}
              </p>
            </div>
          )
        }
      </div>
    </div>
  )
}

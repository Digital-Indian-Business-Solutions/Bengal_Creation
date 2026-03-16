import { useEffect, useState } from 'react'
import { Users, CheckCircle, Clock, Package, TrendingUp, RefreshCw } from 'lucide-react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js'
import VendorCard from '../components/VendorCard'
import { vendorAPI } from '../services/api'
import toast from 'react-hot-toast'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, ArcElement, Filler
)

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      // returns normalised { totalVendors, verifiedVendors, pendingVendors, totalProducts }
      const data = await vendorAPI.getAnalytics()
      setSummary(data)
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const grid = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  const text = dark ? '#94a3b8' : '#6b7280'
  const tooltipOpts = {
    backgroundColor: dark ? '#1e293b' : '#fff',
    titleColor:  dark ? '#e2e8f0' : '#1e293b',
    bodyColor:   dark ? '#94a3b8' : '#64748b',
    borderColor: dark ? '#334155' : '#e2e8f0',
    borderWidth: 1, padding: 10, cornerRadius: 10,
  }
  const axisOpts = {
    grid:  { color: grid },
    ticks: { color: text, font: { family: 'JetBrains Mono', size: 11 } },
  }
  const baseOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: tooltipOpts },
    scales:  { x: axisOpts, y: axisOpts },
  }

  const months = summary?.monthlyRegistrations?.map(m => m.month) ||
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const counts = summary?.monthlyRegistrations?.map(m => m.count) ||
    [4, 7, 5, 12, 8, 15, 10, 18, 13, 9, 16, 20]

  const barData = {
    labels: months,
    datasets: [{
      label: 'Registrations',
      data: counts,
      backgroundColor: dark ? 'rgba(56,189,248,0.8)' : 'rgba(14,165,233,0.8)',
      borderRadius: 8,
      borderSkipped: false,
    }]
  }

  const lineData = {
    labels: months,
    datasets: [{
      label: 'Cumulative Vendors',
      data: counts.reduce((acc, v, i) => { acc.push((acc[i - 1] || 0) + v); return acc }, []),
      borderColor: dark ? '#a78bfa' : '#8b5cf6',
      backgroundColor: dark ? 'rgba(167,139,250,0.1)' : 'rgba(139,92,246,0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: dark ? '#a78bfa' : '#8b5cf6',
      pointRadius: 4, pointHoverRadius: 6,
      fill: true, tension: 0.4,
    }]
  }

  const doughnutData = {
    labels: ['Verified', 'Pending'],
    datasets: [{
      data: [summary?.verifiedVendors || 0, summary?.pendingVendors || 0],
      backgroundColor: [
        dark ? 'rgba(52,211,153,0.85)' : 'rgba(16,185,129,0.85)',
        dark ? 'rgba(251,191,36,0.85)'  : 'rgba(245,158,11,0.85)',
      ],
      borderWidth: 0, hoverOffset: 10,
    }]
  }

  const stats = [
    { title: 'Total Vendors',    value: summary?.totalVendors,    icon: Users,       color: 'blue'    },
    { title: 'Verified',         value: summary?.verifiedVendors, icon: CheckCircle, color: 'emerald', trend: 8  },
    { title: 'Pending',          value: summary?.pendingVendors,  icon: Clock,       color: 'amber'   },
    { title: 'Total Products',   value: summary?.totalProducts,   icon: Package,     color: 'purple',  trend: 21 },
  ]

  const verRate = summary?.totalVendors
    ? Math.round((summary.verifiedVendors / summary.totalVendors) * 100)
    : 0

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Analytics Overview</h2>
          <p className="text-sm text-gray-400 font-mono mt-0.5">Marketplace performance metrics</p>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary text-xs py-1.5 px-3">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <VendorCard key={i} {...s} loading={loading} />)}
      </div>

      {/* Verification rate */}
      {!loading && (
        <div className="card p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">Verification Rate</p>
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">{verRate}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${verRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 font-mono">
            <span>{summary?.verifiedVendors || 0} verified</span>
            <span>{summary?.pendingVendors  || 0} pending</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5 animate-slide-up">
          <div className="mb-4">
            <h3 className="font-display font-bold text-gray-900 dark:text-white">Monthly Registrations</h3>
            <p className="text-xs text-gray-400 mt-0.5">New vendors per month</p>
          </div>
          {loading ? <div className="skeleton w-full h-48 rounded-xl" /> : <Bar data={barData} options={baseOpts} />}
        </div>

        <div className="card p-5 animate-slide-up">
          <div className="mb-4">
            <h3 className="font-display font-bold text-gray-900 dark:text-white">Growth Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">Cumulative vendor growth</p>
          </div>
          {loading ? <div className="skeleton w-full h-48 rounded-xl" /> : (
            <Line data={lineData} options={baseOpts} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 animate-slide-up">
          <div className="mb-4">
            <h3 className="font-display font-bold text-gray-900 dark:text-white">Status Distribution</h3>
            <p className="text-xs text-gray-400 mt-0.5">Vendor approval status</p>
          </div>
          {loading ? <div className="skeleton w-full h-52 rounded-xl" /> : (
            <div className="flex flex-col items-center">
              <div className="w-44 h-44">
                <Doughnut data={doughnutData} options={{
                  responsive: true, cutout: '68%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: text, font: { family: 'DM Sans', size: 12 }, padding: 16, usePointStyle: true },
                    },
                    tooltip: tooltipOpts,
                  }
                }} />
              </div>
            </div>
          )}
        </div>

        <div className="card p-5 lg:col-span-2 animate-slide-up">
          <div className="mb-4">
            <h3 className="font-display font-bold text-gray-900 dark:text-white">Key Metrics</h3>
            <p className="text-xs text-gray-400 mt-0.5">Summary at a glance</p>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Total Vendors',    value: summary?.totalVendors    || 0, max: summary?.totalVendors || 1,              color: 'from-brand-500   to-brand-400'   },
                { label: 'Verified Vendors', value: summary?.verifiedVendors || 0, max: summary?.totalVendors || 1,              color: 'from-emerald-500 to-emerald-400' },
                { label: 'Pending Vendors',  value: summary?.pendingVendors  || 0, max: summary?.totalVendors || 1,              color: 'from-amber-500   to-amber-400'   },
                { label: 'Total Products',   value: summary?.totalProducts   || 0, max: Math.max(summary?.totalProducts || 1, 100), color: 'from-purple-500  to-purple-400'  },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Users, CheckCircle, Clock, Package } from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js'
import VendorCard from '../components/VendorCard'
import { vendorAPI } from '../services/api'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function Dashboard() {
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

  useEffect(() => {
    const load = async () => {
      try {
        // vendorAPI.getAnalytics() now returns normalized object directly
        const data = await vendorAPI.getAnalytics()
        setSummary(data)
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grid  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  const text  = dark ? '#94a3b8' : '#6b7280'
  const tooltipOpts = {
    backgroundColor: dark ? '#1e293b' : '#fff',
    titleColor:  dark ? '#e2e8f0' : '#1e293b',
    bodyColor:   dark ? '#94a3b8' : '#64748b',
    borderColor: dark ? '#334155' : '#e2e8f0',
    borderWidth: 1, padding: 10, cornerRadius: 10,
  }

  const stats = [
    { title: 'Total Vendors',    value: summary?.totalVendors,    icon: Users,         color: 'blue',    trend: 12 },
    { title: 'Verified Vendors', value: summary?.verifiedVendors, icon: CheckCircle,   color: 'emerald', trend: 8  },
    { title: 'Pending Vendors',  value: summary?.pendingVendors,  icon: Clock,         color: 'amber',   trend: -3 },
    { title: 'Total Products',   value: summary?.totalProducts,   icon: Package,       color: 'purple',  trend: 21 },
  ]

  const months = summary?.monthlyRegistrations?.map(m => m.month) ||
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const counts = summary?.monthlyRegistrations?.map(m => m.count) ||
    [4, 7, 5, 12, 8, 15, 10, 18, 13, 9, 16, 20]

  const barData = {
    labels: months,
    datasets: [{
      label: 'New Vendors',
      data: counts,
      backgroundColor: dark ? 'rgba(56,189,248,0.85)' : 'rgba(14,165,233,0.85)',
      borderRadius: 8,
      borderSkipped: false,
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
      borderWidth: 0,
      hoverOffset: 8,
    }]
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative">
          <h2 className="font-display font-bold text-xl mb-1">Welcome back, Admin 👋</h2>
          <p className="text-brand-200 text-sm">Here's what's happening with your vendor marketplace today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <VendorCard key={i} {...s} loading={loading} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Vendor Registrations</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Monthly new vendors this year</p>
            </div>
            <span className="badge badge-verified">2026</span>
          </div>
          {loading
            ? <div className="skeleton w-full h-52 rounded-xl" />
            : <Bar data={barData} options={baseOpts} />
          }
        </div>

        <div className="card p-5 animate-slide-up">
          <div className="mb-5">
            <h3 className="font-display font-bold text-gray-900 dark:text-white">Vendor Status</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Verified vs pending breakdown</p>
          </div>
          {loading
            ? <div className="skeleton w-full h-52 rounded-xl" />
            : (
              <div className="flex flex-col items-center">
                <div className="w-48 h-48">
                  <Doughnut data={doughnutData} options={{
                    responsive: true, cutout: '70%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: text, font: { family: 'DM Sans', size: 13 }, padding: 20, usePointStyle: true },
                      },
                      tooltip: tooltipOpts,
                    }
                  }} />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                    {summary?.totalVendors || 0}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">Total Vendors</p>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default function VendorCard({ title, value, icon: Icon, color, trend, loading }) {
  const colorMap = {
    blue: {
      bg: 'bg-brand-50 dark:bg-brand-500/10',
      icon: 'text-brand-600 dark:text-brand-400',
      border: 'border-brand-100 dark:border-brand-500/20',
      badge: 'bg-brand-600',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-500/20',
      badge: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      icon: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-500/20',
      badge: 'bg-amber-500',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-500/20',
      badge: 'bg-purple-500',
    },
  }

  const c = colorMap[color] || colorMap.blue

  if (loading) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="skeleton w-16 h-5 rounded-full" />
        </div>
        <div className="skeleton w-20 h-8 rounded-lg mb-2" />
        <div className="skeleton w-28 h-4 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="card card-hover p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
            trend >= 0
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-display font-bold text-gray-900 dark:text-white tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      </div>
    </div>
  )
}

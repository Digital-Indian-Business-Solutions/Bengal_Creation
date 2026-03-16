import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, Clock, Package, BarChart3,
  Search, LogOut, X, Sparkles, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/vendors', label: 'Vendors', icon: Users },
  { to: '/pending', label: 'Pending Vendors', icon: Clock },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/search', label: 'Search Vendors', icon: Search },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()

  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    onClose?.()
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display font-700 text-[13px] leading-tight text-gray-900 dark:text-white">Bengal</p>
            <p className="font-display font-700 text-[13px] leading-tight text-brand-600 dark:text-brand-400">Creations</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 font-mono">
          Main Menu
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item group ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800/60">
        <button
          onClick={handleLogout}
          className="nav-item nav-item-inactive w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-[260px] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800/60 shadow-sidebar z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden modal-overlay"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-gray-900 flex flex-col shadow-2xl lg:hidden transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

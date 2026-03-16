import { useState, useRef, useEffect } from 'react'
import { Menu, Sun, Moon, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

const pageTitles = {
  '/': 'Dashboard',
  '/vendors': 'All Vendors',
  '/pending': 'Pending Vendors',
  '/analytics': 'Analytics',
  '/search': 'Search Vendors',
}

function ProfileDropdown({ username, onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    onClose()
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 animate-fade-in">
      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {(username || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate capitalize">
              {username || 'Admin'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">Administrator</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <button
          onClick={onClose}
          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <User className="w-3.5 h-3.5 text-gray-400" />
          Profile
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-gray-400" />
          Settings
        </button>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 py-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function Navbar({ onMenuClick }) {
  const { dark, toggle } = useTheme()
  const { currentUser } = useAuth()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close dropdown on route change
  useEffect(() => { setProfileOpen(false) }, [location.pathname])

  const getTitle = () => {
    const path = location.pathname
    if (path.startsWith('/vendors/') && path.endsWith('/products')) return 'Vendor Products'
    if (path.startsWith('/vendors/') && path !== '/vendors') return 'Vendor Details'
    return pageTitles[path] || 'Dashboard'
  }

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/60 z-20 flex items-center px-4 lg:px-6 gap-4">

      {/* Mobile menu btn */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-lg text-gray-900 dark:text-white truncate">
          {getTitle()}
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono hidden sm:block">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark
            ? <Sun className="w-[18px] h-[18px] text-amber-500" />
            : <Moon className="w-[18px] h-[18px]" />
          }
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        </button>

        {/* Profile button + dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-colors ${
              profileOpen
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(currentUser || 'A')[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block capitalize">
              {currentUser || 'Admin'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 hidden sm:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <ProfileDropdown
              username={currentUser}
              onClose={() => setProfileOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  )
}

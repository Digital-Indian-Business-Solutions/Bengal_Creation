import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, Lock, User, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const { login, loading, error } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [touched, setTouched] = useState({ username: false, password: false })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ username: true, password: true })
    if (!username || !password) return
    const ok = await login(username, password)
    if (ok) navigate(from, { replace: true })
  }

  const fieldErr = (field) => touched[field] && !{ username, password }[field]
    ? `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
    : ''

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/10 dark:bg-brand-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-500/10 dark:bg-accent-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 dark:bg-brand-500/3 blur-3xl" />
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggle}
        className="absolute top-4 right-4 p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 shadow-sm hover:shadow-md transition-all"
        title="Toggle dark mode"
      >
        {dark
          ? <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        }
      </button>

      {/* Card */}
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white tracking-tight">
            Bengal<span className="text-brand-600 dark:text-brand-400">Creations</span>
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Vendor Management Portal</p>
        </div>

        {/* Form card */}
        <div className="card p-6 shadow-card">
          <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Sign in to your admin account</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 font-mono uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, username: true }))}
                  placeholder="Enter username"
                  autoComplete="username"
                  className={`input pl-10 ${fieldErr('username') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                />
              </div>
              {fieldErr('username') && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErr('username')}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 font-mono uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className={`input pl-10 pr-10 ${fieldErr('password') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErr('password') && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErr('password')}
                </p>
              )}
            </div>

            {/* API error */}
            {error && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm mt-2"
            >
              {loading
                ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                )
                : 'Sign in'
              }
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
          Credentials are configured via environment variables.
        </p>
      </div>
    </div>
  )
}

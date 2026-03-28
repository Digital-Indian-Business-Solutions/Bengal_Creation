import { createContext, useContext, useState, useCallback } from 'react'

// ─── env credentials ────────────────────────────────────────────────────────
const ENV_USER = import.meta.env.VITE_ADMIN_USERNAME
const ENV_PASS = import.meta.env.VITE_ADMIN_PASSWORD
const SESSION_KEY = 'bc_session'

// Simple deterministic "token" — not cryptographic, just an opaque string
// that lets us verify the session was started with correct credentials.
function makeSessionToken(username) {
  const secret = import.meta.env.VITE_SESSION_SECRET || 'bc_fallback_secret'
  const payload = `${username}:${secret}:${ENV_USER}`
  // btoa gives a stable base64 string — good enough for an env-gated SPA
  return btoa(payload)
}

function isValidSession(raw) {
  if (!raw) return false
  try {
    const expected = makeSessionToken(ENV_USER)
    return raw === expected
  } catch {
    return false
  }
}

// ─── context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    return isValidSession(stored)
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    return isValidSession(stored) ? ENV_USER : null
  })

  const login = useCallback(async (username, password) => {
    setError('')
    setLoading(true)
    // Simulate slight async delay so the UI feels intentional
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)

    if (username === ENV_USER && password === ENV_PASS) {
      const token = makeSessionToken(username)
      localStorage.setItem(SESSION_KEY, token)
      setAuthed(true)
      setCurrentUser(username)
      return true
    }

    setError('Invalid username or password')
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setCurrentUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ authed, login, logout, error, loading, currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

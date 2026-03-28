import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loginError } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  const inputBase = {
    width: '100%',
    background: 'var(--bg-base)',
    border: '1px solid var(--border2)',
    borderRadius: 9,
    padding: '12px 14px',
    fontSize: 14,
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{ position: 'absolute', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, right: -100, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,91,245,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 54, height: 54,
            background: 'linear-gradient(135deg,#4f8ef7,#7c5bf5)',
            borderRadius: 14, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Mono, monospace', fontWeight: 700,
            fontSize: 18, color: '#fff', marginBottom: 14,
            boxShadow: '0 8px 32px rgba(79,142,247,0.25)',
          }}>BC</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Bengal Creations CRM</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Sign in to your admin dashboard</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '30px 28px',
          boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.7px', display: 'block', marginBottom: 7 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none' }}>✉️</span>
                <input
                  type="email"
                  placeholder="admin@bengalcreations.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
                  style={{ ...inputBase, paddingLeft: 40 }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.7px', display: 'block', marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none' }}>🔒</span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
                  style={{ ...inputBase, paddingLeft: 40, paddingRight: 44 }}
                  autoComplete="current-password"
                  required
                />
                <span
                  onClick={() => setShowPwd((v) => !v)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 15, userSelect: 'none', opacity: .7 }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {/* Error */}
            {loginError && (
              <div style={{
                background: 'rgba(242,87,87,0.1)', border: '1px solid rgba(242,87,87,0.3)',
                borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 9,
              }}>
                <span style={{ fontSize: 15 }}>⚠️</span>
                <div style={{ fontSize: 13, color: 'var(--red)' }}>{loginError}</div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5bf5)',
                color: '#fff', border: 'none', borderRadius: 9,
                padding: '13px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '.3px',
                boxShadow: '0 4px 20px rgba(79,142,247,0.3)',
                transition: 'opacity .15s',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '.88')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              Sign In to Dashboard
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>ADMIN ACCESS ONLY</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text3)' }}>
          Bengal Creations CRM · Credentials set via .env file
        </div>
      </div>
    </div>
  );
}


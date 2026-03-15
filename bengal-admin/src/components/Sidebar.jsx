import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/products', label: 'Products', icon: <BoxIcon /> },
  { to: '/analytics', label: 'Analytics', icon: <ChartIcon /> },
];

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-ink-950/60 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-ink-950 z-30 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-ink-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.5 4.5h4.5l-3.75 2.75 1.5 4.5L12 12l-3.75 2.75 1.5-4.5L6 7.5h4.5L12 3z" />
              </svg>
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm leading-tight">Bengal Creations</div>
              <div className="text-ink-500 text-[10px] uppercase tracking-widest font-mono">Products Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <div className="text-ink-600 text-[10px] uppercase tracking-widest font-mono px-4 mb-2">Navigation</div>
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-ink-800 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-saffron-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">
                {process.env.REACT_APP_ADMIN_USERNAME || 'Admin'}
              </div>
              <div className="text-ink-500 text-[10px]">bengalcreations.in</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-ink-400 hover:bg-crimson-900/40 hover:text-crimson-400 transition-all text-xs font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ search, setSearch, setSidebarOpen, title }) {
  const navigate = useNavigate();
  return (
    <header className="h-14 bg-white border-b border-ink-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-ink-50 text-ink-500"
          onClick={() => setSidebarOpen(o => !o)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-display font-semibold text-ink-900 text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {setSearch !== undefined && (
          <div className="relative hidden sm:block">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9 pr-4 py-1.5 rounded-lg border border-ink-200 text-sm bg-ink-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-400 w-52 transition-all"
            />
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-saffron-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">A</div>
      </div>
    </header>
  );
}

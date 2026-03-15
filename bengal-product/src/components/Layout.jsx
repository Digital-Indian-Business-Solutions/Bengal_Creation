import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toast from './Toast';
import { useProducts } from '../context/ProductsContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useProducts();

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content area — offset by sidebar on large screens */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60 overflow-hidden">
        <Outlet context={{ setSidebarOpen }} />
      </div>

      <Toast toast={toast} />
    </div>
  );
}

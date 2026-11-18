'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';
import { TopNav } from '../../components/TopNav';
import { consumeAuthHandoffFromHash } from '../../lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    consumeAuthHandoffFromHash();
    if (pathname !== '/dashboard/login') {
      const token = localStorage.getItem('convoza_access_token');
      if (!token) {
        window.location.replace('/dashboard/login');
        return;
      }
    }
    setAuthChecked(true);
  }, [pathname]);

  if (pathname === '/dashboard/login') {
    return <>{children}</>;
  }

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Dark Navy Sidebar with mobile drawer support */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

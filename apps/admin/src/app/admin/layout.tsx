'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '../../components/AdminSidebar';
import { ExternalLink, Menu, LogOut, Loader2 } from 'lucide-react';
import { adminFetch } from '../../lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verifiedAdmin, setVerifiedAdmin] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;

    const token = localStorage.getItem('convoza_admin_access_token');
    if (!token) {
      window.location.replace('/admin/login');
      return;
    }

    adminFetch('/auth/me')
      .then((me) => {
        if (!me?.isSuperAdmin) {
          localStorage.removeItem('convoza_admin_access_token');
          localStorage.removeItem('convoza_admin_user');
          window.location.replace('/admin/login');
          return;
        }
        setVerifiedAdmin({ email: me.email, name: me.name });
      })
      .catch(() => {
        window.location.replace('/admin/login');
      });
  }, [pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!verifiedAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 text-xs gap-2 font-semibold">
        <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
        <span>Verifying Super Administrator session...</span>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('convoza_admin_access_token');
    localStorage.removeItem('convoza_admin_refresh_token');
    localStorage.removeItem('convoza_admin_user');
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Header */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle admin navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider truncate max-w-[140px] sm:max-w-none">
                Root System Oversight
              </span>
            </div>

            <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Multi-Tenant Cluster Operational
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/dashboard"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <span>Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-900 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-[10px] text-white shrink-0">
                SA
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-extrabold leading-tight text-white">{verifiedAdmin.email}</div>
                <div className="text-[9px] text-rose-300 font-bold uppercase tracking-wider">Master Root</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out of Root Console"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

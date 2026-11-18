'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '../../components/AdminSidebar';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ExternalLink, Menu, LogOut, Loader2 } from 'lucide-react';
import { adminFetch, adminLogout, getUserDashboardUrl } from '../../lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verifiedAdmin, setVerifiedAdmin] = useState<{ email: string; name: string } | null>(null);
  const [dashboardUrl, setDashboardUrl] = useState('/dashboard');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setDashboardUrl(getUserDashboardUrl());

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
          localStorage.removeItem('convoza_admin_refresh_token');
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs gap-2 font-semibold">
        <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
        <span>Verifying Super Administrator session...</span>
      </div>
    );
  }

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await adminLogout();
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle admin navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider truncate max-w-[140px] sm:max-w-none">
                Root System Control Plane
              </span>
            </div>

            <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Emperor Smart Solutions • Production Control
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle />

            <a
              href={dashboardUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>Open User Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-900 dark:bg-slate-800 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-800 dark:border-slate-700 shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-[10px] text-white shrink-0">
                SA
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-extrabold leading-tight text-white">
                  {verifiedAdmin.email}
                </div>
                <div className="text-[9px] text-rose-300 font-bold uppercase tracking-wider">
                  Super Admin
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign out of Root Console"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

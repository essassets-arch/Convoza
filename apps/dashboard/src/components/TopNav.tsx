'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch, getWebsiteUrl } from '../lib/api';
import {
  Building2,
  ChevronDown,
  Bell,
  LogOut,
  Plus,
  ShieldCheck,
  Check,
  Smartphone,
  ExternalLink,
  Search,
  Sparkles,
  LifeBuoy,
  Menu,
} from 'lucide-react';

interface TopNavProps {
  onToggleSidebar?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [orgName, setOrgName] = useState('Workspace');
  const [primaryPhone, setPrimaryPhone] = useState('Not Connected');
  const [primaryRating, setPrimaryRating] = useState('Connect WABA');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('convoza_access_token');
      setIsAuthenticated(Boolean(token));
      const storedUser = localStorage.getItem('convoza_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedOrgName = localStorage.getItem('convoza_org_name');
      if (storedOrgName) {
        setOrgName(storedOrgName);
      }

      if (token) {
        apiFetch('/auth/me')
          .then((me) => {
            if (me?.name) {
              setUser({ name: me.name, email: me.email });
              localStorage.setItem('convoza_user', JSON.stringify({ id: me.id, name: me.name, email: me.email }));
            }
            const firstMem = me?.memberships?.[0];
            if (firstMem?.organization) {
              setOrgName(firstMem.organization.name);
              localStorage.setItem('convoza_org_id', firstMem.organization.id);
              localStorage.setItem('convoza_org_name', firstMem.organization.name);
            }
          })
          .catch(() => {});

        apiFetch<any[]>('/whatsapp/accounts')
          .then((accounts) => {
            const list = Array.isArray(accounts) ? accounts : [];
            const firstPhone = list.flatMap((a: any) => a?.phoneNumbers || [])[0];
            if (firstPhone) {
              setPrimaryPhone(firstPhone.displayPhoneNumber);
              setPrimaryRating(`${firstPhone.qualityRating || 'GREEN'} (${firstPhone.messagingLimitTier || 'TIER_1K'})`);
            } else {
              setPrimaryPhone('No Active Number');
              setPrimaryRating('Setup WABA');
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/dashboard/login';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Sidebar Hamburger + Org Switcher & Live WhatsApp Number */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Org Selector Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-slate-100 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-tight truncate max-w-[100px] sm:max-w-[180px]">
            {orgName}
          </span>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
            PRO
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>

        {/* Live WABA Number Status */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-200/80 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-950">{primaryPhone}</span>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
            {primaryRating}
          </span>
        </div>
      </div>

      {/* Right Controls: Docs, New Broadcast, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!isAuthenticated && (
          <Link
            href="/dashboard/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Sign In
          </Link>
        )}
        <a
          href={`${getWebsiteUrl()}/api-docs`}
          target="_blank"
          rel="noreferrer"
          className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <LifeBuoy className="w-3.5 h-3.5 text-slate-400" />
          <span>API Docs</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* Action Button */}
        <Link
          href="/dashboard/campaigns?new=true"
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">New Broadcast</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-900">Campaign Completed</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    "Weekend VIP Flash Sale" reached 489/500 recipients with 98.6% delivery.
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">10 mins ago</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-900">Meta Template Approved</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    "order_confirmation_v1" approved by Meta Graph API.
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">1 hour ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AV'}
            </div>
            <div className="text-left hidden md:block pr-1">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {user?.name || 'Alex Vance'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Owner • Apex Retail</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                <div className="text-xs font-bold text-slate-900">{user?.name || 'Alex Vance'}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email || 'alex@apexretail.com'}</div>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Organization Owner
                </span>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="block px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Team & Organization Settings
              </Link>
              <Link
                href="/dashboard/billing"
                onClick={() => setProfileOpen(false)}
                className="block px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Subscription & Quota
              </Link>
              <Link
                href="/dashboard/whatsapp"
                onClick={() => setProfileOpen(false)}
                className="block px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Manage WABA Phone Numbers
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

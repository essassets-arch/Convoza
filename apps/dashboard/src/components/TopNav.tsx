'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch, getWebsiteUrl } from '../lib/api';
import { ThemeToggle } from './ThemeToggle';
import {
  Building2,
  ChevronDown,
  Bell,
  LogOut,
  Plus,
  Check,
  ExternalLink,
  LifeBuoy,
  Menu,
  Loader2,
  Inbox,
} from 'lucide-react';

interface TopNavProps {
  onToggleSidebar?: () => void;
}

interface OrgMembershipItem {
  membershipId: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug?: string;
    subscription?: {
      plan?: {
        tier?: string;
        name?: string;
      };
    };
  };
}

function formatRoleLabel(role?: string): string {
  switch (role) {
    case 'ORG_OWNER':
      return 'Workspace Owner';
    case 'ORG_ADMIN':
      return 'Administrator';
    case 'MANAGER':
      return 'Manager';
    case 'AGENT':
      return 'Support Agent';
    case 'VIEWER':
      return 'Viewer';
    case 'SUPER_ADMIN':
      return 'Super Admin';
    default:
      return 'Team Member';
  }
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id?: string; name: string; email: string } | null>(null);
  const [orgId, setOrgId] = useState<string>('');
  const [orgName, setOrgName] = useState('Workspace');
  const [userRole, setUserRole] = useState<string>('ORG_OWNER');
  const [planTier, setPlanTier] = useState<string>('');
  const [orgs, setOrgs] = useState<OrgMembershipItem[]>([]);

  const [hasConnectedPhone, setHasConnectedPhone] = useState(false);
  const [primaryPhone, setPrimaryPhone] = useState('No Active Number');
  const [primaryRating, setPrimaryRating] = useState('Setup WABA');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [showNewOrgInput, setShowNewOrgInput] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [orgError, setOrgError] = useState<string | null>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOrgMenuOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem('convoza_access_token');
      setIsAuthenticated(Boolean(token));

      const storedUser = localStorage.getItem('convoza_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedOrgId = localStorage.getItem('convoza_org_id') || '';
      const storedOrgName = localStorage.getItem('convoza_org_name');
      if (storedOrgId) setOrgId(storedOrgId);
      if (storedOrgName) setOrgName(storedOrgName);

      if (!token) return;

      Promise.allSettled([
        apiFetch<any>('/auth/me'),
        apiFetch<OrgMembershipItem[]>('/organizations'),
        apiFetch<any[]>('/whatsapp/accounts'),
        apiFetch<{ items?: any[] }>('/inbox/conversations?page=1&limit=5'),
      ]).then(([meRes, orgsRes, accsRes, inboxRes]) => {
        const currentStoredOrgId = localStorage.getItem('convoza_org_id') || '';

        if (meRes.status === 'fulfilled' && meRes.value) {
          const me = meRes.value;
          if (me.name) {
            const nextUser = { id: me.id, name: me.name, email: me.email };
            setUser(nextUser);
            localStorage.setItem('convoza_user', JSON.stringify(nextUser));
          }
          const memberships: any[] = Array.isArray(me.memberships) ? me.memberships : [];
          const activeMem =
            memberships.find((m) => m.organization?.id === currentStoredOrgId) || memberships[0];
          if (activeMem?.organization) {
            setOrgId(activeMem.organization.id);
            setOrgName(activeMem.organization.name);
            setUserRole(activeMem.role || 'ORG_OWNER');
            const subTier = activeMem.organization.subscription?.plan?.tier;
            if (subTier) setPlanTier(String(subTier).toUpperCase());
            localStorage.setItem('convoza_org_id', activeMem.organization.id);
            localStorage.setItem('convoza_org_name', activeMem.organization.name);
          }
        }

        if (orgsRes.status === 'fulfilled' && Array.isArray(orgsRes.value)) {
          setOrgs(orgsRes.value);
          const currentId = localStorage.getItem('convoza_org_id') || '';
          const matched = orgsRes.value.find((o) => o.organization?.id === currentId) || orgsRes.value[0];
          if (matched?.organization) {
            setOrgId(matched.organization.id);
            setOrgName(matched.organization.name);
            setUserRole(matched.role || 'ORG_OWNER');
            const tier = matched.organization.subscription?.plan?.tier;
            if (tier) setPlanTier(String(tier).toUpperCase());
          }
        }

        if (accsRes.status === 'fulfilled') {
          const list = Array.isArray(accsRes.value) ? accsRes.value : [];
          const firstPhone = list.flatMap((a: any) => a?.phoneNumbers || [])[0];
          if (firstPhone) {
            setHasConnectedPhone(true);
            setPrimaryPhone(firstPhone.displayPhoneNumber);
            setPrimaryRating(
              `${firstPhone.qualityRating || 'GREEN'} (${firstPhone.messagingLimitTier || 'TIER_1K'})`
            );
          } else {
            setHasConnectedPhone(false);
            setPrimaryPhone('No Active Number');
            setPrimaryRating('Setup WABA');
          }
        }

        if (inboxRes.status === 'fulfilled') {
          const raw = Array.isArray(inboxRes.value)
            ? inboxRes.value
            : Array.isArray(inboxRes.value?.items)
              ? inboxRes.value.items
              : [];
          setLiveAlerts(raw);
        }
      });
    } catch {}
  }, [pathname]);

  const handleSwitchOrg = (target: OrgMembershipItem) => {
    localStorage.setItem('convoza_org_id', target.organization.id);
    localStorage.setItem('convoza_org_name', target.organization.name);
    setOrgMenuOpen(false);
    window.location.reload();
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreatingOrg(true);
    setOrgError(null);
    try {
      const res = await apiFetch<any>('/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: newOrgName.trim() }),
      });
      const createdOrg = res?.organization || res;
      if (createdOrg?.id) {
        localStorage.setItem('convoza_org_id', createdOrg.id);
        localStorage.setItem('convoza_org_name', createdOrg.name);
        window.location.reload();
      }
    } catch (err: any) {
      setOrgError(err.message || 'Failed to create workspace');
      setCreatingOrg(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('convoza_refresh_token') || '';
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    } finally {
      const savedTheme = localStorage.getItem('convoza_theme');
      localStorage.clear();
      if (savedTheme) {
        localStorage.setItem('convoza_theme', savedTheme);
      }
      window.location.href = '/dashboard/login';
    }
  };

  const unreadTotal = liveAlerts.reduce((acc, c) => acc + Number(c?.unreadCount || 0), 0);
  const unreadConversations = liveAlerts.filter((c) => Number(c?.unreadCount || 0) > 0);
  const roleLabel = formatRoleLabel(userRole);

  return (
    <header
      ref={navRef}
      className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs"
    >
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

        {/* Organization Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOrgMenuOpen(!orgMenuOpen);
              setNotificationsOpen(false);
              setProfileOpen(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-slate-100 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight truncate max-w-[100px] sm:max-w-[180px]">
              {orgName}
            </span>
            {planTier && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                {planTier}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {orgMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 space-y-2">
              <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Switch Workspace ({orgs.length || 1})
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1">
                {orgs.map((item) => {
                  const isCurrent = item.organization.id === orgId;
                  const tier = item.organization.subscription?.plan?.tier;
                  return (
                    <button
                      key={item.organization.id}
                      type="button"
                      onClick={() => handleSwitchOrg(item)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                          : 'hover:bg-slate-100 text-slate-700 font-semibold'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate">{item.organization.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {formatRoleLabel(item.role)}
                          {tier ? ` • ${tier}` : ''}
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-2">
                {!showNewOrgInput ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewOrgInput(true);
                      setOrgError(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Workspace</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateWorkspace} className="space-y-2 p-1.5">
                    <input
                      type="text"
                      required
                      autoFocus
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Workspace / Brand name..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {orgError && <p className="text-[11px] text-rose-600 font-medium">{orgError}</p>}
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewOrgInput(false);
                          setNewOrgName('');
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creatingOrg || !newOrgName.trim()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold disabled:opacity-50"
                      >
                        {creatingOrg && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Create</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live WABA Number Status */}
        <Link
          href="/dashboard/whatsapp"
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-colors ${
            hasConnectedPhone
              ? 'bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-50'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              hasConnectedPhone ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className={`font-bold ${hasConnectedPhone ? 'text-emerald-950' : 'text-slate-700'}`}>
            {primaryPhone}
          </span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              hasConnectedPhone ? 'text-emerald-700 bg-emerald-100/60' : 'text-slate-500 bg-slate-100'
            }`}
          >
            {primaryRating}
          </span>
        </Link>
      </div>

      {/* Right Controls: Docs, New Broadcast, ThemeToggle, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5">
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

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />

        {/* Live Activity Bell Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setOrgMenuOpen(false);
              setProfileOpen(false);
            }}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors relative cursor-pointer"
            aria-label="Workspace alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadTotal > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">Live Activity Alerts</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    unreadTotal > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                  }`}
                >
                  {unreadTotal > 0 ? `${unreadTotal} Unread` : 'All Clear'}
                </span>
              </div>

              {unreadConversations.length === 0 ? (
                <div className="py-6 px-3 text-center space-y-2">
                  <Inbox className="w-7 h-7 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">No unread alerts</div>
                  <p className="text-[11px] text-slate-400">
                    Incoming WhatsApp customer messages will appear here in real time.
                  </p>
                  {liveAlerts.length > 0 && (
                    <Link
                      href="/dashboard/inbox"
                      onClick={() => setNotificationsOpen(false)}
                      className="inline-block pt-1 text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      View {liveAlerts.length} recent conversation(s) →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                  {unreadConversations.map((conv) => (
                    <Link
                      key={conv.id}
                      href="/dashboard/inbox"
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {conv.contact?.name || conv.contact?.phone || 'WhatsApp Customer'}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
                          {conv.unreadCount} new
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {conv.lastMessagePreview || 'New inbound message'}
                      </div>
                      {conv.lastMessageAt && (
                        <div className="text-[9px] text-slate-400 mt-1">
                          {new Date(conv.lastMessageAt).toLocaleString()}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setOrgMenuOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {getInitials(user?.name)}
            </div>
            <div className="text-left hidden md:block pr-1 max-w-[150px]">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                {user?.name || 'Workspace User'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate">
                {roleLabel} • {orgName}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || 'Workspace User'}
                </div>
                {user?.email && (
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                )}
                <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {roleLabel}
                </span>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="block px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Account, Team & API Settings
              </Link>
              <Link
                href="/dashboard/billing"
                onClick={() => setProfileOpen(false)}
                className="block px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Billing, Wallet & Quota
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
                type="button"
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
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

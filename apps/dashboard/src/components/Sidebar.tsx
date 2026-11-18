'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WhatsAppIcon } from '@convoza/ui';
import { apiFetch } from '../lib/api';
import {
  LayoutDashboard,
  Smartphone,
  FileCode2,
  Users2,
  Send,
  Flame,
  Inbox,
  Bot,
  BarChart3,
  CreditCard,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const [orgName, setOrgName] = useState('Workspace');
  const [hasConnectedPhone, setHasConnectedPhone] = useState(false);
  const [connectedCount, setConnectedCount] = useState(0);
  const [phoneDisplay, setPhoneDisplay] = useState('No Active Number');
  const [phoneTier, setPhoneTier] = useState('Connect Official WABA');
  const [openConversations, setOpenConversations] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [planTier, setPlanTier] = useState<string>('');

  useEffect(() => {
    try {
      const storedOrg = localStorage.getItem('convoza_org_name');
      if (storedOrg) setOrgName(storedOrg);
      const token = localStorage.getItem('convoza_access_token');
      if (!token) return;

      Promise.allSettled([
        apiFetch<any[]>('/whatsapp/accounts'),
        apiFetch<any>('/analytics/dashboard'),
        apiFetch<any>('/billing/usage'),
      ]).then(([accOutcome, dashOutcome, usageOutcome]) => {
        if (accOutcome.status === 'fulfilled') {
          const list = Array.isArray(accOutcome.value) ? accOutcome.value : [];
          const phones = list.flatMap((a: any) => a?.phoneNumbers || []);
          setConnectedCount(phones.length);
          const p = phones[0];
          if (p) {
            setHasConnectedPhone(true);
            setPhoneDisplay(p.displayPhoneNumber);
            setPhoneTier(`Meta ${p.messagingLimitTier || 'TIER_1K'} (${p.qualityRating || 'GREEN'})`);
          } else {
            setHasConnectedPhone(false);
            setPhoneDisplay('No Active Number');
            setPhoneTier('Connect Official WABA');
          }
        }

        if (dashOutcome.status === 'fulfilled' && dashOutcome.value) {
          const d = dashOutcome.value;
          setOpenConversations(Number(d.openConversations ?? 0));
          setActiveCampaigns(Number(d.activeCampaigns ?? 0));
        }

        if (usageOutcome.status === 'fulfilled' && usageOutcome.value) {
          const u = usageOutcome.value;
          if (u.tier) {
            setPlanTier(String(u.tier).toUpperCase());
          }
        }
      });
    } catch {}
  }, [pathname]);

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        {
          name: 'WhatsApp Numbers',
          href: '/dashboard/whatsapp',
          icon: Smartphone,
          badge: connectedCount > 0 ? `${connectedCount} Live` : undefined,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
      ],
    },
    {
      title: 'BROADCAST & INBOX',
      items: [
        {
          name: 'Shared Team Inbox',
          href: '/dashboard/inbox',
          icon: Inbox,
          badge: openConversations > 0 ? `${openConversations} Open` : undefined,
          badgeColor: 'bg-emerald-500 text-slate-950 font-bold border-emerald-400',
        },
        {
          name: 'Bulk Campaigns',
          href: '/dashboard/campaigns',
          icon: Flame,
          badge: activeCampaigns > 0 ? `${activeCampaigns} Active` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        { name: 'Single Message', href: '/dashboard/messages', icon: Send },
        {
          name: 'Template Builder',
          href: '/dashboard/templates',
          icon: FileCode2,
          badge: 'Meta Sync',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        },
        { name: 'Contacts & Lists', href: '/dashboard/contacts', icon: Users2 },
      ],
    },
    {
      title: 'AUTOMATION & DATA',
      items: [
        { name: 'Automations & Bots', href: '/dashboard/automations', icon: Bot },
        { name: 'Analytics & Reports', href: '/dashboard/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'ORGANIZATION',
      items: [
        {
          name: 'Billing & Quota',
          href: '/dashboard/billing',
          icon: CreditCard,
          badge: planTier || undefined,
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        },
        { name: 'Team & API Settings', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 text-slate-300 select-none shadow-2xl lg:shadow-xl transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/60 sticky top-0 backdrop-blur z-10">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <WhatsAppIcon className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-white font-sans">CONVOZA</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Cloud API
                  </span>
                </div>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wide truncate max-w-[140px]">
                  {orgName}
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="p-3 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 tracking-wider">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                            item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info & Quality Tier Pill */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          <Link
            href="/dashboard/whatsapp"
            onClick={onClose}
            className="flex items-center justify-between text-xs bg-slate-900/90 hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  hasConnectedPhone ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <div className="leading-none min-w-0">
                <span className="text-[11px] font-bold text-slate-200 block truncate">{phoneDisplay}</span>
                <span
                  className={`text-[9px] font-medium block mt-0.5 truncate ${
                    hasConnectedPhone ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {phoneTier}
                </span>
              </div>
            </div>
            <ShieldCheck
              className={`w-4 h-4 shrink-0 ${hasConnectedPhone ? 'text-emerald-400' : 'text-slate-500'}`}
            />
          </Link>

          <div className="flex items-center justify-between px-1 text-[10px] text-slate-500">
            <span>Cloud API v20.0 • Live</span>
            <span className="text-emerald-400/80 flex items-center gap-1 font-medium">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasConnectedPhone ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              {hasConnectedPhone ? 'Connected' : 'Standby'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

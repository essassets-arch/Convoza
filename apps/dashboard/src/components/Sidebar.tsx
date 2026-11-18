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
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'WhatsApp Numbers', href: '/dashboard/whatsapp', icon: Smartphone, badge: 'Live', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    ],
  },
  {
    title: 'BROADCAST & INBOX',
    items: [
      { name: 'Shared Team Inbox', href: '/dashboard/inbox', icon: Inbox, badge: '2 Open', badgeColor: 'bg-emerald-500 text-slate-950 font-bold' },
      { name: 'Bulk Campaigns', href: '/dashboard/campaigns', icon: Flame, badge: 'Active', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
      { name: 'Single Message', href: '/dashboard/messages', icon: Send },
      { name: 'Template Builder', href: '/dashboard/templates', icon: FileCode2, badge: 'Meta Sync', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
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
      { name: 'Billing & Quota', href: '/dashboard/billing', icon: CreditCard, badge: 'Growth', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      { name: 'Team & API Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const [orgName, setOrgName] = useState('Workspace');
  const [phoneDisplay, setPhoneDisplay] = useState('Not Connected');
  const [phoneTier, setPhoneTier] = useState('Connect Official WABA');

  useEffect(() => {
    try {
      const storedOrg = localStorage.getItem('convoza_org_name');
      if (storedOrg) setOrgName(storedOrg);
      const token = localStorage.getItem('convoza_access_token');
      if (token) {
        apiFetch<any[]>('/whatsapp/accounts')
          .then((accounts) => {
            const list = Array.isArray(accounts) ? accounts : [];
            const p = list.flatMap((a: any) => a?.phoneNumbers || [])[0];
            if (p) {
              setPhoneDisplay(p.displayPhoneNumber);
              setPhoneTier(`Meta ${p.messagingLimitTier || 'TIER_1K'} (${p.qualityRating || 'GREEN'})`);
            } else {
              setPhoneDisplay('No Active Number');
              setPhoneTier('Connect Official WABA');
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [pathname]);

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
          <div className="flex items-center justify-between text-xs bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="leading-none">
                <span className="text-[11px] font-bold text-slate-200 block">{phoneDisplay}</span>
                <span className="text-[9px] text-emerald-400 font-medium">{phoneTier}</span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] text-slate-500">
            <span>Meta Cloud API v20.0</span>
            <span className="text-emerald-400/80 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 99.99% Up
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

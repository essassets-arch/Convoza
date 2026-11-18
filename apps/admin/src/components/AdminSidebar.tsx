'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Smartphone,
  FileText,
  IndianRupee,
  Cpu,
  ShieldAlert,
  Server,
  ShieldCheck,
  X,
} from 'lucide-react';
import { adminFetch } from '../lib/api';

interface LiveSidebarSummary {
  totalOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  onlineSessions: number;
  connectedWhatsAppAccounts: number;
  connectedPhoneNumbers: number;
  templatesTotal: number;
  templatesPending: number;
  failedJobs: number;
  deadLetterJobs: number;
  newInquiriesCount: number;
  hostname: string;
  cpuCores: number;
  loadAvg1m: number;
  usedMemMb: number;
  totalMemMb: number;
  memUsagePercent: number;
}

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const [summary, setSummary] = useState<LiveSidebarSummary | null>(null);

  useEffect(() => {
    let active = true;

    const loadSummary = () => {
      adminFetch('/admin/dashboard')
        .then((d) => {
          if (!active || !d) return;
          setSummary({
            totalOrganizations: d.totalOrganizations ?? 0,
            suspendedOrganizations: d.suspendedOrganizations ?? 0,
            totalUsers: d.totalUsers ?? 0,
            onlineSessions: d.onlineSessions ?? 0,
            connectedWhatsAppAccounts: d.connectedWhatsAppAccounts ?? 0,
            connectedPhoneNumbers: d.connectedPhoneNumbers ?? 0,
            templatesTotal: d.templates?.total ?? 0,
            templatesPending: d.templates?.pending ?? 0,
            failedJobs: d.queueHealth?.failedJobs ?? 0,
            deadLetterJobs: d.queueHealth?.deadLetterJobs ?? 0,
            newInquiriesCount: d.newInquiriesCount ?? 0,
            hostname: d.telemetry?.hostname || 'vps-node',
            cpuCores: d.telemetry?.cpuCores ?? 0,
            loadAvg1m: d.telemetry?.loadAvg1m ?? 0,
            usedMemMb: d.telemetry?.usedMemMb ?? 0,
            totalMemMb: d.telemetry?.totalMemMb ?? 0,
            memUsagePercent: d.telemetry?.memUsagePercent ?? 0,
          });
        })
        .catch(() => {});
    };

    loadSummary();
    const interval = setInterval(loadSummary, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pathname]);

  const queueIssues = (summary?.failedJobs ?? 0) + (summary?.deadLetterJobs ?? 0);

  const navSections = [
    {
      title: 'EXECUTIVE TELEMETRY',
      items: [
        {
          name: 'Command Center',
          href: '/admin',
          icon: LayoutDashboard,
          badge: summary ? 'Live' : undefined,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
      ],
    },
    {
      title: 'TENANTS & WHATSAPP CLOUD',
      items: [
        {
          name: 'Organizations & Costs',
          href: '/admin/organizations',
          icon: Building2,
          badge: summary ? String(summary.totalOrganizations) : undefined,
          badgeColor:
            summary && summary.suspendedOrganizations > 0
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700',
        },
        {
          name: 'Users & Live Sessions',
          href: '/admin/users',
          icon: Users,
          badge: summary
            ? summary.onlineSessions > 0
              ? `${summary.onlineSessions} live`
              : String(summary.totalUsers)
            : undefined,
          badgeColor:
            summary && summary.onlineSessions > 0
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700',
        },
        {
          name: 'Global WABAs & Numbers',
          href: '/admin/whatsapp',
          icon: Smartphone,
          badge: summary ? String(summary.connectedPhoneNumbers) : undefined,
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        },
        {
          name: 'Templates Monitor',
          href: '/admin/templates',
          icon: FileText,
          badge: summary
            ? summary.templatesPending > 0
              ? `${summary.templatesPending} pend`
              : String(summary.templatesTotal)
            : undefined,
          badgeColor:
            summary && summary.templatesPending > 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700',
        },
      ],
    },
    {
      title: 'MONETIZATION & INFRA',
      items: [
        {
          name: 'Billing, Wallets & Rates',
          href: '/admin/billing',
          icon: IndianRupee,
        },
        {
          name: 'Resource & Queue Manager',
          href: '/admin/system',
          icon: Cpu,
          badge: summary
            ? queueIssues > 0
              ? `${queueIssues} err`
              : summary.newInquiriesCount > 0
              ? `${summary.newInquiriesCount} msg`
              : `${summary.memUsagePercent}%`
            : undefined,
          badgeColor:
            queueIssues > 0
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : summary && summary.newInquiriesCount > 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          name: 'Security Audit Logs',
          href: '/admin/audit-logs',
          icon: ShieldAlert,
        },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/90 flex flex-col justify-between shrink-0 text-slate-300 select-none shadow-2xl lg:shadow-xl transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/90 bg-slate-950/80 sticky top-0 backdrop-blur z-10">
            <Link href="/admin" onClick={onClose} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/25 group-hover:scale-105 transition-transform duration-200">
                <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-white font-sans">
                    CONVOZA
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
                    ROOT
                  </span>
                </div>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Super Admin Control
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="p-3 space-y-5">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 tracking-wider">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-600/30 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-400'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold shrink-0 ml-1.5 ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
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

        {/* Live VPS Host Footer */}
        <div className="p-3.5 border-t border-slate-800/90 bg-slate-950/90 space-y-2.5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-rose-400" /> Host Telemetry
              </span>
              <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {summary ? `${summary.cpuCores} vCPU` : 'Syncing'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span>CPU Load (1m)</span>
              <span className="font-bold text-emerald-400">
                {summary ? summary.loadAvg1m.toFixed(2) : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span>RAM Usage</span>
              <span className="font-bold text-sky-400">
                {summary
                  ? `${(summary.usedMemMb / 1024).toFixed(1)}/${(summary.totalMemMb / 1024).toFixed(1)} GB`
                  : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-medium">
            <span className="truncate max-w-[145px]" title={summary?.hostname || 'Resolving host'}>
              Host: {summary?.hostname || 'connecting...'}
            </span>
            <span className="text-emerald-400/90 flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> RBAC
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

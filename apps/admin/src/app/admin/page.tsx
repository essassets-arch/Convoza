'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { adminFetch } from '../../lib/api';
import {
  Users,
  Building2,
  Smartphone,
  FileText,
  IndianRupee,
  ShieldCheck,
  Server,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Wallet,
  Cpu,
  Activity,
  MessageSquare,
  Layers,
} from 'lucide-react';

interface DashboardData {
  totalUsers: number;
  activeUsers24h: number;
  onlineSessions: number;
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  activeSubscriptions: number;
  connectedWhatsAppAccounts: number;
  connectedPhoneNumbers: number;
  totalMessages: number;
  totalMessagesSent: number;
  inboundMessagesCount: number;
  deliveredMessages: number;
  readMessages: number;
  failedMessages: number;
  deliveryRate: number;
  activeCampaigns: number;
  templates: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  financials: {
    mrrInr: number;
    totalPaymentsCollectedInr: number;
    totalWalletFloatInr: number;
    metaWholesale30dInr: number;
    walletBilled30dInr: number;
    messagingMargin30dInr: number;
    categoryStats: Record<
      string,
      {
        count: number;
        metaCostInr: number;
        billedInr: number;
      }
    >;
  };
  mrrInr: number;
  queueHealth: {
    pendingJobs: number;
    processingJobs: number;
    failedJobs: number;
    deadLetterJobs: number;
  };
  newInquiriesCount: number;
  topTenants: Array<{
    id: string;
    name: string;
    slug: string;
    isSuspended: boolean;
    planName: string;
    planTier: string;
    billingMode: string;
    walletBalanceInr: number;
    phoneNumbersCount: number;
    templatesCount: number;
    contactsCount: number;
    membersCount: number;
    sent30d: number;
    metaCost30dInr: number;
    walletBilled30dInr: number;
  }>;
  telemetry: {
    hostname: string;
    cpuCores: number;
    loadAvg1m: number;
    loadAvg5m: number;
    totalMemMb: number;
    usedMemMb: number;
    freeMemMb: number;
    memUsagePercent: number;
    nodeRssMb: number;
    nodeHeapUsedMb: number;
    processUptimeSeconds: number;
    osUptimeSeconds: number;
  };
}

function formatInr(amount: number, decimals = 2): string {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<DashboardData>('/admin/dashboard');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load platform executive telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(false);
    const interval = setInterval(() => loadDashboard(true), 30000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  if (loading && !data) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin text-rose-600" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Loading Real-Time Executive Command Center...
        </span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
        <div className="text-sm font-bold text-slate-900 dark:text-white">{error}</div>
        <button
          type="button"
          onClick={() => loadDashboard(false)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
        >
          Retry Telemetry Sync
        </button>
      </div>
    );
  }

  if (!data) return null;

  const categories = [
    {
      key: 'MARKETING',
      label: 'Marketing Conversations',
      subtitle: 'Promotions, offers & bulk broadcasts',
      accent: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60',
    },
    {
      key: 'UTILITY',
      label: 'Utility Notifications',
      subtitle: 'Order updates, invoices & dispatch alerts',
      accent: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/60',
    },
    {
      key: 'AUTHENTICATION',
      label: 'Authentication / OTP',
      subtitle: 'One-time passcodes & identity verification',
      accent: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/60',
    },
    {
      key: 'SERVICE',
      label: '24h Free Service Replies',
      subtitle: 'User-initiated 24h session window chats',
      accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60',
    },
  ];

  return (
    <div className="space-y-7 pb-10">
      {/* Executive Command Center Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HOST: {data.telemetry.hostname.toUpperCase()}</span>
              <span className="text-rose-400/50">•</span>
              <span>{data.onlineSessions} LIVE SESSIONS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Executive Platform Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Live multi-tenant unit economics, Meta wholesale cost vs. prepaid wallet margin, template approvals, and VPS resource telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Live</span>
            </button>
            <Link
              href="/admin/organizations"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Manage {data.totalOrganizations} Orgs</span>
            </Link>
            <Link
              href="/admin/billing"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
            >
              <IndianRupee className="w-4 h-4" />
              <span>Rate Cards & Billing</span>
            </Link>
            {data.newInquiriesCount > 0 && (
              <Link
                href="/admin/system#inquiries"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{data.newInquiriesCount} New Leads</span>
              </Link>
            )}
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ROW 1: Financial & Margin Row */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Financials, Unit Economics & Wallet Float
          </h2>
          <Link
            href="/admin/billing"
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <span>Configure Rates & Gateway</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active MRR */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Active SaaS MRR</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatInr(data.financials.mrrInr, 0)}
            </div>
            <div className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{data.activeSubscriptions} active subscriptions</span>
            </div>
          </div>

          {/* 30d Meta Wholesale Cost */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>30d Meta Wholesale Cost</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatInr(data.financials.metaWholesale30dInr)}
            </div>
            <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {data.totalMessagesSent.toLocaleString('en-IN')} outbound • {data.deliveryRate}% delivered
            </div>
          </div>

          {/* 30d Wallet Billed + Net Margin */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>30d Wallet Billed & Margin</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatInr(data.financials.walletBilled30dInr)}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Net Margin:</span>
              <span
                className={`font-extrabold ${
                  data.financials.messagingMargin30dInr >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {data.financials.messagingMargin30dInr >= 0 ? '+' : ''}
                {formatInr(data.financials.messagingMargin30dInr)}
              </span>
            </div>
          </div>

          {/* Total Wallet Float & Collected */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Tenant Wallet Float</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatInr(data.financials.totalWalletFloatInr)}
            </div>
            <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              Payments Collected:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {formatInr(data.financials.totalPaymentsCollectedInr, 0)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Platform Scale Row */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
          Platform Scale, Sessions & WhatsApp Cloud Assets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Organizations */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Organizations</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2.5 text-2xl font-black text-slate-900 dark:text-white">
              {data.activeOrganizations}{' '}
              <span className="text-sm font-semibold text-slate-400">/ {data.totalOrganizations}</span>
            </div>
            <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {data.suspendedOrganizations > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  {data.suspendedOrganizations} suspended
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Zero suspended tenants
                </span>
              )}
            </div>
          </div>

          {/* Registered Users */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Users & Live Sessions</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2.5 text-2xl font-black text-slate-900 dark:text-white">
              {data.totalUsers.toLocaleString('en-IN')}
            </div>
            <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-emerald-600 dark:text-emerald-400">{data.onlineSessions}</strong> live sessions •{' '}
              <strong>{data.activeUsers24h}</strong> active in 24h
            </div>
          </div>

          {/* Connected WABAs & Numbers */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>WABAs & Phone Numbers</span>
              <Smartphone className="w-4 h-4 text-teal-500" />
            </div>
            <div className="mt-2.5 text-2xl font-black text-slate-900 dark:text-white">
              {data.connectedWhatsAppAccounts} WABAs • {data.connectedPhoneNumbers} #s
            </div>
            <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {data.inboundMessagesCount.toLocaleString('en-IN')} inbound • {data.activeCampaigns} active campaigns
            </div>
          </div>

          {/* Templates Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Templates Inventory</span>
              <FileText className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-2.5 text-2xl font-black text-slate-900 dark:text-white">
              {data.templates.total}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">{data.templates.approved} Appr</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-amber-600 dark:text-amber-400">{data.templates.pending} Pend</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-rose-600 dark:text-rose-400">{data.templates.rejected} Rej</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: 30-Day Category Cost Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              30-Day Meta Category Volume & Cost Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Outbound volume, Meta wholesale INR cost, and client wallet billed revenue by Meta conversation category
            </p>
          </div>
          <Link
            href="/admin/templates"
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <span>Inspect Global Templates</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const stat = data.financials.categoryStats?.[cat.key] || {
              count: 0,
              metaCostInr: 0,
              billedInr: 0,
            };
            const margin = Number((stat.billedInr - stat.metaCostInr).toFixed(2));
            return (
              <div
                key={cat.key}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cat.accent}`}>
                    {cat.key}
                  </span>
                  <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                    {stat.count.toLocaleString('en-IN')} msgs
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{cat.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{cat.subtitle}</div>
                </div>
                <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Meta Wholesale:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatInr(stat.metaCostInr)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Wallet Billed:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatInr(stat.billedInr)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Net Margin:</span>
                    <span
                      className={`font-mono font-bold ${
                        margin >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {margin >= 0 ? '+' : ''}
                      {formatInr(margin)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROW 4: Real Top Tenants Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Registered Tenants & 30-Day Cost Ledger
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live organizations ranked by 30-day outbound volume, wallet balance, and Meta wholesale cost
            </p>
          </div>
          <Link
            href="/admin/organizations"
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <span>Open Full Tenant Governance</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.topTenants.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
            No tenant organizations registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Tenant</th>
                  <th className="py-3.5 px-4">Plan</th>
                  <th className="py-3.5 px-4">Billing Mode</th>
                  <th className="py-3.5 px-4">Wallet Balance</th>
                  <th className="py-3.5 px-4">Numbers / Tpls / Contacts</th>
                  <th className="py-3.5 px-4">30d Sent</th>
                  <th className="py-3.5 px-4">30d Meta Cost</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.topTenants.slice(0, 15).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {t.name}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{t.slug}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {t.planName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          t.billingMode === 'PREPAID_WALLET'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        }`}
                      >
                        {t.billingMode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatInr(t.walletBalanceInr)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {t.phoneNumbersCount} # • {t.templatesCount} tpl • {t.contactsCount.toLocaleString('en-IN')} c
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {t.sent30d.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatInr(t.metaCost30dInr)}
                      </div>
                      {t.walletBilled30dInr > 0 && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Billed {formatInr(t.walletBilled30dInr)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {t.isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/admin/organizations?inspect=${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 dark:bg-rose-600 hover:bg-slate-800 dark:hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ROW 5: Live VPS Resource & Outbox Queue Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VPS Host Telemetry */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Live VPS Resource Snapshot
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Host: {data.telemetry.hostname} • OS Uptime: {formatUptime(data.telemetry.osUptimeSeconds)}
                </p>
              </div>
            </div>
            <Link
              href="/admin/system"
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Resource Manager →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase text-slate-400">CPU Cores & Load</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white font-mono">
                {data.telemetry.cpuCores}c • {data.telemetry.loadAvg1m.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500">5m avg: {data.telemetry.loadAvg5m.toFixed(2)}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase text-slate-400">Host OS Memory</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white font-mono">
                {data.telemetry.memUsagePercent}%
              </div>
              <div className="text-[10px] text-slate-500">
                {data.telemetry.usedMemMb} / {data.telemetry.totalMemMb} MB
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase text-slate-400">API Node RSS</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white font-mono">
                {data.telemetry.nodeRssMb} MB
              </div>
              <div className="text-[10px] text-slate-500">Heap: {data.telemetry.nodeHeapUsedMb} MB</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>OS Memory Pressure</span>
              <span>{data.telemetry.freeMemMb} MB Free</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  data.telemetry.memUsagePercent > 85
                    ? 'bg-rose-500'
                    : data.telemetry.memUsagePercent > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, data.telemetry.memUsagePercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Outbox Queue Counters */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  PostgreSQL Transactional Outbox Queue
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SKIP LOCKED dispatch engine • Process Uptime: {formatUptime(data.telemetry.processUptimeSeconds)}
                </p>
              </div>
            </div>
            <Link
              href="/admin/system"
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Manage Queue →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Pending</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
                {data.queueHealth.pendingJobs}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block">
                Processing
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block font-mono">
                {data.queueHealth.processingJobs}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Failed</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block font-mono">
                {data.queueHealth.failedJobs}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60">
              <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block">
                Dead Letter
              </span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block font-mono">
                {data.queueHealth.deadLetterJobs}
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Automatic wallet refund active on terminal Meta rejection</span>
            </span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {data.failedMessages} failed msgs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

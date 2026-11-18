'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCircle2,
  Eye,
  Flame,
  Plus,
  ArrowUpRight,
  Smartphone,
  FileCode2,
  Inbox,
  Sparkles,
  Bot,
  Loader2,
  RefreshCw,
  IndianRupee,
} from 'lucide-react';
import { WhatsAppIcon } from '@convoza/ui';
import { apiFetch } from '../../lib/api';

interface OverviewCampaign {
  id: string;
  name: string;
  status: string;
  sent: number;
  total: number;
  delivered: number;
  read: number;
  replied: number;
  date: string;
  category: string;
}

export default function DashboardOverviewPage() {
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalMessages: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    replyCount: 0,
    failedCount: 0,
    deliveryRate: 0,
    readRate: 0,
    replyRate: 0,
    activeCampaigns: 0,
    openConversations: 0,
    active24hChats: 0,
    approvedTemplates: 0,
    totalContacts: 0,
    metaEstimatedInr: 0,
    walletChargedInr: 0,
    quotaUsed: 0,
    quotaTotal: 0,
    quotaPercentage: 0,
    planName: 'Starter Plan',
  });

  const [primaryAsset, setPrimaryAsset] = useState<{
    wabaName: string;
    displayPhoneNumber: string;
    verifiedName: string;
    phoneNumberId: string;
    qualityRating: string;
    messagingLimitTier: string;
    webhookSubscribed: boolean;
  } | null>(null);

  const [campaigns, setCampaigns] = useState<OverviewCampaign[]>([]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('convoza_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) setUserName(parsed.name);
      }

      const token = localStorage.getItem('convoza_access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const [dashRes, usageRes, accsRes, campsRes, meRes] = await Promise.allSettled([
        apiFetch<any>('/analytics/dashboard'),
        apiFetch<any>('/billing/usage'),
        apiFetch<any[]>('/whatsapp/accounts'),
        apiFetch<{ items?: any[] }>('/campaigns?page=1&limit=5'),
        !storedUser ? apiFetch<any>('/auth/me') : Promise.resolve(null),
      ]);

      if (meRes.status === 'fulfilled' && meRes.value?.name) {
        setUserName(meRes.value.name);
      }

      const d = dashRes.status === 'fulfilled' ? dashRes.value : null;
      const u = usageRes.status === 'fulfilled' ? usageRes.value : null;

      setMetrics({
        totalMessages: Number(d?.totalMessages ?? 0),
        sentCount: Number(d?.sentCount ?? 0),
        deliveredCount: Number(d?.deliveredCount ?? 0),
        readCount: Number(d?.readCount ?? 0),
        replyCount: Number(d?.replyCount ?? 0),
        failedCount: Number(d?.failedCount ?? 0),
        deliveryRate: Number(d?.rates?.deliveryRate ?? 0),
        readRate: Number(d?.rates?.readRate ?? 0),
        replyRate: Number(d?.rates?.replyRate ?? 0),
        activeCampaigns: Number(d?.activeCampaigns ?? 0),
        openConversations: Number(d?.openConversations ?? 0),
        active24hChats: Number(d?.active24hChats ?? 0),
        approvedTemplates: Number(d?.approvedTemplates ?? 0),
        totalContacts: Number(d?.totalContacts ?? 0),
        metaEstimatedInr: Number(d?.monthlyCost?.metaEstimatedInr ?? 0),
        walletChargedInr: Number(d?.monthlyCost?.walletChargedInr ?? 0),
        quotaUsed: Number(u?.messagesSent?.used ?? 0),
        quotaTotal: Number(u?.messagesSent?.limit ?? 0),
        quotaPercentage: Number(u?.messagesSent?.percentage ?? 0),
        planName: u?.plan || 'Starter Plan',
      });

      if (accsRes.status === 'fulfilled' && Array.isArray(accsRes.value)) {
        const firstAccWithPhone = accsRes.value.find((a) => Array.isArray(a.phoneNumbers) && a.phoneNumbers.length > 0);
        const pn = firstAccWithPhone?.phoneNumbers?.[0];
        if (pn) {
          setPrimaryAsset({
            wabaName: firstAccWithPhone.name || pn.verifiedName || 'Official WABA',
            displayPhoneNumber: pn.displayPhoneNumber,
            verifiedName: pn.verifiedName || firstAccWithPhone.name || 'Verified Business',
            phoneNumberId: pn.phoneNumberId,
            qualityRating: pn.qualityRating || 'GREEN',
            messagingLimitTier: pn.messagingLimitTier || 'TIER_1K',
            webhookSubscribed: Boolean(firstAccWithPhone.webhookSubscribed ?? true),
          });
        } else {
          setPrimaryAsset(null);
        }
      }

      if (campsRes.status === 'fulfilled') {
        const rawItems = Array.isArray(campsRes.value)
          ? campsRes.value
          : Array.isArray(campsRes.value?.items)
            ? campsRes.value.items
            : [];
        setCampaigns(
          rawItems.map((c: any) => ({
            id: c.id,
            name: c.name,
            status: c.status || 'DRAFT',
            sent: Number(c.sentCount ?? 0),
            total: Number(c.totalRecipients ?? 0),
            delivered: Number(c.deliveredCount ?? 0),
            read: Number(c.readCount ?? 0),
            replied: Number(c.repliedCount ?? 0),
            date: c.scheduledAt
              ? new Date(c.scheduledAt).toLocaleString()
              : c.createdAt
                ? new Date(c.createdAt).toLocaleString()
                : '—',
            category: c.template?.category || 'UTILITY',
          }))
        );
      }
    } catch {
      // Unauthenticated or transient error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
              <span
                className={`w-2 h-2 rounded-full ${
                  primaryAsset ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              OFFICIAL META CLOUD API v20.0 • {primaryAsset ? 'LIVE CONNECTED' : 'READY FOR WABA'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back{userName ? `, ${userName}` : ''} 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              {primaryAsset ? (
                <>
                  Connected sender <span className="text-emerald-400 font-bold">{primaryAsset.displayPhoneNumber}</span>{' '}
                  is live with <span className="text-emerald-400 font-bold">{metrics.deliveryRate}% delivery</span> and{' '}
                  <span className="text-white font-semibold">{metrics.openConversations} open inbox conversation(s)</span>.
                </>
              ) : (
                <>
                  Your workspace is provisioned on Official Meta Cloud API v20.0. Connect your WhatsApp Business Account
                  (WABA) to start dispatching live templates and receiving customer webhooks.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={loadOverview}
              title="Refresh live telemetry"
              className="inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/dashboard/campaigns?new=true"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Launch Campaign
            </Link>
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur transition-all"
            >
              <Send className="w-4 h-4" /> Send Message
            </Link>
            <Link
              href="/dashboard/inbox"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl transition-all"
            >
              <Inbox className="w-4 h-4" /> Open Shared Inbox
            </Link>
          </div>
        </div>

        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Messages & Monthly Quota */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Messages Processed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalMessages.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {metrics.planName}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Monthly Quota</span>
            <span className="font-semibold text-slate-700">
              {metrics.quotaUsed.toLocaleString()} / {metrics.quotaTotal.toLocaleString()} ({metrics.quotaPercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, metrics.quotaPercentage)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Delivery Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.deliveryRate}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {metrics.deliveredCount.toLocaleString()} delivered
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Quality Rating</span>
            <span className="font-bold text-emerald-600">
              {primaryAsset ? primaryAsset.qualityRating : '—'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, metrics.deliveryRate)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Read Rate & Monthly Meta Cost */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Read / Open Rate</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.readRate}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              {metrics.readCount.toLocaleString()} read
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <IndianRupee className="w-3 h-3" /> Est. Meta Cost (MTD)
            </span>
            <span className="font-bold text-slate-800">
              ₹{metrics.metaEstimatedInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-sky-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, metrics.readRate)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Customer Direct Replies & 24h Window */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Direct Replies</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.replyRate}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {metrics.replyCount.toLocaleString()} inbound
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Live 24h Window Chats</span>
            <span className="font-bold text-slate-800">{metrics.active24hChats} open</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, metrics.replyRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Connected WABA Card & Operations Quick Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WABA Phone Card (Real Asset OR Empty State CTA) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          {primaryAsset ? (
            <>
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
                      <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Primary Phone Asset
                    </h3>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 font-bold">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
                        {primaryAsset.displayPhoneNumber}
                      </h2>
                      <svg className="w-4 h-4 text-emerald-500 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 truncate">
                      {primaryAsset.verifiedName} • WABA Verified
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      Phone ID: {primaryAsset.phoneNumberId}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-2.5 text-xs border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Quality Rating:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      {primaryAsset.qualityRating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Messaging Limit Tier:</span>
                    <span className="font-bold text-slate-900">{primaryAsset.messagingLimitTier}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Cloud API Webhooks:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Subscribed &amp; Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/dashboard/whatsapp"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                >
                  <span>Manage Phone Numbers &amp; Webhook Secrets</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Primary Phone Asset
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Not Connected
                  </span>
                </div>

                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <WhatsAppIcon className="w-7 h-7 fill-emerald-600" />
                  </div>
                  <h2 className="text-base font-black text-slate-900">
                    Connect Your Official WhatsApp Business Number
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Onboard your Meta WABA in 2 minutes via Meta Embedded Signup or paste your WABA ID, Phone Number ID,
                    and System User Token encrypted at rest with AES-256-GCM.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/whatsapp"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Connect Official WABA Now</span>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Operations Matrix */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Quick Operations Center
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {metrics.approvedTemplates} approved template(s) • {metrics.totalContacts.toLocaleString()} CRM contact(s)
                </p>
              </div>
              <Link href="/dashboard/billing" className="text-xs font-bold text-emerald-600 hover:underline">
                MTD Meta Est: ₹{metrics.metaEstimatedInr.toFixed(2)}
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
              <Link
                href="/dashboard/templates"
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-center group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Template Studio</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {metrics.approvedTemplates} approved
                </span>
              </Link>

              <Link
                href="/dashboard/campaigns"
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-center group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Bulk Broadcast</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {metrics.activeCampaigns} active
                </span>
              </Link>

              <Link
                href="/dashboard/inbox"
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-center group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                  <Inbox className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Shared Inbox</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {metrics.openConversations} open
                </span>
              </Link>

              <Link
                href="/dashboard/automations"
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-center group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Automation Bots</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Webhook rules</span>
              </Link>
            </div>
          </div>

          {/* 24h Window Notice Card */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Meta 24-Hour Customer Service Window ({metrics.active24hChats} Active)
                </h4>
                <p className="text-[11px] text-slate-600">
                  Free-form session replies are ₹0.00 during active customer-initiated 24h windows.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/inbox"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 text-center"
            >
              Reply in Inbox
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table with Live Progress */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Broadcast Campaigns</h2>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {campaigns.length} Recent
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live broadcast telemetry and recipient delivery confirmations from outbox worker queue
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/campaigns"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <span>View All Campaigns</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {loading && campaigns.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading recent campaigns...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">No Broadcasts Yet — Launch First Campaign</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Import opted-in contacts and select an approved Meta WhatsApp template to dispatch your first bulk campaign.
            </p>
            <div className="pt-1">
              <Link
                href="/dashboard/campaigns?new=true"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Launch First Campaign</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Campaign Name</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Progress &amp; Delivery</th>
                  <th className="py-3.5 px-6">Read &amp; Reply</th>
                  <th className="py-3.5 px-6">Scheduled / Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((camp) => {
                  const percent = camp.total > 0 ? Math.round((camp.sent / camp.total) * 100) : 0;
                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <Link href="/dashboard/campaigns" className="hover:text-emerald-600 transition-colors">
                          {camp.name}
                        </Link>
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">
                          ID: {camp.id.slice(0, 12)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {camp.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            camp.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : camp.status === 'PROCESSING'
                                ? 'bg-amber-100 text-amber-800'
                                : camp.status === 'CANCELLED' || camp.status === 'FAILED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              camp.status === 'PROCESSING' ? 'bg-amber-500 animate-pulse' : 'bg-current'
                            }`}
                          />
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                            <span>
                              {camp.sent.toLocaleString()} / {camp.total.toLocaleString()} sent
                            </span>
                            <span className="text-slate-500">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                camp.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {camp.delivered.toLocaleString()} delivered (
                            {camp.sent > 0 ? Math.round((camp.delivered / camp.sent) * 100) : 0}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{camp.read.toLocaleString()} read</div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          {camp.replied.toLocaleString()} customer replies
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[11px] whitespace-nowrap">{camp.date}</td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href="/dashboard/campaigns"
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

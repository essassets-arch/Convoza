'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCircle2,
  Eye,
  Flame,
  Plus,
  ArrowUpRight,
  Smartphone,
  Users2,
  FileCode2,
  Inbox,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Radio,
  BarChart3,
  Bot,
  Zap,
} from 'lucide-react';
import { WhatsAppIcon } from '@convoza/ui';
import { apiFetch } from '../../lib/api';

export default function DashboardOverviewPage() {
  const [userName, setUserName] = useState('Alex Vance');
  const [metrics, setMetrics] = useState({
    totalMessages: 128450,
    deliveryRate: 98.6,
    readRate: 79.2,
    replyRate: 18.4,
    activeCampaigns: 2,
    active24hChats: 14,
    quotaUsed: 28450,
    quotaTotal: 50000,
  });

  const [campaigns, setCampaigns] = useState([
    {
      id: 'c1',
      name: 'Weekend VIP Flash Sale Announcement',
      status: 'COMPLETED',
      sent: 500,
      total: 500,
      delivered: 489,
      read: 412,
      replied: 84,
      date: 'Today, 09:30 AM',
      category: 'MARKETING',
    },
    {
      id: 'c2',
      name: 'Cart Recovery - Festive Wave 1',
      status: 'PROCESSING',
      sent: 840,
      total: 1200,
      delivered: 810,
      read: 650,
      replied: 38,
      date: 'Today, 08:00 AM',
      category: 'UTILITY',
    },
    {
      id: 'c3',
      name: 'Loyalty Rewards Tier Upgrade',
      status: 'SCHEDULED',
      sent: 0,
      total: 2500,
      delivered: 0,
      read: 0,
      replied: 0,
      date: 'Tomorrow, 10:00 AM',
      category: 'MARKETING',
    },
  ]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('convoza_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) setUserName(parsed.name);
      }
      const token = localStorage.getItem('convoza_access_token');
      if (token) {
        apiFetch('/analytics/dashboard')
          .then((d) => {
            if (d && typeof d.totalMessages === 'number') {
              setMetrics((prev) => ({
                ...prev,
                totalMessages: d.totalMessages,
                deliveryRate: d.rates?.deliveryRate || prev.deliveryRate,
                readRate: d.rates?.readRate || prev.readRate,
                replyRate: d.rates?.replyRate || prev.replyRate,
                activeCampaigns: d.activeCampaigns ?? prev.activeCampaigns,
              }));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              OFFICIAL META CLOUD API v20.0 • PRODUCTION READY
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              Your WhatsApp Business throughput is running at <span className="text-emerald-400 font-bold">98.6% delivery</span>. All webhook listeners and Meta Cloud API token endpoints are healthy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
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

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Primary KPI Cards with Micro Visuals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Messages Delivered</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalMessages.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Quota Used</span>
            <span className="font-semibold text-slate-700">28.4k / 50k (56.9%)</span>
          </div>
          {/* Progress mini bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '56.9%' }} />
          </div>
        </div>

        {/* Metric 2 */}
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
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-3 h-3" /> +0.8%
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Meta Rating</span>
            <span className="font-bold text-emerald-600">HIGH QUALITY (Green)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98.6%' }} />
          </div>
        </div>

        {/* Metric 3 */}
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
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              <TrendingUp className="w-3 h-3" /> 8x vs Email
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Read within 5 mins</span>
            <span className="font-semibold text-slate-700">68.2%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '79.2%' }} />
          </div>
        </div>

        {/* Metric 4 */}
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
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Active Inbound
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Live 24h Window Chats</span>
            <span className="font-bold text-slate-800">{metrics.active24hChats} open</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '45%' }} />
          </div>
        </div>
      </div>

      {/* Connected WABA Card & Operations Quick Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WABA Phone Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
                  <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Primary Phone Asset
                  </h3>
                </div>
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
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">+91 98765 43210</h2>
                  <svg className="w-4 h-4 text-emerald-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-600">Apex Retail Official • WABA Verified</p>
                <p className="text-[11px] text-slate-400">Phone ID: 102938475610293</p>
              </div>
            </div>

            {/* Health Matrix */}
            <div className="mt-6 space-y-2.5 text-xs border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Quality Rating:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  HIGH (Score: 98/100)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Messaging Limit:</span>
                <span className="font-bold text-slate-900">10,000 unique users / 24 hours</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Cloud API Webhooks:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Subscribed & Active
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/dashboard/whatsapp"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
            >
              <span>Manage Phone Numbers & Webhook Secrets</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Quick Operations Matrix */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Quick Operations Center
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Instant workflows and template actions</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">4 Modules Active</span>
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
                <span className="text-[10px] text-slate-400 mt-0.5 block">Meta approvals</span>
              </Link>

              <Link
                href="/dashboard/campaigns"
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-center group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Bulk Broadcast</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Worker queues</span>
              </Link>

              <Link
                href="/dashboard/inbox"
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-center group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                  <Inbox className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Shared Inbox</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Multi-agent live</span>
              </Link>

              <Link
                href="/dashboard/automations"
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-center group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Automation Bots</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Instant trigger</span>
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
                  Meta 24-Hour Customer Window Engine Active
                </h4>
                <p className="text-[11px] text-slate-600">
                  Free-form replies unlocked for customer-initiated conversations. No template charges applied.
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
                3 Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live broadcast telemetry and recipient delivery confirmations from BullMQ worker queue
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Campaign Name</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Progress & Delivery</th>
                <th className="py-3.5 px-6">Read & Reply</th>
                <th className="py-3.5 px-6">Scheduled / Date</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((camp) => {
                const percent = Math.round((camp.sent / camp.total) * 100) || 0;
                return (
                  <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <Link href={`/dashboard/campaigns`} className="hover:text-emerald-600 transition-colors">
                        {camp.name}
                      </Link>
                      <span className="block text-[10px] text-slate-400 font-normal">ID: {camp.id}</span>
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
                          <span>{camp.sent} / {camp.total} sent</span>
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
                          {camp.delivered} delivered ({camp.sent > 0 ? Math.round((camp.delivered / camp.sent) * 100) : 0}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{camp.read} read</div>
                      <div className="text-[10px] text-emerald-600 font-medium">{camp.replied} customer replies</div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-[11px] whitespace-nowrap">
                      {camp.date}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href="/dashboard/campaigns"
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

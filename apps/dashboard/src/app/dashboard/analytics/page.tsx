'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  CheckCircle2,
  Eye,
  Flame,
  MessageSquare,
  Loader2,
  RefreshCw,
  IndianRupee,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';

interface TimeseriesPoint {
  date: string;
  label: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  inbound: number;
  metaCostInr: number;
}

const RANGE_TO_DAYS: Record<'24h' | '7d' | '30d' | '90d', number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [dashboard, setDashboard] = useState<any>({
    totalMessages: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    failedCount: 0,
    replyCount: 0,
    rates: {
      deliveryRate: 0,
      readRate: 0,
      replyRate: 0,
      failureRate: 0,
    },
    monthlyCost: {
      metaEstimatedInr: 0,
      walletChargedInr: 0,
      categoryBreakdown: {
        MARKETING: { count: 0, metaCostInr: 0 },
        UTILITY: { count: 0, metaCostInr: 0 },
        AUTHENTICATION: { count: 0, metaCostInr: 0 },
        SERVICE: { count: 0, metaCostInr: 0 },
      },
    },
  });

  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [campaignStats, setCampaignStats] = useState<any[]>([]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }
      const days = RANGE_TO_DAYS[timeRange];

      const [dashRes, tsRes, campRes] = await Promise.allSettled([
        apiFetch<any>('/analytics/dashboard'),
        apiFetch<TimeseriesPoint[]>(`/analytics/timeseries?days=${days}`),
        apiFetch<any[]>('/analytics/campaigns'),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboard(dashRes.value);
      }
      if (tsRes.status === 'fulfilled' && Array.isArray(tsRes.value)) {
        setTimeseries(tsRes.value);
      }
      if (campRes.status === 'fulfilled' && Array.isArray(campRes.value)) {
        setCampaignStats(campRes.value);
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExportCsv = () => {
    setDownloading(true);
    try {
      const headers = ['Date,Label,OutboundSent,Delivered,Read,Failed,InboundReplies,EstimatedMetaCostINR'];
      const rows = timeseries.map(
        (d) =>
          `${d.date},"${d.label}",${d.sent},${d.delivered},${d.read},${d.failed},${d.inbound},${d.metaCostInr.toFixed(2)}`
      );
      const blob = new Blob([[headers.join('\n'), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `convoza-analytics-${timeRange}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const sentTotal = Number(dashboard?.sentCount ?? 0) + Number(dashboard?.failedCount ?? 0);
  const deliveredCount = Number(dashboard?.deliveredCount ?? 0);
  const readCount = Number(dashboard?.readCount ?? 0);
  const replyCount = Number(dashboard?.replyCount ?? 0);
  const failedCount = Number(dashboard?.failedCount ?? 0);

  const deliveryRate = Number(dashboard?.rates?.deliveryRate ?? 0);
  const readRate = Number(dashboard?.rates?.readRate ?? 0);
  const replyRate = Number(dashboard?.rates?.replyRate ?? 0);
  const failureRate = Number(dashboard?.rates?.failureRate ?? 0);

  const breakdown = dashboard?.monthlyCost?.categoryBreakdown || {};
  const categories = [
    { key: 'MARKETING', label: 'Marketing Templates', accent: 'text-purple-700 bg-purple-50 border-purple-200' },
    { key: 'UTILITY', label: 'Utility Templates', accent: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { key: 'AUTHENTICATION', label: 'Authentication (OTP)', accent: 'text-sky-700 bg-sky-50 border-sky-200' },
    { key: 'SERVICE', label: '24h Service Replies', accent: 'text-amber-700 bg-amber-50 border-amber-200' },
  ];

  const maxChartVal = Math.max(1, ...timeseries.map((d) => Math.max(d.sent, d.delivered, d.inbound)));

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Performance &amp; Delivery Analytics</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Webhooks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time Meta WhatsApp Cloud API throughput, delivery receipts, read conversions, and category spend.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-white rounded-xl border border-slate-200 p-1 text-xs font-bold text-slate-600 shadow-xs">
            {(['24h', '7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  timeRange === r ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-100'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadAnalytics}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-xs cursor-pointer"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={downloading || timeseries.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting...' : 'Export CSV Report'}</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivered Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{deliveryRate}%</div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {deliveredCount.toLocaleString()} confirmed deliveries
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Read / Open Rate</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{readRate}%</div>
          <span className="text-[11px] text-slate-500 mt-2 block">{readCount.toLocaleString()} read receipts</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Inbound Replies</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{replyRate}%</div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {replyCount.toLocaleString()} inbound customer messages
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Undelivered / Failed</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-rose-600">{failureRate}%</div>
          <span className="text-[11px] text-slate-500 mt-2 block">{failedCount.toLocaleString()} failed dispatches</span>
        </div>
      </div>

      {/* Live Outbound → Delivered → Read → Replied Conversion Funnel */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">Full-Funnel WhatsApp Conversion Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live cumulative status events from Meta Cloud API webhooks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage 1: Outbound Sent</div>
            <div className="text-xl font-black text-slate-900 mt-1">{sentTotal.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">{sentTotal > 0 ? '100% Dispatched' : '0 Dispatched'}</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-slate-600 h-1.5 rounded-full" style={{ width: sentTotal > 0 ? '100%' : '0%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Stage 2: Delivered</div>
            <div className="text-xl font-black text-emerald-950 mt-1">{deliveredCount.toLocaleString()}</div>
            <div className="text-xs text-emerald-700 font-bold mt-1">{deliveryRate}% Deliverability</div>
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, deliveryRate)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80">
            <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Stage 3: Read &amp; Opened</div>
            <div className="text-xl font-black text-sky-950 mt-1">{readCount.toLocaleString()}</div>
            <div className="text-xs text-sky-700 font-bold mt-1">{readRate}% Open Rate</div>
            <div className="w-full bg-sky-200/60 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, readRate)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Stage 4: Customer Replies</div>
            <div className="text-xl font-black text-amber-950 mt-1">{replyCount.toLocaleString()}</div>
            <div className="text-xs text-amber-700 font-bold mt-1">{replyRate}% Reply Conversion</div>
            <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, replyRate)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Interactive Bar Chart */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Daily WhatsApp Volume ({timeRange.toUpperCase()})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hover over any day bar to inspect Sent, Delivered, Read, and Inbound counts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded bg-slate-300" /> Sent
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Delivered
            </span>
            <span className="flex items-center gap-1.5 text-sky-600">
              <span className="w-3 h-3 rounded bg-sky-400" /> Read
            </span>
          </div>
        </div>

        {loading && timeseries.length === 0 ? (
          <div className="h-64 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading timeseries chart...</span>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div
              className="flex items-end gap-2 sm:gap-3 h-64 pt-8 min-w-[520px]"
            >
              {timeseries.map((d) => {
                const sentPct = Math.round((d.sent / maxChartVal) * 100);
                const delPct = Math.round((d.delivered / maxChartVal) * 100);
                const readPct = Math.round((d.read / maxChartVal) * 100);

                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Hover Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-2 z-20 bg-slate-900 text-white text-[10px] rounded-xl px-2.5 py-1.5 shadow-xl whitespace-nowrap border border-slate-700">
                      <div className="font-bold text-emerald-400">{d.label}</div>
                      <div>Sent: {d.sent} • Deliv: {d.delivered} • Read: {d.read}</div>
                      <div>Inbound: {d.inbound} • Est: ₹{d.metaCostInr.toFixed(2)}</div>
                    </div>

                    <div className="text-[10px] font-bold text-slate-600 mb-1 font-mono">
                      {d.sent > 0 ? d.sent : ''}
                    </div>
                    <div className="w-full max-w-[44px] bg-slate-100 rounded-t-xl flex items-end justify-center relative overflow-hidden h-full">
                      <div
                        className="w-full bg-slate-300 absolute bottom-0 rounded-t-xl transition-all duration-300"
                        style={{ height: `${sentPct}%` }}
                      />
                      <div
                        className="w-full bg-emerald-500 absolute bottom-0 rounded-t-xl transition-all duration-300"
                        style={{ height: `${delPct}%` }}
                      />
                      <div
                        className="w-full bg-sky-400/85 absolute bottom-0 rounded-t-xl transition-all duration-300"
                        style={{ height: `${readPct}%` }}
                      />
                    </div>
                    <span className="mt-2 text-[10px] font-bold text-slate-600 truncate max-w-[56px]">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Meta Cost by Category */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Current Month Meta Cost by Conversation Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculated from outbound template categories and 24-hour customer service windows
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">Est. Meta Wholesale</span>
              <span className="text-base font-black text-emerald-950 flex items-center gap-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(dashboard?.monthlyCost?.metaEstimatedInr ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Wallet Charged</span>
              <span className="text-base font-black text-slate-900 flex items-center gap-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(dashboard?.monthlyCost?.walletChargedInr ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const item = breakdown[cat.key] || { count: 0, metaCostInr: 0 };
            return (
              <div key={cat.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.accent}`}>
                  {cat.key}
                </span>
                <div className="text-xs font-bold text-slate-700">{cat.label}</div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-black text-slate-900">
                    ₹{Number(item.metaCostInr ?? 0).toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {Number(item.count ?? 0).toLocaleString()} msgs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Performance Table */}
      {campaignStats.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Campaign Conversion Attribution</h2>
            <p className="text-xs text-slate-500 mt-0.5">Per-campaign delivery, read, and reply telemetry</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Campaign</th>
                  <th className="py-3.5 px-6">Template</th>
                  <th className="py-3.5 px-6">Sender</th>
                  <th className="py-3.5 px-6">Sent</th>
                  <th className="py-3.5 px-6">Delivered</th>
                  <th className="py-3.5 px-6">Read</th>
                  <th className="py-3.5 px-6">Replies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaignStats.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-6 font-mono text-slate-600">
                      {c.template?.name || '—'} ({c.template?.category || 'UTILITY'})
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">{c.phoneNumber?.displayPhoneNumber || '—'}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{c.sentCount ?? 0}</td>
                    <td className="py-3.5 px-6 font-semibold text-emerald-600">{c.deliveredCount ?? 0}</td>
                    <td className="py-3.5 px-6 font-semibold text-sky-600">{c.readCount ?? 0}</td>
                    <td className="py-3.5 px-6 font-semibold text-amber-600">{c.repliedCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

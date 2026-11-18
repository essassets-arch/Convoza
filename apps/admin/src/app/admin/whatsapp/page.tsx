'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { adminFetch } from '../../../lib/api';
import {
  Smartphone,
  Search,
  RefreshCw,
  Loader2,
  Lock,
  Webhook,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  FileText,
} from 'lucide-react';

export default function AdminGlobalWhatsAppPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<any[]>('/admin/whatsapp');
      setAssets(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load global WhatsApp Business Accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filtered = assets.filter((a) => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return true;
    const matchOrg = a.organization?.name?.toLowerCase().includes(s);
    const matchWaba =
      a.name?.toLowerCase().includes(s) || String(a.wabaId || '').toLowerCase().includes(s);
    const matchPhone = (a.phoneNumbers || []).some(
      (p: any) =>
        String(p.displayPhoneNumber || '').toLowerCase().includes(s) ||
        String(p.verifiedName || '').toLowerCase().includes(s) ||
        String(p.phoneNumberId || '').toLowerCase().includes(s)
    );
    return matchOrg || matchWaba || matchPhone;
  });

  const totalNumbers = assets.reduce((sum, a) => sum + (a.phoneNumbers?.length || 0), 0);
  const encryptedTokensCount = assets.filter((a) => a.hasLiveToken).length;
  const webhookSubscribedCount = assets.filter((a) => a.webhookSubscribed).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Global WABAs & Phone Numbers
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Meta Cloud API
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cross-tenant inventory of connected WhatsApp Business Accounts, AES-256 encrypted credentials, webhook subscriptions, and phone quality tiers.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAssets}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Inventory</span>
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Total WABA Accounts
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {assets.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all tenants</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Registered Phone Numbers
          </div>
          <div className="mt-2 text-2xl font-black text-sky-600 dark:text-sky-400">
            {totalNumbers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cloud API sender numbers</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Encrypted Vault Tokens
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {encryptedTokensCount} / {assets.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">AES-256-GCM active tokens</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Webhook Subscribed
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            {webhookSubscribedCount} / {assets.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Real-time Graph event stream</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by tenant, WABA ID, phone number, or verified name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* WABA Cards & Nested Phone Numbers */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
          <span className="text-xs font-semibold">Loading global WhatsApp Cloud assets...</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-center text-xs text-rose-600 font-semibold">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          No connected WhatsApp Business Accounts match your query.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((waba) => (
            <div
              key={waba.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden"
            >
              {/* WABA Top Header */}
              <div className="p-5 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {waba.name}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      WABA: {waba.wabaId}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      {waba.onboardingType || 'MANUAL'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        waba.status === 'CONNECTED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {waba.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                    <span>Tenant:</span>
                    <Link
                      href={`/admin/organizations?inspect=${waba.organization?.id}`}
                      className="font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>{waba.organization?.name || 'Unknown Tenant'}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{waba.templatesCount ?? 0}</strong> templates
                    </span>
                  </div>
                </div>

                {/* Security & Webhook Status Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-xl border ${
                      waba.hasLiveToken
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{waba.hasLiveToken ? 'Token Encrypted' : 'Missing Token'}</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-xl border ${
                      waba.webhookSubscribed
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <Webhook className="w-3.5 h-3.5" />
                    <span>{waba.webhookSubscribed ? 'Webhook Active' : 'Webhook Unsubscribed'}</span>
                  </span>
                </div>
              </div>

              {/* Nested Phone Numbers Table */}
              {!waba.phoneNumbers?.length ? (
                <div className="px-6 py-4 text-xs text-slate-500">
                  No phone numbers linked to this WABA yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 dark:bg-slate-950/70 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-6">Display Phone Number</th>
                        <th className="py-2.5 px-4">Verified Name</th>
                        <th className="py-2.5 px-4">Meta Phone Number ID</th>
                        <th className="py-2.5 px-4">Quality Rating</th>
                        <th className="py-2.5 px-6">Messaging Limit Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {waba.phoneNumbers.map((pn: any) => {
                        const q = String(pn.qualityRating || 'GREEN').toUpperCase();
                        return (
                          <tr key={pn.id}>
                            <td className="py-3 px-6 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{pn.displayPhoneNumber}</span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                              {pn.verifiedName || '—'}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">
                              {pn.phoneNumberId}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  q === 'GREEN'
                                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                    : q === 'YELLOW'
                                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                    : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                }`}
                              >
                                {q === 'GREEN' ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3" />
                                )}
                                {q}
                              </span>
                            </td>
                            <td className="py-3 px-6 font-mono font-bold text-slate-700 dark:text-slate-300">
                              {pn.messagingLimitTier || 'TIER_1K'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminFetch } from '../../../lib/api';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  X,
  Smartphone,
  Users,
  Wallet,
  IndianRupee,
  RefreshCw,
  Sliders,
  Plus,
  Minus,
  FileText,
} from 'lucide-react';

function formatInr(amount: number, decimals = 2): string {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function OrganizationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inspectIdFromQuery = searchParams.get('inspect');

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const [orgs, setOrgs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Suspend modal
  const [orgToSuspend, setOrgToSuspend] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState(
    'Violation of Meta WhatsApp Acceptable Use Policy'
  );
  const [suspending, setSuspending] = useState(false);

  // Tenant Drill-Down Drawer
  const [drawerOrgId, setDrawerOrgId] = useState<string | null>(null);
  const [drawerDetail, setDrawerDetail] = useState<any | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'billing' | 'wallet' | 'assets'>('billing');

  // Billing form state inside drawer
  const [billingForm, setBillingForm] = useState({
    billingMode: 'DIRECT_META',
    planId: '',
    subscriptionStatus: 'ACTIVE',
    currentPeriodEnd: '',
    rateMarketingInr: '',
    rateUtilityInr: '',
    rateAuthInr: '',
    rateServiceInr: '',
  });
  const [savingBilling, setSavingBilling] = useState(false);

  // Wallet form state inside drawer
  const [walletForm, setWalletForm] = useState({
    type: 'CREDIT' as 'CREDIT' | 'DEBIT',
    amountInr: '',
    description: 'Manual UPI Top-Up',
  });
  const [savingWallet, setSavingWallet] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const res = await adminFetch<{ items: any[]; meta: { total: number } }>(
        `/admin/organizations?limit=100${q}`
      );
      setOrgs(res?.items || []);
      setTotalCount(res?.meta?.total ?? (res?.items?.length || 0));
    } catch (err: any) {
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    adminFetch<{ plans: any[] }>('/admin/billing/overview')
      .then((res) => {
        if (res?.plans) setPlans(res.plans);
      })
      .catch(() => {});
  }, []);

  const openInspectDrawer = useCallback(async (orgId: string) => {
    setDrawerOrgId(orgId);
    setDrawerLoading(true);
    setDrawerDetail(null);
    try {
      const detail = await adminFetch(`/admin/organizations/${orgId}`);
      setDrawerDetail(detail);
      setBillingForm({
        billingMode: detail.billingMode || 'DIRECT_META',
        planId: detail.subscription?.planId || detail.subscription?.plan?.id || '',
        subscriptionStatus: detail.subscription?.status || 'ACTIVE',
        currentPeriodEnd: detail.subscription?.currentPeriodEnd
          ? new Date(detail.subscription.currentPeriodEnd).toISOString().split('T')[0]
          : '',
        rateMarketingInr:
          detail.rateMarketingPaise !== null && detail.rateMarketingPaise !== undefined
            ? (detail.rateMarketingPaise / 100).toFixed(2)
            : '',
        rateUtilityInr:
          detail.rateUtilityPaise !== null && detail.rateUtilityPaise !== undefined
            ? (detail.rateUtilityPaise / 100).toFixed(2)
            : '',
        rateAuthInr:
          detail.rateAuthPaise !== null && detail.rateAuthPaise !== undefined
            ? (detail.rateAuthPaise / 100).toFixed(2)
            : '',
        rateServiceInr:
          detail.rateServicePaise !== null && detail.rateServicePaise !== undefined
            ? (detail.rateServicePaise / 100).toFixed(2)
            : '',
      });
    } catch (err: any) {
      setBannerMsg({
        type: 'error',
        text: err.message || 'Unable to load tenant detail',
      });
      setDrawerOrgId(null);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (inspectIdFromQuery) {
      openInspectDrawer(inspectIdFromQuery);
    }
  }, [inspectIdFromQuery, openInspectDrawer]);

  const closeDrawer = () => {
    setDrawerOrgId(null);
    setDrawerDetail(null);
    if (inspectIdFromQuery) {
      router.replace('/admin/organizations');
    }
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgToSuspend) return;
    setSuspending(true);
    try {
      await adminFetch(`/admin/organizations/${orgToSuspend.id}/suspend`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: suspendReason }),
      });
      setBannerMsg({
        type: 'success',
        text: `Organization "${orgToSuspend.name}" suspended immediately across API & workers.`,
      });
      setOrgToSuspend(null);
      await loadOrganizations();
      if (drawerOrgId === orgToSuspend.id) {
        await openInspectDrawer(orgToSuspend.id);
      }
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Failed to suspend organization' });
    } finally {
      setSuspending(false);
    }
  };

  const handleRestore = async (org: any) => {
    try {
      await adminFetch(`/admin/organizations/${org.id}/restore`, {
        method: 'PATCH',
        body: '{}',
      });
      setBannerMsg({
        type: 'success',
        text: `Organization "${org.name}" restored to active status.`,
      });
      await loadOrganizations();
      if (drawerOrgId === org.id) {
        await openInspectDrawer(org.id);
      }
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Failed to restore organization' });
    }
  };

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerOrgId) return;
    setSavingBilling(true);
    try {
      const payload: Record<string, any> = {
        billingMode: billingForm.billingMode,
        subscriptionStatus: billingForm.subscriptionStatus,
      };
      if (billingForm.planId) payload.planId = billingForm.planId;
      if (billingForm.currentPeriodEnd) payload.currentPeriodEnd = billingForm.currentPeriodEnd;
      if (billingForm.rateMarketingInr.trim() !== '') {
        payload.rateMarketingPaise = Math.max(0, Math.round(Number(billingForm.rateMarketingInr) * 100));
      }
      if (billingForm.rateUtilityInr.trim() !== '') {
        payload.rateUtilityPaise = Math.max(0, Math.round(Number(billingForm.rateUtilityInr) * 100));
      }
      if (billingForm.rateAuthInr.trim() !== '') {
        payload.rateAuthPaise = Math.max(0, Math.round(Number(billingForm.rateAuthInr) * 100));
      }
      if (billingForm.rateServiceInr.trim() !== '') {
        payload.rateServicePaise = Math.max(0, Math.round(Number(billingForm.rateServiceInr) * 100));
      }

      const updated = await adminFetch(`/admin/organizations/${drawerOrgId}/billing`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setDrawerDetail(updated);
      setBannerMsg({
        type: 'success',
        text: `Updated billing configuration & plan for "${updated.name}".`,
      });
      await loadOrganizations();
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Failed to update billing configuration' });
    } finally {
      setSavingBilling(false);
    }
  };

  const handleWalletAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerOrgId) return;
    const amount = Number(walletForm.amountInr);
    if (!amount || amount <= 0) return;

    setSavingWallet(true);
    try {
      await adminFetch(`/admin/organizations/${drawerOrgId}/wallet`, {
        method: 'POST',
        body: JSON.stringify({
          type: walletForm.type,
          amountInr: amount,
          description: walletForm.description.trim() || `Admin ${walletForm.type}`,
        }),
      });
      setWalletForm({
        ...walletForm,
        amountInr: '',
      });
      await openInspectDrawer(drawerOrgId);
      await loadOrganizations();
      setBannerMsg({
        type: 'success',
        text: `Successfully recorded ${walletForm.type} of ${formatInr(amount)} on tenant wallet.`,
      });
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Wallet adjustment failed' });
    } finally {
      setSavingWallet(false);
    }
  };

  const filteredOrgs = orgs.filter((org) => {
    if (statusFilter === 'ACTIVE') return !org.isSuspended;
    if (statusFilter === 'SUSPENDED') return Boolean(org.isSuspended);
    return true;
  });

  const activeCount = orgs.filter((o) => !o.isSuspended).length;
  const suspendedCount = orgs.filter((o) => o.isSuspended).length;
  const totalWalletFloat = orgs.reduce((sum, o) => sum + (o.walletBalanceInr || 0), 0);
  const total30dMetaCost = orgs.reduce((sum, o) => sum + (o.usage30d?.metaCostInr || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Organizations, Wallets & Cost Governance
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              Multi-Tenant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Inspect tenant owners, switch billing modes, credit prepaid wallets, customize message rates, and enforce suspensions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrganizations}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {bannerMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            bannerMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {bannerMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{bannerMsg.text}</span>
          </div>
          <button type="button" onClick={() => setBannerMsg(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Total Organizations
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalCount}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {activeCount} active in view
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Suspended Tenants
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {suspendedCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            API & worker dispatch blocked
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Combined Wallet Float
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatInr(totalWalletFloat)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Prepaid balance across tenants
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            30d Meta Wholesale
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {formatInr(total30dMetaCost)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Rolling 30-day Meta Graph spend
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search organizations by name or slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === filter
                  ? 'bg-slate-900 dark:bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter === 'ALL' ? 'All Tenants' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
            <span className="text-xs font-semibold">Fetching live organizations...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-rose-600 font-semibold">{error}</div>
        ) : filteredOrgs.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-500 dark:text-slate-400">
            No matching organizations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Organization & Owner</th>
                  <th className="py-3.5 px-4">Plan & Status</th>
                  <th className="py-3.5 px-4">Billing Mode</th>
                  <th className="py-3.5 px-4">Wallet Balance</th>
                  <th className="py-3.5 px-4">Assets (# / Tpl / Contacts)</th>
                  <th className="py-3.5 px-4">30d Outbound & Cost</th>
                  <th className="py-3.5 px-4">Tenancy</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrgs.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {org.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {org.owner ? (
                          <span>
                            {org.owner.name} • <span className="font-mono">{org.owner.email}</span>
                          </span>
                        ) : (
                          <span className="font-mono">{org.slug}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {org.subscription?.plan?.name || 'Trial / Unassigned'}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        {org.subscription?.status || 'NO_SUB'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          org.billingMode === 'PREPAID_WALLET'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        }`}
                      >
                        {org.billingMode || 'DIRECT_META'}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatInr(org.walletBalanceInr)}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {org._count?.phoneNumbers ?? 0} # • {org._count?.templates ?? 0} tpl •{' '}
                      {(org._count?.contacts ?? 0).toLocaleString('en-IN')} c
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {(org.usage30d?.outboundMessages ?? 0).toLocaleString('en-IN')} sent
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Meta: {formatInr(org.usage30d?.metaCostInr ?? 0)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {org.isSuspended ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 font-bold px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                            SUSPENDED
                          </span>
                          {org.suspensionReason && (
                            <span
                              className="block text-[10px] text-rose-600 dark:text-rose-400 max-w-[160px] truncate mt-0.5"
                              title={org.suspensionReason}
                            >
                              {org.suspensionReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openInspectDrawer(org.id)}
                          className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Inspect / Manage
                        </button>
                        {org.isSuspended ? (
                          <button
                            type="button"
                            onClick={() => handleRestore(org)}
                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setOrgToSuspend(org)}
                            className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Suspend Organization */}
      {orgToSuspend && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <span>Suspend Organization</span>
              </h3>
              <button
                type="button"
                onClick={() => setOrgToSuspend(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Suspending <strong className="text-slate-900 dark:text-white">{orgToSuspend.name}</strong>{' '}
              blocks API access, halts queued campaign jobs, and pauses WhatsApp Cloud API dispatch immediately.
            </p>

            <form onSubmit={handleSuspend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1">
                  Enforcement Reason
                </label>
                <textarea
                  rows={3}
                  required
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setOrgToSuspend(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={suspending}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-60"
                >
                  {suspending ? 'Suspending...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Tenant Drill-Down Drawer */}
      {drawerOrgId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {drawerDetail?.name || 'Loading Tenant...'}
                  </h3>
                  {drawerDetail && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        drawerDetail.isSuspended
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {drawerDetail.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                    </span>
                  )}
                </div>
                {drawerDetail && (
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    ID: {drawerDetail.id} • Slug: {drawerDetail.slug} • Balance:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {formatInr(drawerDetail.walletBalanceInr)}
                    </strong>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900 shrink-0">
              {[
                { id: 'billing', label: 'Billing, Plan & Rates', icon: Sliders },
                { id: 'wallet', label: 'Prepaid Wallet & Ledger', icon: Wallet },
                { id: 'assets', label: 'WABAs, Templates & Team', icon: Smartphone },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDrawerTab(t.id as any)}
                    className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                      drawerTab === t.id
                        ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerLoading || !drawerDetail ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                  <span className="text-xs font-semibold">Loading tenant configuration...</span>
                </div>
              ) : drawerTab === 'billing' ? (
                <form onSubmit={handleSaveBilling} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Contacts</div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {(drawerDetail._count?.contacts ?? 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Messages</div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {(drawerDetail._count?.messages ?? 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Campaigns</div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {drawerDetail._count?.campaigns ?? 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Automations</div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {drawerDetail._count?.automations ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Billing Mode */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2">
                      WhatsApp Conversation Billing Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          mode: 'DIRECT_META',
                          title: 'DIRECT_META (Zero Markup)',
                          desc: 'Client pays Meta directly via their own card on Meta Business Manager.',
                        },
                        {
                          mode: 'PREPAID_WALLET',
                          title: 'PREPAID_WALLET (Reseller Margin)',
                          desc: 'Deduct per-message INR charges from tenant Convoza wallet with auto-refund on failure.',
                        },
                      ].map((opt) => (
                        <button
                          key={opt.mode}
                          type="button"
                          onClick={() => setBillingForm({ ...billingForm, billingMode: opt.mode })}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            billingForm.billingMode === opt.mode
                              ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-950/30 ring-1 ring-rose-500/40'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-black text-slate-900 dark:text-white">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            {opt.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subscription Plan, Status & Renewal Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Subscription Plan
                      </label>
                      <select
                        value={billingForm.planId}
                        onChange={(e) => setBillingForm({ ...billingForm, planId: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                      >
                        <option value="">Select Plan</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.tier} — ₹{p.priceMonthly}/mo)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Subscription Status
                      </label>
                      <select
                        value={billingForm.subscriptionStatus}
                        onChange={(e) =>
                          setBillingForm({ ...billingForm, subscriptionStatus: e.target.value })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="TRIALING">TRIALING</option>
                        <option value="PAST_DUE">PAST_DUE</option>
                        <option value="CANCELED">CANCELED</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                        Renewal Date
                      </label>
                      <input
                        type="date"
                        value={billingForm.currentPeriodEnd}
                        onChange={(e) =>
                          setBillingForm({ ...billingForm, currentPeriodEnd: e.target.value })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Custom Per-Message Selling Rates (INR) */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        Custom Per-Message Selling Rates (₹ INR Override)
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Leave blank to inherit global default selling rates from Billing & Rate Cards.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Marketing (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Default (e.g. 0.99)"
                          value={billingForm.rateMarketingInr}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, rateMarketingInr: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Utility (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Default (e.g. 0.25)"
                          value={billingForm.rateUtilityInr}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, rateUtilityInr: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Auth / OTP (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Default (e.g. 0.25)"
                          value={billingForm.rateAuthInr}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, rateAuthInr: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          24h Service (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={billingForm.rateServiceInr}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, rateServiceInr: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingBilling}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md disabled:opacity-60 cursor-pointer"
                    >
                      {savingBilling ? 'Saving Billing...' : 'Save Plan, Mode & Custom Rates'}
                    </button>
                  </div>
                </form>
              ) : drawerTab === 'wallet' ? (
                <div className="space-y-6">
                  {/* Current Wallet Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                        Available Prepaid Wallet Balance
                      </div>
                      <div className="text-3xl font-black mt-1 font-mono">
                        {formatInr(drawerDetail.walletBalanceInr)}
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20">
                      {drawerDetail.billingMode}
                    </span>
                  </div>

                  {/* Credit / Debit Form */}
                  <form
                    onSubmit={handleWalletAdjust}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Credit or Debit Tenant Wallet
                      </h4>
                      <div className="flex items-center gap-1.5">
                        {[1000, 5000, 10000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() =>
                              setWalletForm({
                                type: 'CREDIT',
                                amountInr: String(amt),
                                description: `Manual UPI Top-Up (+₹${amt.toLocaleString('en-IN')})`,
                              })
                            }
                            className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold cursor-pointer"
                          >
                            +₹{amt.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Adjustment Type
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setWalletForm({
                                ...walletForm,
                                type: 'CREDIT',
                                description: 'Manual UPI Top-Up',
                              })
                            }
                            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border cursor-pointer ${
                              walletForm.type === 'CREDIT'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Credit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWalletForm({
                                ...walletForm,
                                type: 'DEBIT',
                                description: 'Manual Balance Adjustment',
                              })
                            }
                            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border cursor-pointer ${
                              walletForm.type === 'DEBIT'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <Minus className="w-3.5 h-3.5" /> Debit
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Amount (₹ INR)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          required
                          placeholder="5000"
                          value={walletForm.amountInr}
                          onChange={(e) =>
                            setWalletForm({ ...walletForm, amountInr: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Audit Reason / Note
                        </label>
                        <input
                          type="text"
                          required
                          value={walletForm.description}
                          onChange={(e) =>
                            setWalletForm({ ...walletForm, description: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingWallet}
                        className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:opacity-95 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                      >
                        {savingWallet
                          ? 'Posting Ledger Entry...'
                          : `Execute Wallet ${walletForm.type}`}
                      </button>
                    </div>
                  </form>

                  {/* Recent Wallet Transactions */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                      Recent Wallet Ledger ({drawerDetail.walletTransactions?.length || 0})
                    </h4>
                    {!drawerDetail.walletTransactions?.length ? (
                      <div className="p-6 text-center text-xs text-slate-500 rounded-2xl border border-slate-200 dark:border-slate-800">
                        No wallet transactions recorded yet.
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Type</th>
                              <th className="py-2.5 px-3">Description</th>
                              <th className="py-2.5 px-3 text-right">Amount</th>
                              <th className="py-2.5 px-3 text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {drawerDetail.walletTransactions.map((tx: any) => {
                              const isCredit = String(tx.type).startsWith('CREDIT') || String(tx.type).includes('REFUND');
                              return (
                                <tr key={tx.id}>
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                                    {new Date(tx.createdAt).toLocaleString()}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        isCredit
                                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                      }`}
                                    >
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                                    {tx.description}
                                  </td>
                                  <td
                                    className={`py-2.5 px-3 text-right font-mono font-bold ${
                                      isCredit
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    }`}
                                  >
                                    {isCredit ? '+' : '-'}
                                    {formatInr((tx.amountPaise || 0) / 100)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                                    {formatInr((tx.balanceAfterPaise || 0) / 100)}
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
              ) : (
                <div className="space-y-6">
                  {/* Connected WABAs & Phone Numbers */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Connected WABAs & Phone Numbers ({drawerDetail.whatsAppAccounts?.length || 0})</span>
                    </h4>
                    {!drawerDetail.whatsAppAccounts?.length ? (
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        No WhatsApp Business Accounts connected yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {drawerDetail.whatsAppAccounts.map((w: any) => (
                          <div
                            key={w.id}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-black text-slate-900 dark:text-white">
                                  {w.name}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">
                                  WABA ID: {w.wabaId} • {w.onboardingType}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                {w.status}
                              </span>
                            </div>

                            {w.phoneNumbers?.length > 0 && (
                              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                                {w.phoneNumbers.map((p: any) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center justify-between text-xs font-mono"
                                  >
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                      {p.displayPhoneNumber} ({p.verifiedName || 'Unverified'})
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      Quality: {p.qualityRating || 'UNKNOWN'} • Tier:{' '}
                                      {p.messagingLimitTier || 'STANDARD'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Templates */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Recent Templates ({drawerDetail.templates?.length || 0})</span>
                    </h4>
                    {!drawerDetail.templates?.length ? (
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        No WhatsApp templates created yet.
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="py-2 px-3">Name</th>
                              <th className="py-2 px-3">Category</th>
                              <th className="py-2 px-3">Lang</th>
                              <th className="py-2 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {drawerDetail.templates.slice(0, 15).map((tpl: any) => (
                              <tr key={tpl.id}>
                                <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                  {tpl.name}
                                </td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                                  {tpl.category}
                                </td>
                                <td className="py-2 px-3 font-mono text-slate-500">
                                  {tpl.language}
                                </td>
                                <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                                  {tpl.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Team Members ({drawerDetail.memberships?.length || 0})</span>
                    </h4>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                      {(drawerDetail.memberships || []).map((m: any) => (
                        <div key={m.id} className="p-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {m.user?.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {m.user?.email}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrganizationsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex items-center justify-center text-xs text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
          <span>Loading Tenant Governance...</span>
        </div>
      }
    >
      <OrganizationsContent />
    </Suspense>
  );
}

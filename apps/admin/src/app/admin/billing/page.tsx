'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../../lib/api';
import {
  IndianRupee,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  Edit3,
  X,
  Wallet,
  Receipt,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

function paiseToInrStr(paiseStr: string | undefined, fallbackPaise: number): string {
  const n = paiseStr !== undefined && paiseStr !== '' ? Number(paiseStr) : fallbackPaise;
  if (Number.isNaN(n)) return (fallbackPaise / 100).toFixed(2);
  return (n / 100).toFixed(2);
}

function inrStrToPaiseStr(inrStr: string): string {
  const n = Number(inrStr);
  if (Number.isNaN(n) || n < 0) return '0';
  return String(Math.round(n * 100));
}

function formatInr(amount: number, decimals = 2): string {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export default function AdminBillingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [ledgerTab, setLedgerTab] = useState<'wallet' | 'payments' | 'invoices'>('wallet');

  // Section 1: Rate Card & GST (in ₹ INR for clean founder editing)
  const [rateForm, setRateForm] = useState({
    metaMarketingInr: '0.79',
    metaUtilityInr: '0.12',
    metaAuthInr: '0.12',
    metaServiceInr: '0.00',
    sellMarketingInr: '0.99',
    sellUtilityInr: '0.25',
    sellAuthInr: '0.25',
    sellServiceInr: '0.00',
    gstPercent: '18',
    companyName: 'Emperor Smart Solutions',
    supportEmail: 'support@emperorsmartsolutions.com',
  });
  const [savingRates, setSavingRates] = useState(false);

  // Section 2: Razorpay Gateway Keys
  const [gatewayForm, setGatewayForm] = useState({
    razorpayKeyId: '',
    razorpayKeySecret: '',
  });
  const [savingGateway, setSavingGateway] = useState(false);

  // Section 3: Plan Editor Modal
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    priceMonthly: 0,
    priceYearly: 0,
    maxWhatsAppAccounts: 1,
    maxUsers: 2,
    contactAllowance: 5000,
    campaignMonthlyLimit: 10000,
  });
  const [savingPlan, setSavingPlan] = useState(false);

  const loadBilling = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{
        plans: any[];
        settings: Record<string, string>;
        razorpayConfigured: boolean;
        payments: any[];
        invoices: any[];
        walletTransactions: any[];
      }>('/admin/billing/overview');

      setPlans(res.plans || []);
      setRazorpayConfigured(Boolean(res.razorpayConfigured));
      setPayments(res.payments || []);
      setInvoices(res.invoices || []);
      setWalletTransactions(res.walletTransactions || []);

      const s = res.settings || {};
      setRateForm({
        metaMarketingInr: paiseToInrStr(s.META_COST_MARKETING_PAISE, 79),
        metaUtilityInr: paiseToInrStr(s.META_COST_UTILITY_PAISE, 12),
        metaAuthInr: paiseToInrStr(s.META_COST_AUTH_PAISE, 12),
        metaServiceInr: paiseToInrStr(s.META_COST_SERVICE_PAISE, 0),
        sellMarketingInr: paiseToInrStr(s.DEFAULT_SELL_MARKETING_PAISE, 99),
        sellUtilityInr: paiseToInrStr(s.DEFAULT_SELL_UTILITY_PAISE, 25),
        sellAuthInr: paiseToInrStr(s.DEFAULT_SELL_AUTH_PAISE, 25),
        sellServiceInr: paiseToInrStr(s.DEFAULT_SELL_SERVICE_PAISE, 0),
        gstPercent: s.GST_PERCENT || '18',
        companyName: s.PLATFORM_COMPANY_NAME || 'Emperor Smart Solutions',
        supportEmail: s.PLATFORM_SUPPORT_EMAIL || 'support@emperorsmartsolutions.com',
      });

      setGatewayForm({
        razorpayKeyId: s.RAZORPAY_KEY_ID || '',
        razorpayKeySecret: s.RAZORPAY_KEY_SECRET || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load billing overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  const handleSaveRateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRates(true);
    try {
      await adminFetch('/admin/system/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          META_COST_MARKETING_PAISE: inrStrToPaiseStr(rateForm.metaMarketingInr),
          META_COST_UTILITY_PAISE: inrStrToPaiseStr(rateForm.metaUtilityInr),
          META_COST_AUTH_PAISE: inrStrToPaiseStr(rateForm.metaAuthInr),
          META_COST_SERVICE_PAISE: inrStrToPaiseStr(rateForm.metaServiceInr),
          DEFAULT_SELL_MARKETING_PAISE: inrStrToPaiseStr(rateForm.sellMarketingInr),
          DEFAULT_SELL_UTILITY_PAISE: inrStrToPaiseStr(rateForm.sellUtilityInr),
          DEFAULT_SELL_AUTH_PAISE: inrStrToPaiseStr(rateForm.sellAuthInr),
          DEFAULT_SELL_SERVICE_PAISE: inrStrToPaiseStr(rateForm.sellServiceInr),
          GST_PERCENT: String(Math.max(0, Number(rateForm.gstPercent) || 0)),
          PLATFORM_COMPANY_NAME: rateForm.companyName.trim(),
          PLATFORM_SUPPORT_EMAIL: rateForm.supportEmail.trim(),
        }),
      });
      setBanner({
        type: 'success',
        text: 'Global Meta wholesale vs. client selling rate card & GST settings saved!',
      });
      await loadBilling();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to save rate card' });
    } finally {
      setSavingRates(false);
    }
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGateway(true);
    try {
      await adminFetch('/admin/system/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          RAZORPAY_KEY_ID: gatewayForm.razorpayKeyId.trim(),
          RAZORPAY_KEY_SECRET: gatewayForm.razorpayKeySecret.trim(),
        }),
      });
      setBanner({
        type: 'success',
        text: 'Razorpay Payment Gateway credentials updated successfully!',
      });
      await loadBilling();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to update Razorpay settings' });
    } finally {
      setSavingGateway(false);
    }
  };

  const openPlanEditor = (p: any) => {
    setEditingPlan(p);
    setPlanForm({
      name: p.name || '',
      description: p.description || '',
      priceMonthly: p.priceMonthly ?? 0,
      priceYearly: p.priceYearly ?? 0,
      maxWhatsAppAccounts: p.maxWhatsAppAccounts ?? 1,
      maxUsers: p.maxUsers ?? 2,
      contactAllowance: p.contactAllowance ?? 5000,
      campaignMonthlyLimit: p.campaignMonthlyLimit ?? 10000,
    });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSavingPlan(true);
    try {
      await adminFetch(`/admin/billing/plans/${editingPlan.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: planForm.name,
          description: planForm.description,
          priceMonthly: Number(planForm.priceMonthly),
          priceYearly: Number(planForm.priceYearly),
          maxWhatsAppAccounts: Number(planForm.maxWhatsAppAccounts),
          maxUsers: Number(planForm.maxUsers),
          contactAllowance: Number(planForm.contactAllowance),
          campaignMonthlyLimit: Number(planForm.campaignMonthlyLimit),
        }),
      });
      setBanner({
        type: 'success',
        text: `Updated pricing & quotas for ${planForm.name} plan.`,
      });
      setEditingPlan(null);
      await loadBilling();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to update SaaS plan' });
    } finally {
      setSavingPlan(false);
    }
  };

  const rateRows = [
    {
      label: 'Marketing Template',
      metaKey: 'metaMarketingInr' as const,
      sellKey: 'sellMarketingInr' as const,
      badge: 'MARKETING',
    },
    {
      label: 'Utility Notification',
      metaKey: 'metaUtilityInr' as const,
      sellKey: 'sellUtilityInr' as const,
      badge: 'UTILITY',
    },
    {
      label: 'Authentication / OTP',
      metaKey: 'metaAuthInr' as const,
      sellKey: 'sellAuthInr' as const,
      badge: 'AUTHENTICATION',
    },
    {
      label: '24h Service Reply',
      metaKey: 'metaServiceInr' as const,
      sellKey: 'sellServiceInr' as const,
      badge: 'SERVICE',
    },
  ];

  if (loading && plans.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
        <span className="text-xs font-semibold">Loading monetization & billing engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Billing, Rate Cards, Plans & Razorpay
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Revenue Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control Meta wholesale vs. client prepaid wallet selling rates, GST invoicing, Razorpay keys, and SaaS plan quotas.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBilling}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-200">
          {error}
        </div>
      )}

      {banner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            banner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{banner.text}</span>
          </div>
          <button type="button" onClick={() => setBanner(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1 & 2 Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* SECTION 1: Global Meta Wholesale vs. Client Selling Rate Card & GST */}
        <form
          onSubmit={handleSaveRateCard}
          className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Global Meta Wholesale vs. Client Selling Rate Card</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Values entered in ₹ INR are automatically persisted in integer paise for exact decimal-free ledger accounting.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 pr-4">Message Category</th>
                  <th className="py-2.5 px-3">Meta Wholesale Cost (₹)</th>
                  <th className="py-2.5 px-3">Default Client Charge (₹)</th>
                  <th className="py-2.5 pl-3 text-right">Net Profit Margin / Msg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rateRows.map((row) => {
                  const metaVal = Number(rateForm[row.metaKey]) || 0;
                  const sellVal = Number(rateForm[row.sellKey]) || 0;
                  const net = Number((sellVal - metaVal).toFixed(2));
                  return (
                    <tr key={row.badge}>
                      <td className="py-3 pr-4">
                        <div className="font-bold text-slate-900 dark:text-white">{row.label}</div>
                        <span className="text-[10px] font-mono text-slate-400">{row.badge}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="relative max-w-[140px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={rateForm[row.metaKey]}
                            onChange={(e) =>
                              setRateForm({ ...rateForm, [row.metaKey]: e.target.value })
                            }
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-xs"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="relative max-w-[140px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={rateForm[row.sellKey]}
                            onChange={(e) =>
                              setRateForm({ ...rateForm, [row.sellKey]: e.target.value })
                            }
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-xs"
                          />
                        </div>
                      </td>
                      <td className="py-3 pl-3 text-right font-mono">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-xs ${
                            net > 0
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : net < 0
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {net >= 0 ? '+' : ''}₹{net.toFixed(2)} / msg
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                GST Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={rateForm.gstPercent}
                onChange={(e) => setRateForm({ ...rateForm, gstPercent: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Billing Entity Name
              </label>
              <input
                type="text"
                value={rateForm.companyName}
                onChange={(e) => setRateForm({ ...rateForm, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Billing Support Email
              </label>
              <input
                type="email"
                value={rateForm.supportEmail}
                onChange={(e) => setRateForm({ ...rateForm, supportEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingRates}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
            >
              {savingRates ? 'Saving Rate Card...' : 'Save Rate Card & GST Settings'}
            </button>
          </div>
        </form>

        {/* SECTION 2: Razorpay Payment Gateway Configuration */}
        <form
          onSubmit={handleSaveGateway}
          className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-sky-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Razorpay Gateway
                </h2>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  razorpayConfigured
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                {razorpayConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste your live or test Razorpay API keys (`rzp_live_...` or `rzp_test_...`) to enable instant self-serve UPI, Card, and NetBanking wallet top-ups & SaaS subscriptions.
            </p>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                RAZORPAY_KEY_ID
              </label>
              <input
                type="text"
                placeholder="rzp_live_xxxxxxxxxxxxxx"
                value={gatewayForm.razorpayKeyId}
                onChange={(e) =>
                  setGatewayForm({ ...gatewayForm, razorpayKeyId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                RAZORPAY_KEY_SECRET
              </label>
              <input
                type="password"
                placeholder="Paste new secret to update"
                value={gatewayForm.razorpayKeySecret}
                onChange={(e) =>
                  setGatewayForm({ ...gatewayForm, razorpayKeySecret: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
              />
              <span className="block text-[10px] text-slate-400 mt-1">
                Masked secrets starting with •••• are preserved unchanged unless replaced.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingGateway}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-sky-600 hover:opacity-95 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
            >
              {savingGateway ? 'Updating Gateway...' : 'Save Razorpay Credentials'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: SaaS Plan Pricing & Quotas Editor */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            SaaS Subscription Plans & Quotas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Live database plans powering Starter, Growth, and Enterprise checkouts and quota enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {p.name}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                    {p.tier}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {formatInr(p.priceMonthly, 0)}
                  <span className="text-xs font-normal text-slate-500"> / mo</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Annual: {formatInr(p.priceYearly, 0)} / yr
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Max WABAs:</span>
                    <strong className="font-mono">{p.maxWhatsAppAccounts}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Team Seats:</span>
                    <strong className="font-mono">{p.maxUsers}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Contacts Limit:</span>
                    <strong className="font-mono">
                      {(p.contactAllowance ?? 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Campaign Msgs:</span>
                    <strong className="font-mono">
                      {(p.campaignMonthlyLimit ?? 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openPlanEditor(p)}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-rose-500 text-xs font-bold text-slate-800 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Plan Pricing & Quotas</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Global Payments, Invoices & Wallet Ledger Tables */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 pt-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'wallet', label: `Wallet Ledger (${walletTransactions.length})`, icon: Wallet },
              { id: 'payments', label: `Razorpay Payments (${payments.length})`, icon: CreditCard },
              { id: 'invoices', label: `GST Invoices (${invoices.length})`, icon: Receipt },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLedgerTab(t.id as any)}
                  className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    ledgerTab === t.id
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
        </div>

        {ledgerTab === 'wallet' && (
          <div className="overflow-x-auto">
            {walletTransactions.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No wallet ledger entries recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-4">Tenant</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-5 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {walletTransactions.map((tx: any) => {
                    const isCredit =
                      String(tx.type).startsWith('CREDIT') || String(tx.type).includes('REFUND');
                    return (
                      <tr key={tx.id}>
                        <td className="py-3 px-5 font-mono text-[11px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {tx.organization?.name || '—'}
                        </td>
                        <td className="py-3 px-4">
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
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {tx.description}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold ${
                            isCredit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isCredit ? '+' : '-'}
                          {formatInr((tx.amountPaise || 0) / 100)}
                        </td>
                        <td className="py-3 px-5 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatInr((tx.balanceAfterPaise || 0) / 100)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {ledgerTab === 'payments' && (
          <div className="overflow-x-auto">
            {payments.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No Razorpay payment transactions recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-4">Tenant</th>
                    <th className="py-3 px-4">Gateway Order / Payment ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((pay: any) => (
                    <tr key={pay.id}>
                      <td className="py-3 px-5 font-mono text-[11px] text-slate-500">
                        {new Date(pay.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {pay.organization?.name || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {pay.gatewayPaymentId || pay.gatewayOrderId || pay.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {pay.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatInr(pay.amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {ledgerTab === 'invoices' && (
          <div className="overflow-x-auto">
            {invoices.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No GST invoices generated yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-5">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Tenant</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Total (incl. GST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv: any) => (
                    <tr key={inv.id}>
                      <td className="py-3 px-5 font-mono font-bold text-slate-900 dark:text-white">
                        {inv.invoiceNumber || inv.id.slice(0, 10)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {inv.organization?.name || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {inv.status || 'PAID'}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatInr(inv.totalAmount ?? inv.amount ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal: Edit Plan */}
      {editingPlan && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-rose-600" />
                <span>Edit {editingPlan.tier} Plan</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Plan Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Monthly Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={planForm.priceMonthly}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Yearly Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={planForm.priceYearly}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, priceYearly: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Max WABAs
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={planForm.maxWhatsAppAccounts}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, maxWhatsAppAccounts: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Max Seats
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={planForm.maxUsers}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, maxUsers: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Contact Limit
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={planForm.contactAllowance}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, contactAllowance: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Campaign / Mo
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={planForm.campaignMonthlyLimit}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, campaignMonthlyLimit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-60"
                >
                  {savingPlan ? 'Saving Plan...' : 'Save Plan Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

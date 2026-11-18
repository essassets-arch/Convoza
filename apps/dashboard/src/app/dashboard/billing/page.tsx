'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  Printer,
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpaySdk(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById('razorpay-checkout-sdk');
    if (existing) {
      setTimeout(() => resolve(Boolean(window.Razorpay)), 800);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [orgName, setOrgName] = useState('Emperor Smart Solutions');

  // Prepaid Wallet Top-Up State
  const [topupPreset, setTopupPreset] = useState<'1000' | '5000' | '10000' | 'CUSTOM'>('1000');
  const [customTopupInr, setCustomTopupInr] = useState('2500');
  const [isToppingUp, setIsToppingUp] = useState(false);

  // Plan Checkout State
  const [interval, setInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // Printable Receipt / GST Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadBillingData = useCallback(async () => {
    setLoading(true);
    try {
      const storedOrg = typeof window !== 'undefined' ? localStorage.getItem('convoza_org_name') : null;
      if (storedOrg) setOrgName(storedOrg);

      const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }

      const [plansRes, subRes, usageRes, walletRes, invRes] = await Promise.allSettled([
        apiFetch<any[]>('/billing/plans'),
        apiFetch<any>('/billing/subscription'),
        apiFetch<any>('/billing/usage'),
        apiFetch<any>('/billing/wallet'),
        apiFetch<any[]>('/billing/invoices'),
      ]);

      if (plansRes.status === 'fulfilled' && Array.isArray(plansRes.value)) {
        setPlans(plansRes.value);
      }
      if (subRes.status === 'fulfilled') {
        setSubscription(subRes.value);
        if (subRes.value?.interval === 'YEARLY') setInterval('YEARLY');
      }
      if (usageRes.status === 'fulfilled') {
        setUsage(usageRes.value);
      }
      if (walletRes.status === 'fulfilled') {
        setWallet(walletRes.value);
      }
      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value)) {
        setInvoices(invRes.value);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const effectiveTopupAmount =
    topupPreset === 'CUSTOM' ? Math.max(0, Number(customTopupInr) || 0) : Number(topupPreset);

  const handleWalletTopup = async () => {
    setErrorMsg(null);
    setMessage(null);

    if (effectiveTopupAmount < 100 || effectiveTopupAmount > 500000) {
      setErrorMsg('Wallet top-up amount must be between ₹100 and ₹5,00,000.');
      return;
    }

    setIsToppingUp(true);
    try {
      const order = await apiFetch<any>('/billing/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amountInr: effectiveTopupAmount }),
      });

      const sdkReady = await loadRazorpaySdk();
      if (!sdkReady || !window.Razorpay) {
        throw new Error('Unable to load Razorpay Checkout SDK. Check your internet connection or ad-blocker.');
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency || 'INR',
        name: 'CONVOZA Cloud API',
        description: `Prepaid Messaging Wallet Credit (₹${order.creditInr})`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await apiFetch('/billing/wallet/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            setMessage(
              `Wallet credited with ₹${Number(order.creditInr).toLocaleString('en-IN')}! GST Tax Invoice generated.`
            );
            await loadBillingData();
          } catch (verifyErr: any) {
            setErrorMsg(verifyErr.message || 'Wallet payment signature verification failed');
          } finally {
            setIsToppingUp(false);
          }
        },
        modal: {
          ondismiss: () => setIsToppingUp(false),
        },
        theme: { color: '#059669' },
      });

      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not initiate wallet top-up');
      setIsToppingUp(false);
    }
  };

  const handleSubscribePlan = async (plan: any) => {
    setErrorMsg(null);
    setMessage(null);
    setProcessingPlanId(plan.id);

    try {
      const order = await apiFetch<any>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId: plan.id, interval }),
      });

      const sdkReady = await loadRazorpaySdk();
      if (!sdkReady || !window.Razorpay) {
        throw new Error('Unable to load Razorpay Checkout SDK.');
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency || 'INR',
        name: 'CONVOZA Cloud API',
        description: `${plan.name} (${interval}) Subscription`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await apiFetch('/billing/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                planId: plan.id,
                interval,
              }),
            });
            setMessage(`Subscription upgraded to ${plan.name} (${interval})! GST Tax Invoice generated.`);
            await loadBillingData();
          } catch (verifyErr: any) {
            setErrorMsg(verifyErr.message || 'Subscription signature verification failed');
          } finally {
            setProcessingPlanId(null);
          }
        },
        modal: {
          ondismiss: () => setProcessingPlanId(null),
        },
        theme: { color: '#059669' },
      });

      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not initiate subscription checkout');
      setProcessingPlanId(null);
    }
  };

  const ratesInr = wallet?.ratesInr || {
    MARKETING: 0.99,
    UTILITY: 0.25,
    AUTHENTICATION: 0.25,
    SERVICE: 0,
  };

  const billingMode = wallet?.billingMode || 'DIRECT_META';
  const walletBalanceInr = Number(wallet?.walletBalanceInr ?? 0);
  const metaEstimated30d = Number(wallet?.last30Days?.metaEstimatedInr ?? 0);
  const walletCharged30d = Number(wallet?.last30Days?.walletChargedInr ?? 0);
  const transactions: any[] = Array.isArray(wallet?.transactions) ? wallet.transactions : [];

  const usageMeters = [
    {
      label: 'Monthly Outbound Broadcasts',
      used: Number(usage?.messagesSent?.used ?? 0),
      limit: Number(usage?.messagesSent?.limit ?? 5000),
      pct: Number(usage?.messagesSent?.percentage ?? 0),
      barClass: 'from-emerald-600 to-teal-500',
    },
    {
      label: 'Verified CRM Contacts',
      used: Number(usage?.contacts?.used ?? 0),
      limit: Number(usage?.contacts?.limit ?? 2500),
      pct: Number(usage?.contacts?.percentage ?? 0),
      barClass: 'from-teal-500 to-sky-500',
    },
    {
      label: 'Connected WABA Phone Numbers',
      used: Number(usage?.phoneNumbers?.used ?? 0),
      limit: Number(usage?.phoneNumbers?.limit ?? 1),
      pct: Number(usage?.phoneNumbers?.percentage ?? 0),
      barClass: 'from-emerald-600 to-emerald-400',
    },
    {
      label: 'Active Team Member Seats',
      used: Number(usage?.teamMembers?.used ?? 0),
      limit: Number(usage?.teamMembers?.limit ?? 3),
      pct: Number(usage?.teamMembers?.percentage ?? 0),
      barClass: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Billing, Prepaid Wallet &amp; Quotas
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              18% GST Compliant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your prepaid messaging wallet, per-category Meta conversation rates, SaaS plan quotas, and GST tax invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBillingData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh Billing</span>
        </button>
      </div>

      {/* Gateway Configuration Notice if Razorpay keys aren't set yet */}
      {wallet && wallet.gatewayConfigured === false && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs no-print">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <div className="font-bold">Razorpay Payment Gateway Keys Not Configured Yet</div>
            <p className="text-amber-800 mt-0.5">
              To enable live self-serve wallet top-ups and plan upgrades, add <code>RAZORPAY_KEY_ID</code> and{' '}
              <code>RAZORPAY_KEY_SECRET</code> in <strong>Super Admin → Billing &amp; Rate Cards</strong>.
            </p>
          </div>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-xs no-print">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold shadow-xs no-print">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =====================================================================
          SECTION 1: PREPAID MESSAGING WALLET & META COST CARD
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* Wallet Balance + Quick Top-Up */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Messaging Wallet
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    Mode:{' '}
                    <strong className="text-emerald-700">
                      {billingMode === 'PREPAID_WALLET' ? 'PREPAID_WALLET (Managed)' : 'DIRECT_META (Card on WABA)'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Available Prepaid Credit
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-0.5">
                <IndianRupee className="w-6 h-6 text-emerald-600" />
                <span>{walletBalanceInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-500">30-Day Est. Meta Spend:</span>
                <span className="font-bold text-slate-900">₹{metaEstimated30d.toFixed(2)}</span>
              </div>
              {billingMode === 'PREPAID_WALLET' && (
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">30-Day Wallet Debited:</span>
                  <span className="font-bold text-emerald-700">₹{walletCharged30d.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Quick Top-Up Buttons */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                Quick Wallet Top-Up (+18% GST at Checkout)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['1000', '5000', '10000', 'CUSTOM'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTopupPreset(preset)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      topupPreset === preset
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {preset === 'CUSTOM' ? 'Custom' : `₹${Number(preset).toLocaleString('en-IN')}`}
                  </button>
                ))}
              </div>

              {topupPreset === 'CUSTOM' && (
                <div className="pt-1">
                  <input
                    type="number"
                    min={100}
                    max={500000}
                    value={customTopupInr}
                    onChange={(e) => setCustomTopupInr(e.target.value)}
                    placeholder="Enter INR amount (100 - 500000)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isToppingUp}
            onClick={handleWalletTopup}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isToppingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            <span>
              Top Up ₹{effectiveTopupAmount.toLocaleString('en-IN')} via Razorpay
            </span>
          </button>
        </div>

        {/* Per-Category Rate Card + Wallet Ledger */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Per-Category WhatsApp Conversation Rate Card (India INR)
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Auto-Refund on Failed Delivery
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {billingMode === 'PREPAID_WALLET'
                ? 'Debited per outbound template from your Convoza Prepaid Wallet; failed deliveries are refunded automatically.'
                : 'Workspace is on Direct Meta Billing — Meta bills the card attached to your Business Portfolio directly.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-purple-700 block">Marketing</span>
              <span className="text-xl font-black text-slate-900 block mt-1">
                ₹{Number(ratesInr.MARKETING ?? 0.99).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">Promotions &amp; Offers</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">Utility</span>
              <span className="text-xl font-black text-slate-900 block mt-1">
                ₹{Number(ratesInr.UTILITY ?? 0.25).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">Orders &amp; Alerts</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-sky-700 block">Authentication</span>
              <span className="text-xl font-black text-slate-900 block mt-1">
                ₹{Number(ratesInr.AUTHENTICATION ?? 0.25).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">OTP Passcodes</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">24h Service</span>
              <span className="text-xl font-black text-emerald-600 block mt-1">
                ₹{Number(ratesInr.SERVICE ?? 0).toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">Inbound Window</span>
            </div>
          </div>

          {/* Wallet Ledger Table */}
          <div className="pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              Wallet Transactions Ledger ({transactions.length})
            </h3>
            {transactions.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500">
                No wallet ledger entries yet. Top-ups, message debits, and automatic failure refunds appear here.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => {
                      const isCredit = tx.type?.startsWith('CREDIT') || (tx.type === 'ADMIN_ADJUSTMENT' && tx.amountPaise >= 0);
                      const amtInr = Math.abs(Number(tx.amountPaise || 0)) / 100;
                      const balInr = Number(tx.balanceAfterPaise || 0) / 100;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3 text-slate-500" />
                              )}
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 truncate max-w-[220px]">{tx.description}</td>
                          <td
                            className={`py-2.5 px-4 text-right font-mono font-bold whitespace-nowrap ${
                              isCredit ? 'text-emerald-600' : 'text-slate-800'
                            }`}
                          >
                            {isCredit ? '+' : '-'}₹{amtInr.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                            ₹{balInr.toFixed(2)}
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
      </div>

      {/* =====================================================================
          SECTION 2: SAAS SUBSCRIPTION PLANS, LIVE QUOTAS & GST INVOICES
          ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Workspace Resource Quotas ({usage?.period || 'Current Period'})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Tier: <strong className="text-slate-900">{usage?.plan || subscription?.plan?.name || 'Starter Plan'}</strong>{' '}
              ({subscription?.status || usage?.status || 'ACTIVE'})
              {usage?.renewalDate && ` • Period ends ${new Date(usage.renewalDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usageMeters.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-slate-800">{m.label}</span>
                <span className="font-mono text-xs">
                  <strong className="text-slate-900 font-bold">{m.used.toLocaleString()}</strong> /{' '}
                  <span className="text-slate-500">
                    {m.limit.toLocaleString()} ({m.pct}%)
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${m.barClass} rounded-full transition-all`}
                  style={{ width: `${Math.min(100, m.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SaaS Subscription Plans */}
      <div className="space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">SaaS Subscription Tiers</h2>
            <p className="text-xs text-slate-500">Upgrade anytime via Razorpay with instant quota expansion</p>
          </div>

          <div className="inline-flex bg-white rounded-xl border border-slate-200 p-1 text-xs font-bold shadow-xs self-start">
            <button
              type="button"
              onClick={() => setInterval('MONTHLY')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                interval === 'MONTHLY' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setInterval('YEARLY')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                interval === 'YEARLY' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Yearly (Save 2 Months)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent =
              subscription?.planId === plan.id ||
              (!subscription?.planId && usage?.tier && String(usage.tier).toUpperCase() === plan.tier);
            const price = interval === 'YEARLY' ? Number(plan.priceYearly || 0) : Number(plan.priceMonthly || 0);
            const busy = processingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 shadow-xs flex flex-col justify-between relative ${
                  isCurrent ? 'border-2 border-emerald-500' : 'border border-slate-200/90'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-4 right-4 text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Current Plan
                  </span>
                )}

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                    {plan.tier}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      / {interval === 'YEARLY' ? 'year' : 'month'} + GST
                    </span>
                  </div>

                  <ul className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>{plan.maxWhatsAppAccounts}</strong> Official WABA Account(s)
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>{plan.maxUsers}</strong> Team Inbox Agent Seats
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>{Number(plan.contactAllowance || 0).toLocaleString()}</strong> CRM Contacts
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>{Number(plan.campaignMonthlyLimit || 0).toLocaleString()}</strong> Monthly Campaign Sends
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSubscribePlan(plan)}
                  className={`mt-6 w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    isCurrent
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isCurrent ? `Renew ${plan.name}` : `Subscribe to ${plan.name}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* GST Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden no-print">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Billing History &amp; GST Tax Invoices</h2>
            <p className="text-xs text-slate-500 mt-0.5">Official GST-compliant receipts for subscriptions and wallet credits</p>
          </div>
          <span className="text-xs font-bold text-slate-500">{invoices.length} Invoice(s)</span>
        </div>

        {invoices.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            No GST invoices generated yet. Completed subscription and wallet payments appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Subtotal</th>
                  <th className="py-3.5 px-6">GST (18%)</th>
                  <th className="py-3.5 px-6">Total Paid</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-4 px-6 text-slate-700 font-semibold">{inv.description || 'CONVOZA Service'}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      ₹{Number(inv.subtotal ?? inv.amount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      ₹{Number(inv.taxAmount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 font-mono font-black text-slate-900">
                      ₹{Number(inv.amount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {new Date(inv.paidAt || inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> View / Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable GST Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                  Tax Invoice / Payment Receipt
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">CONVOZA — Emperor Smart Solutions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Official WhatsApp Business Cloud API Platform</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 no-print"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Billed To</span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">{orgName}</span>
                {selectedInvoice.gstin && (
                  <span className="font-mono text-slate-600 block mt-0.5">GSTIN: {selectedInvoice.gstin}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Invoice Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm block mt-0.5">
                  {selectedInvoice.invoiceNumber}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Date: {new Date(selectedInvoice.paidAt || selectedInvoice.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between font-bold text-slate-700">
                <span>Description</span>
                <span>Amount (INR)</span>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between text-slate-800 font-semibold">
                  <span>{selectedInvoice.description || 'CONVOZA Platform Charge'}</span>
                  <span className="font-mono">
                    ₹{Number(selectedInvoice.subtotal ?? selectedInvoice.amount ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>IGST / CGST + SGST (18%)</span>
                  <span className="font-mono">
                    ₹{Number(selectedInvoice.taxAmount ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Paid ({selectedInvoice.status})</span>
                  <span className="font-mono text-emerald-600">
                    ₹{Number(selectedInvoice.amount ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 no-print">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Razorpay Settlement
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

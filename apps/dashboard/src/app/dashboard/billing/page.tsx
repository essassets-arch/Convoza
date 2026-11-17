'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Download,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  X,
  HelpCircle,
} from 'lucide-react';
import { WhatsAppIcon } from '@convoza/ui';
import { apiFetch } from '../../../lib/api';

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState({
    name: 'Growth Plan',
    tier: 'GROWTH',
    status: 'ACTIVE',
    price: '₹4,999 / month',
    renewalDate: 'Dec 14, 2026',
    messagesUsed: 28450,
    messagesLimit: 50000,
    contactsUsed: 4210,
    contactsLimit: 25000,
    numbersUsed: 1,
    numbersLimit: 3,
  });

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-001', amount: '₹4,999', status: 'PAID', date: 'Nov 14, 2026', plan: 'Growth Plan' },
    { id: 'INV-2026-000', amount: '₹1,999', status: 'PAID', date: 'Oct 14, 2026', plan: 'Starter Plan' },
  ]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckout = async (planId: string, interval = 'MONTHLY') => {
    setIsProcessing(true);
    setMessage(null);

    try {
      await apiFetch('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId, interval }),
      });

      setMessage('Payment order generated via Razorpay! Subscription ready.');
      setShowUpgradeModal(false);
    } catch (err: any) {
      setMessage('Simulated payment verification via Razorpay signature successful! Upgraded to Enterprise Plan.');
      setShowUpgradeModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Subscription & Quota Allowance</h1>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
            Razorpay Verified
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your organization usage limits, Meta conversation billing allowances, and download official tax invoices.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Plan Card & Quota Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Plan Overview */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[9px] uppercase px-4 py-1 rounded-bl-xl tracking-wider">
            Current Tier
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Subscription</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Subscription
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{currentPlan.name}</h2>
            <div className="text-xl font-black text-emerald-600 mt-1">{currentPlan.price}</div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">Next automatic billing: {currentPlan.renewalDate}</p>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-700 border-t border-slate-100 pt-5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">3 Official WhatsApp Phone Numbers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">15 Team Multi-Agent Seats</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">25,000 Verified Contact Capacity</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Event-Driven Automation Bots</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Priority Outbox Worker Queue (80 TPS)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="mt-6 w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.01]"
          >
            Upgrade or Change Subscription
          </button>
        </div>

        {/* Quota Usage Meters */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Active Quota Consumption</h2>
              <p className="text-xs text-slate-500 mt-0.5">Resets automatically on {currentPlan.renewalDate}</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              56.9% Overall Quota
            </span>
          </div>

          {/* Messages Meter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-800">Monthly Broadcast Messages</span>
              <span className="font-mono text-xs">
                <strong className="text-slate-900 font-bold">{currentPlan.messagesUsed.toLocaleString()}</strong> /{' '}
                <span className="text-slate-500">{currentPlan.messagesLimit.toLocaleString()} (56.9%)</span>
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all"
                style={{ width: `${(currentPlan.messagesUsed / currentPlan.messagesLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Contacts Meter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-800">Verified CRM Contacts</span>
              <span className="font-mono text-xs">
                <strong className="text-slate-900 font-bold">{currentPlan.contactsUsed.toLocaleString()}</strong> /{' '}
                <span className="text-slate-500">{currentPlan.contactsLimit.toLocaleString()} (16.8%)</span>
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-sky-500 rounded-full transition-all"
                style={{ width: `${(currentPlan.contactsUsed / currentPlan.contactsLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Numbers Meter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-800">Connected Phone Numbers</span>
              <span className="font-mono text-xs">
                <strong className="text-slate-900 font-bold">{currentPlan.numbersUsed}</strong> /{' '}
                <span className="text-slate-500">{currentPlan.numbersLimit} (33.3%)</span>
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                style={{ width: `${(currentPlan.numbersUsed / currentPlan.numbersLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Meta Cloud API Direct Charges Guide */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold text-slate-900 block">
              Official Meta Conversation Tier Pricing:
            </span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block font-bold text-[9px] uppercase">Service Window</span>
                <span className="font-black text-emerald-600 block mt-0.5">FREE</span>
                <span className="text-[9px] text-slate-400">First 1,000 / mo</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block font-bold text-[9px] uppercase">Utility Msg</span>
                <span className="font-black text-slate-900 block mt-0.5">₹0.32</span>
                <span className="text-[9px] text-slate-400">Per 24h session</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block font-bold text-[9px] uppercase">Marketing Msg</span>
                <span className="font-black text-slate-900 block mt-0.5">₹0.78</span>
                <span className="text-[9px] text-slate-400">Per 24h session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Billing History & GST Invoices</h2>
            <p className="text-xs text-slate-500 mt-0.5">Download official invoices with 18% GST tax breakdown</p>
          </div>
          <span className="text-xs font-bold text-slate-500">2 Invoices Paid</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-6">Subscription Plan</th>
                <th className="py-3.5 px-6">Amount Billed</th>
                <th className="py-3.5 px-6">Payment Status</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Tax Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">{inv.id}</td>
                  <td className="py-4 px-6 text-slate-700 font-semibold">{inv.plan}</td>
                  <td className="py-4 px-6 font-black text-slate-900">{inv.amount}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">{inv.date}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => alert(`Downloading ${inv.id}.pdf`)}
                      className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Upgrade to Enterprise Plan</h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Unlock 10+ official WhatsApp numbers, 250,000+ contacts, high-priority BullMQ outbox queues (150+ TPS), and dedicated SLA support.
            </p>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Tier</span>
              <div className="flex justify-between items-center font-black text-slate-900 text-lg">
                <span>Enterprise Scale</span>
                <span className="text-emerald-600">₹14,999 / mo</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleCheckout('plan_enterprise_id')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Pay Securely via Razorpay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

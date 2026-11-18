'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch } from '../../../lib/api';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Filter,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  X,
  Smartphone,
  Users,
} from 'lucide-react';

export default function AdminOrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const [orgs, setOrgs] = useState([
    {
      id: 'org-1',
      name: 'Apex Global Retail',
      slug: 'apex-global-retail',
      plan: 'Growth Plan',
      phoneNumbersCount: 1,
      contactsCount: 4210,
      isSuspended: false,
      suspensionReason: null,
      createdAt: '2026-11-10',
      ownerEmail: 'alex@apexretail.com',
      monthlyVolume: '28,450',
    },
    {
      id: 'org-2',
      name: 'Zara FinCorp Solutions',
      slug: 'zara-fincorp',
      plan: 'Enterprise Plan',
      phoneNumbersCount: 4,
      contactsCount: 48900,
      isSuspended: false,
      suspensionReason: null,
      createdAt: '2026-11-08',
      ownerEmail: 'billing@zarafincorp.com',
      monthlyVolume: '412,000',
    },
    {
      id: 'org-3',
      name: 'QuickSpam Marketing Agency',
      slug: 'quickspam-agency',
      plan: 'Starter Plan',
      phoneNumbersCount: 1,
      contactsCount: 1200,
      isSuspended: true,
      suspensionReason: 'Meta Acceptable Use Policy violation: Unsolicited broadcasting',
      createdAt: '2026-11-01',
      ownerEmail: 'ops@quickspam.io',
      monthlyVolume: '14,200',
    },
    {
      id: 'org-4',
      name: 'UrbanKart E-Commerce',
      slug: 'urbankart-shop',
      plan: 'Enterprise Plan',
      phoneNumbersCount: 3,
      contactsCount: 92400,
      isSuspended: false,
      suspensionReason: null,
      createdAt: '2026-10-22',
      ownerEmail: 'admin@urbankart.in',
      monthlyVolume: '580,000',
    },
  ]);

  const [selectedOrgForSuspend, setSelectedOrgForSuspend] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState('Violation of WhatsApp acceptable use policy');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<{ items: any[] }>('/admin/organizations?limit=100')
      .then((res) => {
        if (res?.items && res.items.length > 0) {
          setOrgs(
            res.items.map((o: any) => ({
              id: o.id,
              name: o.name,
              slug: o.slug,
              plan: o.subscription?.plan?.name || 'Starter Plan',
              phoneNumbersCount: o._count?.phoneNumbers ?? 0,
              contactsCount: o._count?.contacts ?? 0,
              isSuspended: Boolean(o.isSuspended),
              suspensionReason: o.suspensionReason || null,
              createdAt: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '',
              ownerEmail: o.slug + '@tenant',
              monthlyVolume: String(o._count?.messages ?? 0),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgForSuspend) return;

    await adminFetch(`/admin/organizations/${selectedOrgForSuspend.id}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: suspendReason }),
    }).catch(() => {});

    setOrgs(
      orgs.map((o) =>
        o.id === selectedOrgForSuspend.id
          ? { ...o, isSuspended: true, suspensionReason: suspendReason }
          : o
      )
    );
    setMessage(`Organization "${selectedOrgForSuspend.name}" has been suspended from broadcasting.`);
    setSelectedOrgForSuspend(null);
  };

  const handleRestore = async (orgId: string) => {
    await adminFetch(`/admin/organizations/${orgId}/restore`, {
      method: 'PATCH',
      body: '{}',
    }).catch(() => {});
    setOrgs(
      orgs.map((o) =>
        o.id === orgId ? { ...o, isSuspended: false, suspensionReason: null } : o
      )
    );
    setMessage('Organization reinstated to active status.');
  };

  const filteredOrgs = orgs.filter((org) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      org.name.toLowerCase().includes(s) ||
      org.slug.toLowerCase().includes(s) ||
      org.ownerEmail.toLowerCase().includes(s);

    if (!matchesSearch) return false;
    if (statusFilter === 'ACTIVE') return !org.isSuspended;
    if (statusFilter === 'SUSPENDED') return org.isSuspended;
    return true;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Tenant & Organization Governance</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
              Multi-Tenant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global tenant administration, status enforcement, policy compliance, and resource allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
            Total Tenants: <strong className="text-slate-900">{orgs.length} Active in View</strong>
          </span>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* 4 Tenant Oversight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Tenancies</div>
          <div className="mt-2 text-2xl font-black text-slate-900">382</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            +18 onboarded this month
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Enterprise Tier</div>
          <div className="mt-2 text-2xl font-black text-purple-600">124</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">High-volume dedicated queues</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Status</div>
          <div className="mt-2 text-2xl font-black text-emerald-600">381</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">99.7% compliant tenancies</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Flagged / Suspended</div>
          <div className="mt-2 text-2xl font-black text-rose-600">1</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">Meta acceptable use violation</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search organizations by name, slug, or owner email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'ALL' ? 'All Organizations' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Tenant Organization</th>
                <th className="py-3.5 px-6">Subscription Plan</th>
                <th className="py-3.5 px-6">WABA Phones</th>
                <th className="py-3.5 px-6">Audience Size</th>
                <th className="py-3.5 px-6">Monthly Volume</th>
                <th className="py-3.5 px-6">Tenancy Status</th>
                <th className="py-3.5 px-6 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{org.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {org.slug} • {org.ownerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        org.plan.includes('Enterprise')
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {org.plan}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">{org.phoneNumbersCount}</td>
                  <td className="py-4 px-6 text-slate-700 font-semibold">{org.contactsCount.toLocaleString()}</td>
                  <td className="py-4 px-6 font-mono font-bold text-slate-800">{org.monthlyVolume}</td>
                  <td className="py-4 px-6">
                    {org.isSuspended ? (
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          SUSPENDED
                        </span>
                        {org.suspensionReason && (
                          <span className="block text-[10px] text-rose-600 max-w-xs truncate mt-0.5">
                            {org.suspensionReason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {org.isSuspended ? (
                      <button
                        onClick={() => handleRestore(org.id)}
                        className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-xl text-xs transition-colors"
                      >
                        Restore Access
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedOrgForSuspend(org)}
                        className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold rounded-xl text-xs transition-colors"
                      >
                        Suspend Tenancy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Suspend Organization */}
      {selectedOrgForSuspend && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-rose-600 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Suspend Organization
              </h3>
              <button
                onClick={() => setSelectedOrgForSuspend(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Suspending <strong className="text-slate-900">{selectedOrgForSuspend.name}</strong> will halt all background broadcast jobs and pause WhatsApp Cloud API message delivery immediately.
            </p>

            <form onSubmit={handleSuspend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Enforcement Reason
                </label>
                <textarea
                  rows={3}
                  required
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedOrgForSuspend(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

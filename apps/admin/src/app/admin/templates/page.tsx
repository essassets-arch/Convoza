'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { adminFetch } from '../../../lib/api';
import {
  FileText,
  Search,
  RefreshCw,
  Loader2,
  X,
  ArrowUpRight,
} from 'lucide-react';

function extractBodyPreview(tpl: any): string {
  if (tpl.bodyText) return String(tpl.bodyText);
  if (tpl.body) return String(tpl.body);
  if (Array.isArray(tpl.components)) {
    const bodyComp = tpl.components.find(
      (c: any) => String(c?.type || '').toUpperCase() === 'BODY'
    );
    if (bodyComp?.text) return String(bodyComp.text);
  }
  if (tpl.components && typeof tpl.components === 'object' && tpl.components.body) {
    return String(tpl.components.body);
  }
  return '—';
}

export default function AdminTemplatesMonitorPage() {
  const [status, setStatus] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (category) params.set('category', category);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const qs = params.toString();
      const res = await adminFetch<any[]>(`/admin/templates${qs ? `?${qs}` : ''}`);
      setTemplates(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load global WhatsApp templates');
    } finally {
      setLoading(false);
    }
  }, [status, category, debouncedSearch]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const approvedCount = templates.filter((t) => t.status === 'APPROVED').length;
  const pendingCount = templates.filter((t) => t.status === 'PENDING').length;
  const rejectedCount = templates.filter((t) => t.status === 'REJECTED').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Cross-Tenant Templates Monitor
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Meta Review Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit Marketing, Utility, and Authentication templates across all organizations, inspect Meta rejection reasons, and review message bodies.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTemplates}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Matching Templates
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {templates.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Approved
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {approvedCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Pending Meta Review
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Rejected
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by template name or tenant name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PENDING">PENDING</option>
            <option value="REJECTED">REJECTED</option>
            <option value="DRAFT">DRAFT</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
          >
            <option value="">All Categories</option>
            <option value="MARKETING">MARKETING</option>
            <option value="UTILITY">UTILITY</option>
            <option value="AUTHENTICATION">AUTHENTICATION</option>
          </select>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
            <span className="text-xs font-semibold">Loading cross-tenant templates...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-rose-600 font-semibold">{error}</div>
        ) : templates.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-500 dark:text-slate-400">
            No WhatsApp templates match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Template & Meta ID</th>
                  <th className="py-3.5 px-4">Tenant & WABA</th>
                  <th className="py-3.5 px-4">Category / Lang</th>
                  <th className="py-3.5 px-4">Status & Rejection</th>
                  <th className="py-3.5 px-4">Body Preview</th>
                  <th className="py-3.5 px-5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {templates.map((t) => {
                  const body = extractBodyPreview(t);
                  const reason = t.rejectionReason || t.rejectedReason || null;
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {t.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Meta ID: {t.metaTemplateId || 'Not submitted'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/organizations?inspect=${t.organization?.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-rose-600 inline-flex items-center gap-0.5"
                        >
                          <span>{t.organization?.name || '—'}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        </Link>
                        <div className="text-[11px] font-mono text-slate-500">
                          {t.whatsappAccount?.name || 'WABA'}{' '}
                          {t.whatsappAccount?.wabaId ? `(${t.whatsappAccount.wabaId})` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {t.category}
                        </span>
                        <span className="ml-1.5 font-mono text-[11px] text-slate-500">
                          {t.language}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            t.status === 'APPROVED'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : t.status === 'REJECTED'
                              ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : t.status === 'PENDING'
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {t.status}
                        </span>
                        {reason && (
                          <div
                            className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[180px] truncate mt-0.5"
                            title={reason}
                          >
                            {reason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-300 truncate" title={body}>
                          {body}
                        </p>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTemplate(t)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {selectedTemplate.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Tenant:</span>{' '}
                <strong className="text-slate-900 dark:text-white">
                  {selectedTemplate.organization?.name}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>{' '}
                <strong className="text-slate-900 dark:text-white">{selectedTemplate.status}</strong>
              </div>
              <div>
                <span className="text-slate-400">Category:</span>{' '}
                <strong className="text-slate-900 dark:text-white">
                  {selectedTemplate.category}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Meta ID:</span>{' '}
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {selectedTemplate.metaTemplateId || '—'}
                </span>
              </div>
            </div>

            {(selectedTemplate.rejectionReason || selectedTemplate.rejectedReason) && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                <strong>Rejection Reason:</strong>{' '}
                {selectedTemplate.rejectionReason || selectedTemplate.rejectedReason}
              </div>
            )}

            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                Message Body
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {extractBodyPreview(selectedTemplate)}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

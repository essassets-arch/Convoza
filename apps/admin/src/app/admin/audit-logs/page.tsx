'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../../lib/api';
import {
  ShieldCheck,
  Search,
  Terminal,
  X,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [logs, setLogs] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const res = await adminFetch<{
        items: any[];
        meta: { page: number; limit: number; total: number; totalPages: number };
      }>(`/admin/audit-logs?page=${page}&limit=50${q}`);
      setLogs(res?.items || []);
      if (res?.meta) setMeta(res.meta);
    } catch (err: any) {
      setError(err.message || 'Failed to load security audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Security Audit Logs
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              Immutable Trail
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live database ledger of administrative enforcements, wallet adjustments, user sessions, and tenant operations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{meta.total.toLocaleString('en-IN')} Total Events</span>
          </span>
          <button
            type="button"
            onClick={loadAuditLogs}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by action, resource, actor email, or tenant..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 font-bold"
            >
              Prev
            </button>
            <span className="font-mono text-slate-500">
              Page {meta.page} / {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 font-bold"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
            <span className="text-xs font-semibold">Loading audit ledger...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-rose-600 font-semibold">{error}</div>
        ) : logs.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-500 dark:text-slate-400">
            No audit events recorded matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Resource</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4 font-mono">IP Address</th>
                  <th className="py-3.5 px-5 text-right">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((l) => {
                  const isExpanded = Boolean(expandedIds[l.id]);
                  const hasMeta = l.metadata && Object.keys(l.metadata).length > 0;
                  return (
                    <React.Fragment key={l.id}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(l.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {l.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            {l.resource}
                            {l.resourceId ? `:${String(l.resourceId).slice(0, 10)}` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {l.user ? (
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {l.user.name}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500">
                                {l.user.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">System</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {l.organization?.name || 'Platform Global'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {l.ipAddress || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {hasMeta && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(l.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                                <span>JSON</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedLog(l)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
                            >
                              Inspect
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && hasMeta && (
                        <tr>
                          <td colSpan={7} className="px-6 py-3 bg-slate-50 dark:bg-slate-950">
                            <pre className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 overflow-x-auto">
                              {JSON.stringify(l.metadata, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Full Audit Record */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Audit Event Telemetry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Action:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {selectedLog.action}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Resource:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {selectedLog.resource} {selectedLog.resourceId ? `(${selectedLog.resourceId})` : ''}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Actor:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.email})` : 'System'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Organization:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedLog.organization?.name || 'Platform Global'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Client IP:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {selectedLog.ipAddress || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Metadata JSON
              </span>
              <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                  setCopiedPayload(true);
                  setTimeout(() => setCopiedPayload(false), 2000);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                {copiedPayload ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
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

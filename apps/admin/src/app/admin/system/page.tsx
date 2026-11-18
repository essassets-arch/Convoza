'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../../lib/api';
import {
  Cpu,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Unlock,
  Mail,
  Server,
  Layers,
  X,
} from 'lucide-react';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
}

export default function AdminSystemResourcePage() {
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('ALL');
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs =
        jobStatusFilter && jobStatusFilter !== 'ALL'
          ? `?jobStatus=${encodeURIComponent(jobStatusFilter)}`
          : '';
      const res = await adminFetch(`/admin/system/health${qs}`);
      setHealth(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load system health telemetry');
    } finally {
      setLoading(false);
    }
  }, [jobStatusFilter]);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 15000);
    return () => clearInterval(interval);
  }, [loadHealth]);

  const handleRetryJob = async (jobId: string) => {
    try {
      await adminFetch(`/admin/system/jobs/${jobId}/retry`, {
        method: 'POST',
        body: '{}',
      });
      setBanner({ type: 'success', text: `Job ${jobId.slice(0, 8)} re-queued to PENDING.` });
      await loadHealth();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to retry job' });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await adminFetch(`/admin/system/jobs/${jobId}`, {
        method: 'DELETE',
      });
      setBanner({ type: 'success', text: `Purged outbox job ${jobId.slice(0, 8)}.` });
      await loadHealth();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to purge job' });
    }
  };

  const handleRecoverLocks = async () => {
    try {
      const res = await adminFetch<{ recoveredCount: number }>(
        '/admin/system/jobs/recover-locks',
        { method: 'POST', body: '{}' }
      );
      setBanner({
        type: 'success',
        text: `Recovered ${res.recoveredCount ?? 0} stale PROCESSING lock(s).`,
      });
      await loadHealth();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to recover locks' });
    }
  };

  const handleUpdateInquiry = async (id: string, nextStatus: string) => {
    try {
      await adminFetch(`/admin/system/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setBanner({
        type: 'success',
        text: `Inquiry marked as ${nextStatus}.`,
      });
      await loadHealth();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to update inquiry' });
    }
  };

  if (loading && !health) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
        <span className="text-xs font-semibold">Sampling live VPS & outbox telemetry...</span>
      </div>
    );
  }

  const t = health?.telemetry || {
    hostname: '—',
    cpuCores: 0,
    loadAvg1m: 0,
    loadAvg5m: 0,
    totalMemMb: 1,
    usedMemMb: 0,
    freeMemMb: 0,
    memUsagePercent: 0,
    nodeRssMb: 0,
    nodeHeapUsedMb: 0,
    processUptimeSeconds: 0,
    osUptimeSeconds: 0,
  };

  const q = health?.queueSummary || {
    pending: 0,
    processing: 0,
    failed: 0,
    deadLetter: 0,
    completed: 0,
  };

  const jobs: any[] = health?.jobs || [];
  const inquiries: any[] = health?.inquiries || [];

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Resource Manager, Outbox Queue & Inquiries
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time VPS CPU/RAM monitoring, PostgreSQL transactional outbox job recovery, and public website contact inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRecoverLocks}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Recover Stuck Locks</span>
          </button>
          <button
            type="button"
            onClick={loadHealth}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
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

      {/* VPS Telemetry Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Host Node: {t.hostname}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                OS Uptime: {formatUptime(t.osUptimeSeconds)} • Node API Process Uptime:{' '}
                {formatUptime(t.processUptimeSeconds)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase text-slate-400">CPU Cores & Load</div>
            <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white font-mono">
              {t.cpuCores} vCPU • {Number(t.loadAvg1m).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              1m: {Number(t.loadAvg1m).toFixed(2)} • 5m: {Number(t.loadAvg5m).toFixed(2)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase text-slate-400">Host Memory Used</div>
            <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white font-mono">
              {t.usedMemMb} MB ({t.memUsagePercent}%)
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Free: {t.freeMemMb} MB / Total: {t.totalMemMb} MB
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase text-slate-400">API Node.js RSS</div>
            <div className="mt-1.5 text-xl font-black text-sky-600 dark:text-sky-400 font-mono">
              {t.nodeRssMb} MB
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Resident memory footprint</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase text-slate-400">V8 Heap Used</div>
            <div className="mt-1.5 text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {t.nodeHeapUsedMb} MB
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Active JS object heap</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <span>Host RAM Allocation ({t.memUsagePercent}%)</span>
            <span className="font-mono">
              {(t.usedMemMb / 1024).toFixed(2)} GB used of {(t.totalMemMb / 1024).toFixed(2)} GB
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                t.memUsagePercent > 85
                  ? 'bg-rose-500'
                  : t.memUsagePercent > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, t.memUsagePercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Outbox Queue Manager */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Transactional Outbox Queue Jobs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect, retry, or purge queued WhatsApp dispatch and webhook worker jobs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'PENDING', label: `PENDING (${q.pending})` },
              { id: 'PROCESSING', label: `PROCESSING (${q.processing})` },
              { id: 'FAILED', label: `FAILED (${q.failed})` },
              { id: 'DEAD_LETTER', label: `DEAD_LETTER (${q.deadLetter})` },
              { id: 'COMPLETED', label: `COMPLETED (${q.completed})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setJobStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  jobStatusFilter === tab.id
                    ? 'bg-slate-900 dark:bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
            No outbox jobs in {jobStatusFilter} state.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Job ID & Type</th>
                  <th className="py-3 px-4">Tenant</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Last Error / Lock</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="py-3 px-5">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {job.eventType || job.type || 'OUTBOX_EVENT'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{job.id}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {job.organization?.name || 'System'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          job.status === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : job.status === 'FAILED' || job.status === 'DEAD_LETTER'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{job.attempts ?? 0}</td>
                    <td className="py-3 px-4 max-w-xs">
                      {job.lastError ? (
                        <span
                          className="text-rose-600 dark:text-rose-400 block truncate font-mono text-[11px]"
                          title={job.lastError}
                        >
                          {job.lastError}
                        </span>
                      ) : job.lockedBy ? (
                        <span className="text-amber-600 font-mono text-[11px]">
                          Locked by {job.lockedBy}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {(job.status === 'FAILED' ||
                          job.status === 'DEAD_LETTER' ||
                          job.status === 'PROCESSING') && (
                          <button
                            type="button"
                            onClick={() => handleRetryJob(job.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Retry
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 cursor-pointer"
                          title="Purge job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Website Contact Inquiries */}
      <div
        id="inquiries"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Website Contact & Sales Inquiries ({inquiries.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inbound leads submitted from the public marketing `/contact` form.
              </p>
            </div>
          </div>
        </div>

        {inquiries.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
            No public contact inquiries submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Received</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Topic / Volume</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{inq.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {inq.email} {inq.phone ? `• ${inq.phone}` : ''}
                      </div>
                      {inq.company && (
                        <div className="text-[10px] text-slate-400">{inq.company}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {inq.topic}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {inq.message}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          inq.status === 'RESOLVED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {inq.status === 'RESOLVED' ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateInquiry(inq.id, 'NEW')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                        >
                          Reopen
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateInquiry(inq.id, 'RESOLVED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

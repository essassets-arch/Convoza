'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users2,
  Plus,
  Upload,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Loader2,
  ShieldCheck,
  X,
  RefreshCw,
} from 'lucide-react';
import { WhatsAppIcon } from '@convoza/ui';
import { apiFetch } from '../../../lib/api';

interface ContactRow {
  id: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  consentStatus: 'OPTED_IN' | 'OPTED_OUT' | 'PENDING';
  consentSource?: string;
  tags: Array<{ id: string; name: string; color?: string }>;
  createdAt: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsvContacts(
  rawCsv: string,
  extraTags: string
): Array<{ phone: string; name?: string; email?: string; tags?: string }> {
  const lines = rawCsv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const firstCols = parseCsvLine(lines[0]).map((c) => c.toLowerCase());
  const hasHeader =
    firstCols.includes('phone') ||
    firstCols.includes('mobile') ||
    firstCols.includes('whatsapp') ||
    firstCols.includes('name');

  const phoneIdx = hasHeader
    ? Math.max(
        0,
        firstCols.findIndex((c) => ['phone', 'mobile', 'whatsapp', 'number'].includes(c))
      )
    : 0;
  const nameIdx = hasHeader ? firstCols.findIndex((c) => ['name', 'fullname', 'full_name'].includes(c)) : 1;
  const emailIdx = hasHeader ? firstCols.findIndex((c) => ['email', 'mail'].includes(c)) : 2;
  const tagsIdx = hasHeader ? firstCols.findIndex((c) => ['tags', 'tag', 'segment'].includes(c)) : 3;

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const cleanExtraTags = extraTags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const parsed: Array<{ phone: string; name?: string; email?: string; tags?: string }> = [];
  for (const line of dataLines) {
    const cols = parseCsvLine(line);
    const rawPhone = (cols[phoneIdx] || '').trim();
    if (!rawPhone) continue;

    const rowTags = tagsIdx >= 0 && cols[tagsIdx] ? cols[tagsIdx].replace(/;/g, ',') : '';
    const mergedTags = Array.from(
      new Set([
        ...rowTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        ...cleanExtraTags,
      ])
    ).join(',');

    parsed.push({
      phone: rawPhone,
      name: nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx] : undefined,
      email: emailIdx >= 0 && cols[emailIdx] ? cols[emailIdx] : undefined,
      tags: mergedTags || undefined,
    });
  }

  return parsed;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    optedIn: 0,
    optedOut: 0,
    tagsCount: 0,
    listsCount: 0,
  });
  const [tags, setTags] = useState<Array<{ id: string; name: string; _count?: { contacts: number } }>>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [consentFilter, setConsentFilter] = useState<'ALL' | 'OPTED_IN' | 'OPTED_OUT'>('ALL');
  const [selectedTagId, setSelectedTagId] = useState<string>('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Add Contact State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+91');
  const [newEmail, setNewEmail] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);

  // CSV Import State
  const [csvContent, setCsvContent] = useState('phone,name,email,tags\n');
  const [importListName, setImportListName] = useState('');
  const [importTags, setImportTags] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadContactsAndMeta = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({ page: '1', limit: '100' });
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (consentFilter !== 'ALL') params.set('consentStatus', consentFilter);
      if (selectedTagId) params.set('tagId', selectedTagId);

      const [listRes, totalRes, optedInRes, optedOutRes, tagsRes, listsRes] = await Promise.allSettled([
        apiFetch<{ items: ContactRow[]; meta: { total: number } }>(`/contacts?${params.toString()}`),
        apiFetch<{ meta: { total: number } }>('/contacts?limit=1'),
        apiFetch<{ meta: { total: number } }>('/contacts?limit=1&consentStatus=OPTED_IN'),
        apiFetch<{ meta: { total: number } }>('/contacts?limit=1&consentStatus=OPTED_OUT'),
        apiFetch<any[]>('/contacts/tags'),
        apiFetch<any[]>('/contacts/lists'),
      ]);

      if (listRes.status === 'fulfilled') {
        const items = Array.isArray(listRes.value)
          ? listRes.value
          : Array.isArray(listRes.value?.items)
            ? listRes.value.items
            : [];
        setContacts(items);
      }

      const tagsArr = tagsRes.status === 'fulfilled' && Array.isArray(tagsRes.value) ? tagsRes.value : [];
      const listsArr = listsRes.status === 'fulfilled' && Array.isArray(listsRes.value) ? listsRes.value : [];
      setTags(tagsArr);

      setStats({
        total: Number(totalRes.status === 'fulfilled' ? totalRes.value?.meta?.total ?? 0 : 0),
        optedIn: Number(optedInRes.status === 'fulfilled' ? optedInRes.value?.meta?.total ?? 0 : 0),
        optedOut: Number(optedOutRes.status === 'fulfilled' ? optedOutRes.value?.meta?.total ?? 0 : 0),
        tagsCount: tagsArr.length,
        listsCount: listsArr.length,
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, consentFilter, selectedTagId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadContactsAndMeta();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadContactsAndMeta]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContact(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      const parsedTags = newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await apiFetch('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          phone: newPhone.trim(),
          name: newName.trim() || undefined,
          email: newEmail.trim() || undefined,
          consentStatus: 'OPTED_IN',
          consentSource: 'IMPORT',
          tags: parsedTags.length > 0 ? parsedTags : undefined,
        }),
      });

      setShowAddModal(false);
      setNewName('');
      setNewPhone('+91');
      setNewEmail('');
      setNewTags('');
      setMessage('Contact saved with E.164 normalization and Meta opt-in consent audit record!');
      await loadContactsAndMeta();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add contact');
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleDeleteContact = async (contact: ContactRow) => {
    if (!window.confirm(`Delete contact ${contact.name || contact.phone}?`)) return;
    setDeletingId(contact.id);
    setErrorMsg(null);
    setMessage(null);
    try {
      await apiFetch(`/contacts/${contact.id}`, { method: 'DELETE' });
      setMessage(`Contact ${contact.name || contact.phone} deleted.`);
      await loadContactsAndMeta();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCsvContent(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);

    const parsedContacts = parseCsvContacts(csvContent, importTags);
    if (parsedContacts.length === 0) {
      setErrorMsg('No valid contact rows found in CSV. Ensure each row has a phone number with country code.');
      return;
    }

    setIsImporting(true);
    try {
      const res = await apiFetch<any>('/contacts/import', {
        method: 'POST',
        body: JSON.stringify({
          contacts: parsedContacts,
          listName: importListName.trim() || undefined,
          tags: importTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          updateExisting: true,
        }),
      });

      setShowImportModal(false);
      setImportListName('');
      setImportTags('');
      setMessage(
        `CSV Import Complete: ${res?.successCount ?? 0} created, ${res?.duplicateCount ?? 0} updated, ${res?.errorCount ?? 0} invalid.`
      );
      await loadContactsAndMeta();
    } catch (err: any) {
      setErrorMsg(err.message || 'CSV import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    try {
      const res = await apiFetch<{ filename: string; data: string; count: number }>('/contacts/export');
      const blob = new Blob([res.data || ''], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename || `convoza-contacts-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const optInRate = stats.total > 0 ? Math.round((stats.optedIn / stats.total) * 1000) / 10 : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Contacts &amp; Audience CRM</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              E.164 Normalized
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage verified customer phone numbers, Meta opt-in consent records, tags, and broadcast lists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadContactsAndMeta}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Add Contact
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 Live Audience KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Contacts</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.total.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {stats.listsCount} audience list(s)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Consent Opt-In Rate</div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{optInRate}%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {stats.optedIn.toLocaleString()} opted-in contact(s)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Audience Tags</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.tagsCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Active segmentation tags</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Suppressed / Opt-Out</div>
          <div className="mt-2 text-2xl font-black text-rose-600">{stats.optedOut.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Auto-excluded from broadcasts</div>
        </div>
      </div>

      {/* Search & Consent / Tag Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone (+91...), or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {(['ALL', 'OPTED_IN', 'OPTED_OUT'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setConsentFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                consentFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Contacts' : status === 'OPTED_IN' ? 'Opted-In' : 'Opted-Out'}
            </button>
          ))}

          {tags.length > 0 && (
            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  Tag: {t.name} ({t._count?.contacts ?? 0})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading && contacts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading contacts directory...</span>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-black text-slate-900">No Contacts Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add individual opted-in WhatsApp numbers or batch-import your customer list via CSV. Incoming WhatsApp
              messages also create contacts automatically.
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                + Add Contact
              </button>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Import CSV
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Customer Name</th>
                  <th className="py-3.5 px-6">WhatsApp Phone</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Consent Status</th>
                  <th className="py-3.5 px-6">Tags</th>
                  <th className="py-3.5 px-6">Added</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => {
                  const displayName = contact.name || 'WhatsApp Contact';
                  const initials = displayName.replace(/[^\w]/g, '').slice(0, 2).toUpperCase() || 'WA';

                  return (
                    <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{displayName}</div>
                            {contact.consentSource && (
                              <span className="text-[10px] text-slate-400">Source: {contact.consentSource}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-800 text-xs">{contact.phone}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{contact.email || '—'}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                            contact.consentStatus === 'OPTED_IN'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : contact.consentStatus === 'OPTED_OUT'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              contact.consentStatus === 'OPTED_IN'
                                ? 'bg-emerald-500'
                                : contact.consentStatus === 'OPTED_OUT'
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                            }`}
                          />
                          {contact.consentStatus === 'OPTED_IN'
                            ? 'Opted In'
                            : contact.consentStatus === 'OPTED_OUT'
                              ? 'Opted Out'
                              : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {(contact.tags || []).length > 0 ? (
                            contact.tags.map((t) => (
                              <span
                                key={t.id || t.name}
                                className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                              >
                                {t.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                        {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/messages?phone=${encodeURIComponent(contact.phone)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-700" />
                            <span>Message</span>
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === contact.id}
                            onClick={() => handleDeleteContact(contact)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Delete contact"
                          >
                            {deletingId === contact.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Single Contact */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Add Contact with Consent</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  WhatsApp Phone (E.164 with Country Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+919000000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="customer@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Audience Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="VIP, Lead, Enterprise"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Recorded with Meta-compliant opt-in consent timestamp.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingContact}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingContact && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Contact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Live CSV Ingestion */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Import Audience via CSV</h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Upload a <code>.csv</code> file or paste rows below. Supported columns:{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono">
                phone,name,email,tags
              </code>
            </p>

            <form onSubmit={handleImportCsv} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Choose CSV File (Optional)
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Target List Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={importListName}
                    onChange={(e) => setImportListName(e.target.value)}
                    placeholder="e.g. Q4 Leads Batch"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Apply Tags to All (Optional)
                  </label>
                  <input
                    type="text"
                    value={importTags}
                    onChange={(e) => setImportTags(e.target.value)}
                    placeholder="Imported, VIP"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  CSV Raw Data
                </label>
                <textarea
                  rows={5}
                  required
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder={'phone,name,email,tags\n+919000000001,Customer One,one@company.com,VIP'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Import Contacts</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCode2,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  Search,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { WhatsAppChatMockup } from '../../../components/WhatsAppChatMockup';
import { apiFetch } from '../../../lib/api';

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  metaTemplateId?: string;
  rejectionReason?: string;
  header: { type: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'; text: string };
  body: string;
  footer?: string;
  buttons?: Array<{ type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'OTP'; text: string; url?: string }>;
  updatedAt: string;
}

function mapApiTemplateToUi(tpl: any): TemplateItem {
  const comps: any[] = Array.isArray(tpl.components) ? tpl.components : [];
  const headerComp = comps.find((c) => (c.type || '').toUpperCase() === 'HEADER');
  const bodyComp = comps.find((c) => (c.type || '').toUpperCase() === 'BODY');
  const footerComp = comps.find((c) => (c.type || '').toUpperCase() === 'FOOTER');
  const buttonsComp = comps.find((c) => (c.type || '').toUpperCase() === 'BUTTONS');

  const isAuth = (tpl.category || '').toUpperCase() === 'AUTHENTICATION';

  return {
    id: tpl.id,
    name: tpl.name,
    category: tpl.category,
    language: tpl.language || 'en_US',
    status: tpl.status,
    metaTemplateId: tpl.metaTemplateId || undefined,
    rejectionReason: tpl.rejectionReason || undefined,
    header: headerComp
      ? { type: (headerComp.format || 'TEXT').toUpperCase(), text: headerComp.text || '' }
      : { type: 'NONE', text: '' },
    body:
      bodyComp?.text ||
      (isAuth ? '*{{1}}* is your verification code. For your security, do not share this code.' : ''),
    footer:
      footerComp?.text ||
      (footerComp?.code_expiration_minutes
        ? `This code expires in ${footerComp.code_expiration_minutes} minutes.`
        : undefined),
    buttons: Array.isArray(buttonsComp?.buttons)
      ? buttonsComp.buttons.map((b: any) => ({
          type: (b.type || 'QUICK_REPLY').toUpperCase(),
          text: b.text || 'Copy code',
          url: b.url,
        }))
      : [],
    updatedAt: tpl.updatedAt ? new Date(tpl.updatedAt).toLocaleString() : 'Recently',
  };
}

export default function TemplatesPage() {
  const [viewMode, setViewMode] = useState<'list' | 'builder'>('list');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedWabaId, setSelectedWabaId] = useState<string>('');
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [submittingTplId, setSubmittingTplId] = useState<string | null>(null);

  // Template Builder Form State
  const [name, setName] = useState('order_status_update_v1');
  const [category, setCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('UTILITY');
  const [language, setLanguage] = useState('en_US');
  const [headerType, setHeaderType] = useState<'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'>('TEXT');
  const [headerText, setHeaderText] = useState('Order Update #{{1}}');
  const [bodyText, setBodyText] = useState(
    'Hello {{1}}, your order #{{2}} has been confirmed and is scheduled for dispatch.'
  );
  const [footerText, setFooterText] = useState('Thank you for choosing us');
  const [buttons, setButtons] = useState<
    Array<{ type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'; text: string; url?: string }>
  >([{ type: 'QUICK_REPLY', text: 'Track Shipment' }]);

  const [sampleVariables, setSampleVariables] = useState<Record<string, string>>({
    '1': 'Alex',
    '2': 'ORD-4912',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [accRes, tplRes] = await Promise.all([
        apiFetch<any[]>('/whatsapp/accounts').catch(() => []),
        apiFetch<{ items: any[] }>('/templates?limit=100').catch(() => ({ items: [] })),
      ]);

      if (Array.isArray(accRes) && accRes.length > 0) {
        setAccounts(accRes);
        setSelectedWabaId((prev) => prev || accRes[0].id);
      }

      const items = tplRes?.items || (Array.isArray(tplRes) ? tplRes : []);
      setTemplates(items.map(mapApiTemplateToUi));
    } catch {
      // Unauthenticated fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSyncFromMeta = async () => {
    setIsSyncing(true);
    setMessage(null);
    setErrorMsg(null);
    try {
      const res = await apiFetch('/templates/sync', {
        method: 'POST',
        body: JSON.stringify(selectedWabaId ? { whatsappAccountId: selectedWabaId } : {}),
      });
      await loadData();
      setMessage(`Synced ${res?.syncedCount ?? 0} template(s) directly from Meta WhatsApp Cloud API!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sync templates from Meta');
    } finally {
      setIsSyncing(false);
    }
  };

  const insertVariable = () => {
    const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    const nextIdx = matches.length + 1;
    setBodyText(bodyText + ` {{${nextIdx}}}`);
    setSampleVariables((prev) => ({ ...prev, [String(nextIdx)]: `Sample_${nextIdx}` }));
  };

  const handleCreateTemplate = async (submitImmediately: boolean) => {
    setIsSubmitting(true);
    setMessage(null);
    setErrorMsg(null);

    const components: any[] = [];

    if (category === 'AUTHENTICATION') {
      components.push({
        type: 'BODY',
        add_security_recommendation: true,
      });
      components.push({
        type: 'FOOTER',
        code_expiration_minutes: 10,
      });
      components.push({
        type: 'BUTTONS',
        buttons: [{ type: 'OTP', otp_type: 'COPY_CODE', text: 'Copy code' }],
      });
    } else {
      if (headerType !== 'NONE') {
        const headerHasVar = headerType === 'TEXT' && headerText.includes('{{');
        components.push({
          type: 'HEADER',
          format: headerType,
          ...(headerType === 'TEXT' && {
            text: headerText,
            ...(headerHasVar ? { example: { header_text: [sampleVariables['1'] || 'ORD-4912'] } } : {}),
          }),
        });
      }

      const bodyVars = Array.from(new Set(bodyText.match(/\{\{(\d+)\}\}/g) || []));
      components.push({
        type: 'BODY',
        text: bodyText,
        ...(bodyVars.length > 0
          ? {
              example: {
                body_text: [
                  bodyVars.map((tok, i) => {
                    const num = tok.replace(/\D/g, '');
                    return sampleVariables[num] || `Sample${i + 1}`;
                  }),
                ],
              },
            }
          : {}),
      });

      if (footerText.trim()) {
        components.push({
          type: 'FOOTER',
          text: footerText.trim(),
        });
      }

      if (buttons.length > 0) {
        components.push({
          type: 'BUTTONS',
          buttons,
        });
      }
    }

    try {
      const created = await apiFetch('/templates', {
        method: 'POST',
        body: JSON.stringify({
          whatsappAccountId: selectedWabaId || undefined,
          name: name.trim().toLowerCase(),
          category,
          language,
          components,
          submitImmediately,
        }),
      });

      await loadData();
      setMessage(
        submitImmediately
          ? `Template "${created.name}" submitted live to Meta Graph API! Status: ${created.status}${created.metaTemplateId ? ` (Meta ID: ${created.metaTemplateId})` : ''}`
          : `Template "${created.name}" saved as local draft.`
      );
      setViewMode('list');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create or submit template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitExistingToMeta = async (tplId: string) => {
    setSubmittingTplId(tplId);
    setMessage(null);
    setErrorMsg(null);
    try {
      const res = await apiFetch(`/templates/${tplId}/submit`, {
        method: 'POST',
        body: '{}',
      });
      await loadData();
      setMessage(
        `Submitted to Meta Graph API! Status: ${res?.template?.status || 'PENDING'} (Meta Template ID: ${res?.template?.metaTemplateId || 'assigned'})`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission to Meta failed');
    } finally {
      setSubmittingTplId(null);
    }
  };

  const handleDeleteTemplate = async (tplId: string, tplName: string) => {
    if (!window.confirm(`Delete template "${tplName}" from local catalog?`)) return;
    setErrorMsg(null);
    try {
      await apiFetch(`/templates/${tplId}`, { method: 'DELETE' });
      await loadData();
      setMessage(`Template "${tplName}" deleted.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete failed');
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = filterCategory === 'ALL' || tpl.category === filterCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const bodyVarTokens = Array.from(new Set(bodyText.match(/\{\{(\d+)\}\}/g) || []));

  const previewBody =
    category === 'AUTHENTICATION'
      ? `${sampleVariables['1'] || '482913'} is your verification code. For your security, do not share this code.`
      : bodyText.replace(/\{\{(\d+)\}\}/g, (_, idx) => sampleVariables[idx] || `{{${idx}}}`);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">WhatsApp Template Studio</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Meta Cloud Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author, sync, and submit Utility, Marketing, and Authentication (OTP) message templates directly via Meta Graph API v20.0.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncFromMeta}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isSyncing ? 'Syncing Meta...' : 'Sync from Meta'}</span>
          </button>

          {viewMode === 'list' ? (
            <button
              onClick={() => {
                setErrorMsg(null);
                setMessage(null);
                setViewMode('builder');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Create Template
            </button>
          ) : (
            <button
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Catalog
            </button>
          )}
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

      {/* VIEW 1: TEMPLATES LIST */}
      {viewMode === 'list' && (
        <div className="space-y-5">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['ALL', 'UTILITY', 'AUTHENTICATION', 'MARKETING'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    filterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'AUTHENTICATION' ? 'OTP / AUTHENTICATION' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search template name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading templates catalog...</span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <FileCode2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-black text-slate-900">No Templates Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong>Sync from Meta</strong> to import your existing approved templates (including OTP templates), or click <strong>Create Template</strong> to submit a new one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 font-mono break-all">{tpl.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {tpl.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{tpl.language}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          tpl.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tpl.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : tpl.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {tpl.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                        {tpl.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {tpl.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {tpl.status}
                      </span>
                    </div>

                    {tpl.metaTemplateId && (
                      <div className="text-[10px] font-mono text-slate-400">
                        Meta Template ID: <span className="text-slate-600 font-semibold">{tpl.metaTemplateId}</span>
                      </div>
                    )}

                    {/* Message Bubble Preview */}
                    <div className="p-3.5 rounded-2xl bg-[#E7FFDB]/60 border border-emerald-200/60 text-xs text-slate-800 space-y-1.5">
                      {tpl.header.type === 'TEXT' && tpl.header.text && (
                        <div className="font-black text-slate-900 text-xs">{tpl.header.text}</div>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap text-xs">{tpl.body}</p>
                      {tpl.footer && <div className="text-[10px] text-slate-500 pt-1">{tpl.footer}</div>}
                    </div>

                    {tpl.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700">
                        <strong>Reason:</strong> {tpl.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">{tpl.updatedAt}</span>
                    <div className="flex items-center gap-2">
                      {(tpl.status === 'DRAFT' || tpl.status === 'REJECTED') && (
                        <button
                          onClick={() => handleSubmitExistingToMeta(tpl.id)}
                          disabled={submittingTplId === tpl.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold disabled:opacity-50"
                        >
                          {submittingTplId === tpl.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>Submit to Meta</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: TEMPLATE BUILDER */}
      {viewMode === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
            {/* WABA Selector */}
            {accounts.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Target WhatsApp Business Account (WABA)
                </label>
                <select
                  value={selectedWabaId}
                  onChange={(e) => setSelectedWabaId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (WABA ID: {a.wabaId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Name, Category, Language */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  placeholder="order_update_v1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Lowercase letters, numbers &amp; _</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  <option value="UTILITY">UTILITY (Transactional)</option>
                  <option value="AUTHENTICATION">AUTHENTICATION (OTP Code)</option>
                  <option value="MARKETING">MARKETING (Promotional)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Language Code
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  <option value="en_US">English (US) - en_US</option>
                  <option value="en">English - en</option>
                  <option value="en_GB">English (UK) - en_GB</option>
                  <option value="hi">Hindi - hi</option>
                </select>
              </div>
            </div>

            {category === 'AUTHENTICATION' ? (
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-black text-emerald-900">
                  <KeyRound className="w-4 h-4 text-emerald-700" />
                  <span>Meta Official OTP Preset (Graph API v20.0 Compliant)</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Meta mandates fixed preset text for <strong>AUTHENTICATION</strong> templates:
                  <code className="block mt-2 p-2.5 rounded-xl bg-white border border-emerald-200 font-mono text-xs">
                    *&#123;&#123;1&#125;&#125;* is your verification code. For your security, do not share this code.
                  </code>
                </p>
                <p className="text-[11px] text-slate-600">
                  Includes security recommendation, 10-minute code expiration footer, and one-click <strong>Copy code</strong> OTP button.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                    Header (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={headerType}
                      onChange={(e) => setHeaderType(e.target.value as any)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                    >
                      <option value="NONE">None</option>
                      <option value="TEXT">Text Header</option>
                    </select>
                    {headerType === 'TEXT' && (
                      <input
                        type="text"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="Order Confirmation #{{1}}"
                        className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    )}
                  </div>
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                      Message Body <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={insertVariable}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                    >
                      + Add Variable &#123;&#123;n&#125;&#125;
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs leading-relaxed"
                  />
                </div>

                {/* Sample Variables (Required by Meta for review!) */}
                {bodyVarTokens.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="text-[11px] font-bold text-slate-700">
                      Sample Variable Values for Meta Approval (Required by Meta Graph API)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {bodyVarTokens.map((tok) => {
                        const num = tok.replace(/\D/g, '');
                        return (
                          <div key={tok}>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Example for {tok}
                            </label>
                            <input
                              type="text"
                              value={sampleVariables[num] || ''}
                              onChange={(e) =>
                                setSampleVariables((prev) => ({ ...prev, [num]: e.target.value }))
                              }
                              placeholder={`Sample for ${tok}`}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                    Footer Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Reply STOP to opt out"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </>
            )}

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting || !name}
                onClick={() => handleCreateTemplate(true)}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Create &amp; Submit to Meta Graph API</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || !name}
                onClick={() => handleCreateTemplate(false)}
                className="px-4 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-50"
              >
                Save Local Draft Only
              </button>
            </div>
          </div>

          {/* Live WhatsApp Handset Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                📱 Live Meta Template Preview
              </span>
            </div>

            <WhatsAppChatMockup
              headerType={category === 'AUTHENTICATION' ? undefined : headerType === 'NONE' ? undefined : 'TEXT'}
              headerText={
                category === 'AUTHENTICATION'
                  ? undefined
                  : headerType === 'TEXT'
                    ? headerText.replace('{{1}}', sampleVariables['1'] || '1024')
                    : undefined
              }
              bodyText={previewBody}
              footerText={category === 'AUTHENTICATION' ? 'This code expires in 10 minutes.' : footerText}
              buttons={
                category === 'AUTHENTICATION'
                  ? [{ type: 'QUICK_REPLY', text: 'Copy code' }]
                  : buttons
              }
              time="Just now"
            />
          </div>
        </div>
      )}
    </div>
  );
}

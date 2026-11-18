'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Flame,
  Plus,
  Play,
  Pause,
  XCircle,
  CheckCircle2,
  Users2,
  Send,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Tag,
  ListChecks,
  Clock,
  FileCode2,
} from 'lucide-react';
import { WhatsAppChatMockup } from '../../../components/WhatsAppChatMockup';
import { apiFetch } from '../../../lib/api';

interface PhoneOption {
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  messagingLimitTier: string;
}

interface ApprovedTemplateItem {
  id: string;
  name: string;
  category: string;
  language: string;
  headerText?: string;
  bodyText: string;
  footerText?: string;
  variableNumbers: string[];
  buttons: Array<{ type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'; text: string; url?: string }>;
}

function parseApprovedTemplate(t: any): ApprovedTemplateItem {
  const comps: any[] = Array.isArray(t.components) ? t.components : [];
  const header = comps.find((c) => (c.type || '').toUpperCase() === 'HEADER');
  const body = comps.find((c) => (c.type || '').toUpperCase() === 'BODY');
  const footer = comps.find((c) => (c.type || '').toUpperCase() === 'FOOTER');
  const btns = comps.find((c) => (c.type || '').toUpperCase() === 'BUTTONS');
  const isAuth = (t.category || '').toUpperCase() === 'AUTHENTICATION';

  const bodyText =
    body?.text ||
    (isAuth ? '*{{1}}* is your verification code. For your security, do not share this code.' : '');

  const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
  const variableNumbers = isAuth
    ? ['1']
    : Array.from(new Set<string>(matches.map((m: string) => m.replace(/\D/g, '')))).sort(
        (a, b) => Number(a) - Number(b)
      );

  return {
    id: t.id,
    name: t.name,
    category: t.category || 'UTILITY',
    language: t.language || 'en_US',
    headerText: header?.format === 'TEXT' ? header.text : undefined,
    bodyText,
    footerText:
      footer?.text ||
      (footer?.code_expiration_minutes
        ? `This code expires in ${footer.code_expiration_minutes} minutes.`
        : undefined),
    variableNumbers,
    buttons: Array.isArray(btns?.buttons)
      ? btns.buttons.map((b: any) => ({
          type: (b.type === 'URL' ? 'URL' : b.type === 'PHONE_NUMBER' ? 'PHONE_NUMBER' : 'QUICK_REPLY') as
            | 'QUICK_REPLY'
            | 'URL'
            | 'PHONE_NUMBER',
          text: b.text || 'Copy code',
          url: b.url,
        }))
      : [],
  };
}

export default function CampaignsPage() {
  const [view, setView] = useState<'list' | 'wizard'>('list');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const [orgName, setOrgName] = useState('Emperor Smart Solutions');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [dashRates, setDashRates] = useState({
    deliveryRate: 0,
    readRate: 0,
    activeCampaigns: 0,
  });

  // Live Assets for Wizard
  const [phones, setPhones] = useState<PhoneOption[]>([]);
  const [templates, setTemplates] = useState<ApprovedTemplateItem[]>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string; _count?: { contacts: number } }>>([]);
  const [lists, setLists] = useState<Array<{ id: string; name: string; _count?: { members: number } }>>([]);
  const [optedInCount, setOptedInCount] = useState(0);
  const [totalContactsCount, setTotalContactsCount] = useState(0);

  // 5-Step Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [audienceType, setAudienceType] = useState<'ALL_OPTED_IN' | 'CONTACT_LIST' | 'TAGS'>('ALL_OPTED_IN');
  const [selectedListId, setSelectedListId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [variableMap, setVariableMap] = useState<Record<string, string>>({});
  const [scheduleType, setScheduleType] = useState<'NOW' | 'LATER'>('NOW');
  const [scheduledDate, setScheduledDate] = useState('');

  const [isLaunching, setIsLaunching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrg = localStorage.getItem('convoza_org_name');
      if (storedOrg) setOrgName(storedOrg);
      if (window.location.search.includes('new=true')) {
        setCampaignName(`Broadcast_${new Date().toISOString().slice(0, 10)}`);
        setView('wizard');
      }
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }

      const [campsRes, dashRes, accsRes, tplRes, allContactsRes, optedInRes, tagsRes, listsRes] =
        await Promise.allSettled([
          apiFetch<{ items?: any[] }>('/campaigns?page=1&limit=50'),
          apiFetch<any>('/analytics/dashboard'),
          apiFetch<any[]>('/whatsapp/accounts'),
          apiFetch<{ items?: any[] }>('/templates?status=APPROVED&limit=100'),
          apiFetch<{ meta?: { total?: number } }>('/contacts?limit=1'),
          apiFetch<{ meta?: { total?: number } }>('/contacts?limit=1&consentStatus=OPTED_IN'),
          apiFetch<any[]>('/contacts/tags'),
          apiFetch<any[]>('/contacts/lists'),
        ]);

      if (campsRes.status === 'fulfilled') {
        const raw = Array.isArray(campsRes.value)
          ? campsRes.value
          : Array.isArray(campsRes.value?.items)
            ? campsRes.value.items
            : [];
        setCampaigns(raw);
      }

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        const d = dashRes.value;
        setDashRates({
          deliveryRate: Number(d.rates?.deliveryRate ?? 0),
          readRate: Number(d.rates?.readRate ?? 0),
          activeCampaigns: Number(d.activeCampaigns ?? 0),
        });
      }

      if (accsRes.status === 'fulfilled' && Array.isArray(accsRes.value)) {
        const pList: PhoneOption[] = [];
        for (const acc of accsRes.value) {
          for (const pn of acc.phoneNumbers || []) {
            pList.push({
              phoneNumberId: pn.phoneNumberId,
              displayPhoneNumber: pn.displayPhoneNumber,
              verifiedName: pn.verifiedName || acc.name || 'Official WABA',
              messagingLimitTier: pn.messagingLimitTier || 'TIER_1K',
            });
          }
        }
        setPhones(pList);
        if (pList.length > 0) {
          setPhoneNumberId((prev) => prev || pList[0].phoneNumberId);
        }
      }

      if (tplRes.status === 'fulfilled') {
        const rawTpls = Array.isArray(tplRes.value)
          ? tplRes.value
          : Array.isArray(tplRes.value?.items)
            ? tplRes.value.items
            : [];
        const parsed = rawTpls.map(parseApprovedTemplate);
        setTemplates(parsed);
        if (parsed.length > 0) {
          setTemplateId((prev) => prev || parsed[0].id);
          const initialVars: Record<string, string> = {};
          parsed[0].variableNumbers.forEach((n, idx) => {
            initialVars[n] = idx === 0 ? '{{name}}' : '';
          });
          setVariableMap((prev) => (Object.keys(prev).length > 0 ? prev : initialVars));
        }
      }

      if (allContactsRes.status === 'fulfilled') {
        setTotalContactsCount(Number(allContactsRes.value?.meta?.total ?? 0));
      }
      if (optedInRes.status === 'fulfilled') {
        setOptedInCount(Number(optedInRes.value?.meta?.total ?? 0));
      }
      if (tagsRes.status === 'fulfilled' && Array.isArray(tagsRes.value)) {
        setTags(tagsRes.value);
      }
      if (listsRes.status === 'fulfilled' && Array.isArray(listsRes.value)) {
        setLists(listsRes.value);
        if (listsRes.value.length > 0) {
          setSelectedListId((prev) => prev || listsRes.value[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const selectedPhone = phones.find((p) => p.phoneNumberId === phoneNumberId) || phones[0];
  const selectedTemplate = templates.find((t) => t.id === templateId) || templates[0];

  const handleSelectTemplate = (tpl: ApprovedTemplateItem) => {
    setTemplateId(tpl.id);
    const nextVars: Record<string, string> = {};
    tpl.variableNumbers.forEach((n, idx) => {
      nextVars[n] = variableMap[n] ?? (idx === 0 ? '{{name}}' : '');
    });
    setVariableMap(nextVars);
  };

  const toggleTagId = (id: string) => {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleLaunchCampaign = async () => {
    setErrorMsg(null);
    setMessage(null);

    if (!campaignName.trim()) {
      setErrorMsg('Please enter a campaign title.');
      return;
    }
    if (!phoneNumberId) {
      setErrorMsg('Please connect and select an official WhatsApp sender phone number first.');
      return;
    }
    if (!templateId) {
      setErrorMsg('Please select an APPROVED Meta WhatsApp template.');
      return;
    }
    if (scheduleType === 'LATER' && !scheduledDate) {
      setErrorMsg('Please choose a scheduled execution date and time.');
      return;
    }

    setIsLaunching(true);
    try {
      const payload: Record<string, any> = {
        name: campaignName.trim(),
        phoneNumberId,
        templateId,
        variableMapping: variableMap,
      };

      if (audienceType === 'CONTACT_LIST' && selectedListId) {
        payload.contactListId = selectedListId;
      } else if (audienceType === 'TAGS' && selectedTagIds.length > 0) {
        payload.tagIds = selectedTagIds;
      }

      if (scheduleType === 'LATER' && scheduledDate) {
        payload.scheduledAt = new Date(scheduledDate).toISOString();
      }

      const created = await apiFetch<any>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (scheduleType === 'NOW' && created?.id) {
        await apiFetch(`/campaigns/${created.id}/start`, {
          method: 'POST',
          body: '{}',
        });
      }

      await loadAll();
      setMessage(
        scheduleType === 'NOW'
          ? `Campaign "${created.name}" created (${created.totalRecipients ?? 0} eligible recipients) and started in the outbox worker queue!`
          : `Campaign "${created.name}" scheduled for ${new Date(scheduledDate).toLocaleString()} (${created.totalRecipients ?? 0} eligible recipients).`
      );
      setView('list');
      setWizardStep(1);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create or start campaign');
    } finally {
      setIsLaunching(false);
    }
  };

  const handleCampaignAction = async (id: string, action: 'start' | 'pause' | 'resume' | 'cancel') => {
    if (action === 'cancel' && !window.confirm('Cancel this campaign? Remaining queued messages will not be sent.')) {
      return;
    }
    setActionId(id);
    setErrorMsg(null);
    setMessage(null);
    try {
      await apiFetch(`/campaigns/${id}/${action}`, {
        method: 'POST',
        body: '{}',
      });
      await loadAll();
      setMessage(`Campaign ${action} command executed successfully.`);
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to ${action} campaign`);
    } finally {
      setActionId(null);
    }
  };

  const totalDispatched = campaigns.reduce((sum, c) => sum + Number(c.sentCount ?? 0), 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + Number(c.deliveredCount ?? 0), 0);
  const totalRead = campaigns.reduce((sum, c) => sum + Number(c.readCount ?? 0), 0);
  const computedDeliveryRate =
    totalDispatched > 0 ? Math.round((totalDelivered / totalDispatched) * 1000) / 10 : dashRates.deliveryRate;
  const computedReadRate =
    totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 1000) / 10 : dashRates.readRate;

  const previewVariables: Record<string, string> = {};
  Object.entries(variableMap).forEach(([k, v]) => {
    previewVariables[k] = v === '{{name}}' || v === 'name' ? 'Customer' : v || `{{${k}}}`;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Bulk Campaigns Operations</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Outbox Queue Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Broadcast approved Meta WhatsApp templates at scale with automatic opt-out suppression and rate limiting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadAll}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {view === 'list' ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setMessage(null);
                setCampaignName(`Broadcast_${new Date().toISOString().slice(0, 10)}`);
                setWizardStep(1);
                setView('wizard');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Launch Campaign Wizard
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setView('list')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Campaigns List
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

      {/* Top 4 Live Performance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Campaign Messages Sent</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalDispatched.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Across {campaigns.length} campaign(s)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Delivery Rate</div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{computedDeliveryRate}%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalDelivered.toLocaleString()} confirmed deliveries
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Read / Open Rate</div>
          <div className="mt-2 text-2xl font-black text-sky-600">{computedReadRate}%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalRead.toLocaleString()} read receipts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active / Scheduled</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{dashRates.activeCampaigns}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {optedInCount.toLocaleString()} opted-in audience ready
          </div>
        </div>
      </div>

      {/* VIEW 1: Campaigns Table */}
      {view === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Active &amp; Past Broadcasts</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live telemetry from transactional outbox worker nodes</p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
              {campaigns.length} Total
            </span>
          </div>

          {loading && campaigns.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Flame className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-black text-slate-900">No Broadcast Campaigns Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Launch the 5-step Campaign Wizard to select your sender phone number, filter your opted-in CRM contacts,
                and dispatch an approved Meta template.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCampaignName(`Broadcast_${new Date().toISOString().slice(0, 10)}`);
                  setWizardStep(1);
                  setView('wizard');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create First Campaign
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Campaign Name</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Audience</th>
                    <th className="py-3.5 px-6">Progress &amp; Delivery</th>
                    <th className="py-3.5 px-6">Read Rate</th>
                    <th className="py-3.5 px-6">Replies</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.map((camp) => {
                    const totalRec = Number(camp.totalRecipients ?? 0);
                    const sentCnt = Number(camp.sentCount ?? 0);
                    const delCnt = Number(camp.deliveredCount ?? 0);
                    const readCnt = Number(camp.readCount ?? 0);
                    const repCnt = Number(camp.repliedCount ?? 0);
                    const deliveryPct = sentCnt > 0 ? Math.round((delCnt / sentCnt) * 100) : 0;
                    const readPct = delCnt > 0 ? Math.round((readCnt / delCnt) * 100) : 0;
                    const progressPct = totalRec > 0 ? Math.round((sentCnt / totalRec) * 100) : 0;
                    const busy = actionId === camp.id;

                    return (
                      <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 text-sm">{camp.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            {camp.template?.name || 'Template'} • {camp.template?.category || 'UTILITY'} •{' '}
                            {camp.createdAt ? new Date(camp.createdAt).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              camp.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : camp.status === 'PROCESSING'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : camp.status === 'CANCELLED' || camp.status === 'FAILED'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                camp.status === 'PROCESSING' ? 'bg-amber-500 animate-pulse' : 'bg-current'
                              }`}
                            />
                            {camp.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800">
                          {totalRec.toLocaleString()} recipients
                        </td>
                        <td className="py-4 px-6 min-w-[180px]">
                          <div className="space-y-1">
                            <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                              <span>{sentCnt.toLocaleString()} sent</span>
                              <span className="text-slate-500">{progressPct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              {delCnt.toLocaleString()} delivered ({deliveryPct}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                          {delCnt > 0 ? `${readPct}%` : '—'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {repCnt} replies
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {(camp.status === 'DRAFT' || camp.status === 'SCHEDULED') && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleCampaignAction(camp.id, 'start')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg inline-flex items-center gap-1 font-bold transition-colors disabled:opacity-50"
                              >
                                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                Start
                              </button>
                            )}
                            {camp.status === 'PROCESSING' && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleCampaignAction(camp.id, 'pause')}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg inline-flex items-center gap-1 font-bold transition-colors disabled:opacity-50"
                              >
                                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3" />}
                                Pause
                              </button>
                            )}
                            {camp.status === 'PAUSED' && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleCampaignAction(camp.id, 'resume')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg inline-flex items-center gap-1 font-bold transition-colors disabled:opacity-50"
                              >
                                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                Resume
                              </button>
                            )}
                            {['DRAFT', 'SCHEDULED', 'PROCESSING', 'PAUSED'].includes(camp.status) && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleCampaignAction(camp.id, 'cancel')}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg inline-flex items-center gap-1 font-bold transition-colors disabled:opacity-50"
                                title="Cancel campaign"
                              >
                                <XCircle className="w-3 h-3" /> Cancel
                              </button>
                            )}
                            {['COMPLETED', 'CANCELLED', 'FAILED'].includes(camp.status) && (
                              <span className="text-slate-400 text-xs">{camp.status}</span>
                            )}
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
      )}

      {/* VIEW 2: 5-Step Campaign Creation Wizard */}
      {view === 'wizard' && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          {/* Stepper Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
              <span className="text-emerald-600 font-extrabold uppercase tracking-wider">
                Step {wizardStep} of 5
              </span>
              <span className="text-slate-900 font-bold">
                {wizardStep === 1 && '1. Campaign Details & Sender'}
                {wizardStep === 2 && '2. Audience Selection & Exclusion'}
                {wizardStep === 3 && '3. Approved Meta Template'}
                {wizardStep === 4 && '4. Parameter Mapping & Preview'}
                {wizardStep === 5 && '5. Review & Launch Execution'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300"
                style={{ width: `${(wizardStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Campaign Details */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Campaign Basic Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Specify the broadcast identifier and connected WABA sender</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Campaign Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Monthly Product Update Wave 1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Sending WhatsApp Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <Link href="/dashboard/whatsapp" className="text-[11px] font-bold text-emerald-600 hover:underline">
                    Manage WABA Numbers →
                  </Link>
                </div>

                {phones.length > 0 ? (
                  <select
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 shadow-xs"
                  >
                    {phones.map((p) => (
                      <option key={p.phoneNumberId} value={p.phoneNumberId}>
                        {p.displayPhoneNumber} ({p.verifiedName} • {p.messagingLimitTier})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                    <span>No official WhatsApp Business phone number connected yet.</span>
                    <Link
                      href="/dashboard/whatsapp"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold shrink-0"
                    >
                      Connect WABA →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Target Audience */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Select Target Audience Segment</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {optedInCount.toLocaleString()} opted-in contact(s) out of {totalContactsCount.toLocaleString()} total CRM contacts
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setAudienceType('ALL_OPTED_IN')}
                  className={`p-5 rounded-2xl border text-left text-xs font-bold transition-all ${
                    audienceType === 'ALL_OPTED_IN'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-black">All Opted-In Contacts</div>
                  <span className="block text-slate-500 font-normal mt-1 leading-relaxed">
                    {optedInCount.toLocaleString()} verified WhatsApp contacts with active consent.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudienceType('CONTACT_LIST')}
                  className={`p-5 rounded-2xl border text-left text-xs font-bold transition-all ${
                    audienceType === 'CONTACT_LIST'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-black">Imported Contact List</div>
                  <span className="block text-slate-500 font-normal mt-1 leading-relaxed">
                    {lists.length} audience list(s) available from CSV imports.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudienceType('TAGS')}
                  className={`p-5 rounded-2xl border text-left text-xs font-bold transition-all ${
                    audienceType === 'TAGS'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-black">Filter by CRM Tags</div>
                  <span className="block text-slate-500 font-normal mt-1 leading-relaxed">
                    {tags.length} tag segment(s) configured in Contacts.
                  </span>
                </button>
              </div>

              {audienceType === 'CONTACT_LIST' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-700">Select Contact List</label>
                  {lists.length > 0 ? (
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                    >
                      {lists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l._count?.members ?? 0} members)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No contact lists created yet.{' '}
                      <Link href="/dashboard/contacts" className="text-emerald-600 font-bold underline">
                        Import a CSV list in Contacts →
                      </Link>
                    </p>
                  )}
                </div>
              )}

              {audienceType === 'TAGS' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Choose Target Tags (Select one or more)
                  </label>
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tags.map((t) => {
                        const active = selectedTagIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTagId(t.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                              active
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {t.name} ({t._count?.contacts ?? 0})
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No tags found yet.{' '}
                      <Link href="/dashboard/contacts" className="text-emerald-600 font-bold underline">
                        Add contacts with tags first →
                      </Link>
                    </p>
                  )}
                </div>
              )}

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Compliance Guard:</strong> Contacts marked <code>OPTED_OUT</code> are automatically excluded before
                  queueing to Meta Cloud API.
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Template Selection */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Choose Approved Meta Template</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Only APPROVED templates can be dispatched in bulk campaigns</p>
                </div>
                <Link href="/dashboard/templates" className="text-xs font-bold text-emerald-600 hover:underline">
                  Template Studio →
                </Link>
              </div>

              {templates.length === 0 ? (
                <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <FileCode2 className="w-9 h-9 text-amber-600 mx-auto" />
                  <div className="text-sm font-black text-amber-950">No Approved Meta Templates Found</div>
                  <p className="text-xs text-amber-800 max-w-md mx-auto">
                    Sync your approved templates from Meta Graph API or create a new template in Template Studio first.
                  </p>
                  <Link
                    href="/dashboard/templates"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                  >
                    Open Template Studio →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {templates.map((tpl) => {
                    const selected = tpl.id === selectedTemplate?.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                          selected
                            ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 text-sm font-mono">{tpl.name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                            APPROVED • {tpl.category} ({tpl.language})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{tpl.bodyText}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Variable Mapping & Phone Mockup */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Map Parameters &amp; Live Preview</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Use <code>&#123;&#123;name&#125;&#125;</code> for dynamic contact names or enter static values for each placeholder
                </p>
              </div>

              {selectedTemplate && selectedTemplate.variableNumbers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTemplate.variableNumbers.map((num) => (
                    <div key={num} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                          Parameter &#123;&#123;{num}&#125;&#125;
                        </label>
                        <button
                          type="button"
                          onClick={() => setVariableMap({ ...variableMap, [num]: '{{name}}' })}
                          className="text-[10px] font-bold text-emerald-700 hover:underline"
                        >
                          Use Contact Name
                        </button>
                      </div>
                      <input
                        type="text"
                        value={variableMap[num] || ''}
                        onChange={(e) => setVariableMap({ ...variableMap, [num]: e.target.value })}
                        placeholder={`Value or {{name}} for {{${num}}}`}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white shadow-xs"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Selected template has no dynamic variables — message body will be sent as-is.
                </div>
              )}

              {selectedTemplate && (
                <div className="pt-4 border-t border-slate-100">
                  <WhatsAppChatMockup
                    businessName={selectedPhone?.verifiedName || orgName}
                    headerType={selectedTemplate.headerText ? 'TEXT' : undefined}
                    headerText={selectedTemplate.headerText}
                    bodyText={selectedTemplate.bodyText}
                    footerText={selectedTemplate.footerText}
                    buttons={selectedTemplate.buttons}
                    variables={previewVariables}
                    time="Now"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 5: Schedule & Launch Confirmation */}
          {wizardStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Review &amp; Launch Broadcast</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verify campaign details before transactional outbox dispatch</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 font-medium">Campaign Name:</span>
                  <span className="font-bold text-slate-900">{campaignName || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 font-medium">Sending Number:</span>
                  <span className="font-bold text-slate-900">
                    {selectedPhone
                      ? `${selectedPhone.displayPhoneNumber} (${selectedPhone.verifiedName})`
                      : 'Not Connected'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 font-medium">Approved Template:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {selectedTemplate ? `${selectedTemplate.name} (${selectedTemplate.category})` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 font-medium">Target Segment:</span>
                  <span className="font-bold text-emerald-700">
                    {audienceType === 'ALL_OPTED_IN' && `All Opted-In (${optedInCount.toLocaleString()} contacts)`}
                    {audienceType === 'CONTACT_LIST' &&
                      `List: ${lists.find((l) => l.id === selectedListId)?.name || 'Selected List'}`}
                    {audienceType === 'TAGS' && `${selectedTagIds.length} Tag(s) Selected`}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                  Dispatch Execution Mode
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setScheduleType('NOW')}
                    className={`px-5 py-3 rounded-xl text-xs font-bold border transition-all ${
                      scheduleType === 'NOW'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 inline mr-1.5" />
                    Send Immediately
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType('LATER')}
                    className={`px-5 py-3 rounded-xl text-xs font-bold border transition-all ${
                      scheduleType === 'LATER'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                    Schedule for Specific Date &amp; Time
                  </button>
                </div>

                {scheduleType === 'LATER' && (
                  <div className="pt-2 max-w-sm">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Scheduled Execution Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
            {wizardStep > 1 ? (
              <button
                type="button"
                onClick={() => setWizardStep(wizardStep - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Step
              </button>
            ) : (
              <div />
            )}

            {wizardStep < 5 ? (
              <button
                type="button"
                onClick={() => setWizardStep(wizardStep + 1)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isLaunching || !phoneNumberId || !templateId}
                onClick={handleLaunchCampaign}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isLaunching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                <span>{scheduleType === 'NOW' ? 'Confirm & Launch Campaign' : 'Confirm & Schedule Campaign'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

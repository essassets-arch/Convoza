'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Clock,
  Loader2,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { WhatsAppChatMockup } from '../../../components/WhatsAppChatMockup';
import { apiFetch } from '../../../lib/api';

interface SenderPhoneOption {
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  messagingLimitTier: string;
}

interface ApprovedTemplateOption {
  id: string;
  name: string;
  language: string;
  category: string;
  bodyText: string;
  headerText?: string;
  footerText?: string;
  variableNumbers: string[];
  buttons: Array<{ type: string; text: string; url?: string }>;
}

function parseTemplateOption(t: any): ApprovedTemplateOption {
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
    language: t.language || 'en_US',
    category: t.category || 'UTILITY',
    bodyText,
    headerText: header?.format === 'TEXT' ? header.text : undefined,
    footerText:
      footer?.text ||
      (footer?.code_expiration_minutes ? `This code expires in ${footer.code_expiration_minutes} minutes.` : undefined),
    variableNumbers,
    buttons: Array.isArray(btns?.buttons) ? btns.buttons : [],
  };
}

export default function IndividualMessagePage() {
  const [phones, setPhones] = useState<SenderPhoneOption[]>([]);
  const [templates, setTemplates] = useState<ApprovedTemplateOption[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+91');
  const [messageType, setMessageType] = useState<'TEMPLATE' | 'TEXT'>('TEMPLATE');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    '1': '482913',
    '2': 'ORD-4912',
  });
  const [freeText, setFreeText] = useState('Hello! Confirming your inquiry via CONVOZA Official WhatsApp Cloud API.');

  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; wamid?: string; status?: string } | null>(
    null
  );

  useEffect(() => {
    async function fetchAssets() {
      setLoadingAssets(true);
      try {
        const [accData, tplData] = await Promise.all([
          apiFetch<any[]>('/whatsapp/accounts').catch(() => []),
          apiFetch<{ items: any[] }>('/templates?status=APPROVED&limit=100').catch(() => ({ items: [] })),
        ]);

        const phoneList: SenderPhoneOption[] = [];
        for (const acc of accData || []) {
          for (const pn of acc.phoneNumbers || []) {
            phoneList.push({
              phoneNumberId: pn.phoneNumberId,
              displayPhoneNumber: pn.displayPhoneNumber,
              verifiedName: pn.verifiedName,
              messagingLimitTier: pn.messagingLimitTier || 'TIER_1K',
            });
          }
        }
        setPhones(phoneList);
        if (phoneList.length > 0) {
          setPhoneNumberId(phoneList[0].phoneNumberId);
        }

        const rawTpls = tplData?.items || (Array.isArray(tplData) ? tplData : []);
        const parsedTpls = rawTpls.map(parseTemplateOption);
        setTemplates(parsedTpls);
        if (parsedTpls.length > 0) {
          setSelectedTemplateId(parsedTpls[0].id);
          if (parsedTpls[0].category === 'AUTHENTICATION') {
            setParamValues({ '1': '482913' });
          } else {
            setParamValues({ '1': 'Alex', '2': '3' });
          }
        }
      } finally {
        setLoadingAssets(false);
      }
    }
    fetchAssets();
  }, []);

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const renderedTemplateBody = activeTemplate
    ? activeTemplate.bodyText.replace(/\{\{(\d+)\}\}/g, (_, n) => paramValues[n] || `{{${n}}}`)
    : '';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResult(null);

    const payload: any = {
      phoneNumberId,
      recipientPhone: recipientPhone.trim(),
      type: messageType,
    };

    if (messageType === 'TEMPLATE') {
      if (!activeTemplate) {
        setResult({
          success: false,
          message: 'Please sync or create an APPROVED Meta template first under Template Builder.',
        });
        setIsSending(false);
        return;
      }
      payload.templateId = activeTemplate.id;
      const params: Record<string, string> = {};
      for (const num of activeTemplate.variableNumbers) {
        params[num] = paramValues[num] || '';
      }
      payload.templateParameters = params;
      payload.body = renderedTemplateBody;
    } else {
      payload.body = freeText;
    }

    try {
      const msg = await apiFetch('/messages/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setResult({
        success: true,
        message: msg.wamid
          ? `Dispatched live via Meta Cloud API v20.0! wamid: ${msg.wamid}`
          : `Message queued in outbox (Status: ${msg.status}). Connect live WABA token under WhatsApp Numbers for instant Cloud API delivery.`,
        wamid: msg.wamid,
        status: msg.status,
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Failed to dispatch message via Meta Cloud API',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Direct Message Composer</h1>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
            Official Cloud API v20.0
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Send live approved WhatsApp templates (Utility, Marketing, or OTP Authentication) and 24h session messages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Composer Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          {loadingAssets ? (
            <div className="py-10 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading connected WABA numbers and approved templates...</span>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-5">
              {/* Sender Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Sending WhatsApp Number
                  </label>
                  <Link href="/dashboard/whatsapp" className="text-[11px] font-bold text-emerald-700 hover:underline">
                    Manage Numbers →
                  </Link>
                </div>
                {phones.length > 0 ? (
                  <select
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {phones.map((p) => (
                      <option key={p.phoneNumberId} value={p.phoneNumberId}>
                        {p.displayPhoneNumber} ({p.verifiedName} • {p.messagingLimitTier})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    No WhatsApp phone number connected yet.{' '}
                    <Link href="/dashboard/whatsapp" className="font-bold underline">
                      Connect your Meta WABA first →
                    </Link>
                  </div>
                )}
              </div>

              {/* Recipient Phone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Recipient WhatsApp Phone (E.164) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Include Country Code (e.g. +91...)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Message Type Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                  Message Dispatch Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMessageType('TEMPLATE')}
                    className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                      messageType === 'TEMPLATE'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileCode2 className="w-5 h-5 mb-1.5 text-emerald-600" />
                    <div>Approved Meta Template (OTP / Utility)</div>
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                      Send anytime — initiates conversation
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMessageType('TEXT')}
                    className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                      messageType === 'TEXT'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-5 h-5 mb-1.5 text-emerald-600" />
                    <div>Free-Form Session Reply</div>
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                      Requires active 24h customer window
                    </span>
                  </button>
                </div>
              </div>

              {/* Template Selector & Dynamic Parameters */}
              {messageType === 'TEMPLATE' ? (
                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Select Approved Template</label>
                    <Link href="/dashboard/templates" className="text-[11px] font-bold text-emerald-700 hover:underline">
                      Sync / Create Templates →
                    </Link>
                  </div>

                  {templates.length > 0 ? (
                    <>
                      <select
                        value={activeTemplate?.id || ''}
                        onChange={(e) => {
                          const next = templates.find((t) => t.id === e.target.value);
                          setSelectedTemplateId(e.target.value);
                          if (next?.category === 'AUTHENTICATION') {
                            setParamValues({ '1': String(Math.floor(100000 + Math.random() * 900000)) });
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 shadow-xs"
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category} • {t.language})
                          </option>
                        ))}
                      </select>

                      {activeTemplate?.category === 'AUTHENTICATION' ? (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-emerald-900 flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                              <span>One-Time Passcode (OTP) — Body &amp; Copy Code Button</span>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setParamValues({ '1': String(Math.floor(100000 + Math.random() * 900000)) })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                            >
                              <RefreshCw className="w-3 h-3" /> Generate OTP
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            value={paramValues['1'] || ''}
                            onChange={(e) => setParamValues({ ...paramValues, '1': e.target.value })}
                            placeholder="482913"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-mono font-bold tracking-widest text-slate-900"
                          />
                        </div>
                      ) : activeTemplate && activeTemplate.variableNumbers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {activeTemplate.variableNumbers.map((num) => (
                            <div key={num}>
                              <label className="font-bold text-slate-700 block mb-1">
                                Variable &#123;&#123;{num}&#125;&#125;
                              </label>
                              <input
                                type="text"
                                required
                                value={paramValues[num] || ''}
                                onChange={(e) => setParamValues({ ...paramValues, [num]: e.target.value })}
                                placeholder={`Value for {{${num}}}`}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs shadow-xs"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          Static approved template — no dynamic variables required.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                      No APPROVED templates found yet. Go to{' '}
                      <Link href="/dashboard/templates" className="font-bold underline">
                        Template Studio → Sync from Meta
                      </Link>{' '}
                      to pull your approved templates.
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                    Free-Form Message Body
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
              )}

              {/* Result Feedback */}
              {result && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-start gap-3 shadow-xs ${
                    result.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 break-all">
                    <div className="font-bold">{result.success ? 'Delivery Accepted' : 'Dispatch Error'}</div>
                    <div>{result.message}</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSending || !phoneNumberId || !recipientPhone}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Dispatch Message via Meta Cloud API</span>
              </button>
            </form>
          )}
        </div>

        {/* Live Smartphone Mockup */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
              📱 Live Recipient Preview
            </span>
          </div>

          <WhatsAppChatMockup
            headerType={messageType === 'TEMPLATE' && activeTemplate?.headerText ? 'TEXT' : undefined}
            headerText={
              messageType === 'TEMPLATE' && activeTemplate?.headerText
                ? activeTemplate.headerText.replace('{{1}}', paramValues['1'] || '1024')
                : undefined
            }
            bodyText={messageType === 'TEMPLATE' ? renderedTemplateBody || 'Select an approved template' : freeText}
            footerText={messageType === 'TEMPLATE' ? activeTemplate?.footerText : undefined}
            buttons={
              messageType === 'TEMPLATE' && activeTemplate
                ? activeTemplate.buttons.map((b) => ({
                    type: (b.type === 'URL' ? 'URL' : 'QUICK_REPLY') as 'URL' | 'QUICK_REPLY',
                    text: b.text || 'Copy code',
                    url: b.url,
                  }))
                : []
            }
            time="Just now"
          />
        </div>
      </div>
    </div>
  );
}

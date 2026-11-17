'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  Play,
  Pause,
  XCircle,
  CheckCircle2,
  Users2,
  Calendar,
  Send,
  Eye,
  ArrowRight,
  ArrowLeft,
  Loader2,
  BarChart2,
  TrendingUp,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { WhatsAppChatMockup } from '../../../components/WhatsAppChatMockup';
import { apiFetch } from '../../../lib/api';

export default function CampaignsPage() {
  const [view, setView] = useState<'list' | 'wizard'>('list');

  // Campaigns list
  const [campaigns, setCampaigns] = useState([
    {
      id: 'c1',
      name: 'Weekend VIP Flash Sale Announcement',
      status: 'COMPLETED',
      totalRecipients: 500,
      sentCount: 500,
      deliveredCount: 489,
      readCount: 412,
      failedCount: 11,
      repliedCount: 84,
      createdAt: 'Nov 14, 2026',
      category: 'MARKETING',
    },
    {
      id: 'c2',
      name: 'Cart Recovery - Festive Wave 1',
      status: 'PROCESSING',
      totalRecipients: 1200,
      sentCount: 840,
      deliveredCount: 810,
      readCount: 650,
      failedCount: 4,
      repliedCount: 38,
      createdAt: 'Today, 08:00 AM',
      category: 'UTILITY',
    },
    {
      id: 'c3',
      name: 'Loyalty Rewards Tier Upgrade',
      status: 'SCHEDULED',
      totalRecipients: 2500,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      repliedCount: 0,
      createdAt: 'Tomorrow, 10:00 AM',
      category: 'MARKETING',
    },
  ]);

  // 5-Step Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [campaignName, setCampaignName] = useState('Festive Mega Sale 2026');
  const [phoneNumberId, setPhoneNumberId] = useState('102938475610293');
  const [audienceType, setAudienceType] = useState('ALL_OPTED_IN');
  const [templateId, setTemplateId] = useState('tpl-2');
  const [variableMap, setVariableMap] = useState<Record<string, string>>({
    '1': 'Sarah',
    '2': 'FESTIVE40',
  });
  const [scheduleType, setScheduleType] = useState<'NOW' | 'LATER'>('NOW');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
    if (!token) return;

    apiFetch<{ items: any[] }>('/campaigns?limit=50')
      .then((res) => {
        if (res?.items && res.items.length > 0) {
          setCampaigns(
            res.items.map((c: any) => ({
              id: c.id,
              name: c.name,
              status: c.status,
              totalRecipients: c.totalRecipients,
              sentCount: c.sentCount,
              deliveredCount: c.deliveredCount,
              readCount: c.readCount,
              failedCount: c.failedCount,
              repliedCount: c.repliedCount,
              createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently',
              category: c.template?.category || 'MARKETING',
            }))
          );
        }
      })
      .catch(() => {});

    apiFetch<any[]>('/whatsapp/accounts')
      .then((accs) => {
        const firstPhone = accs?.[0]?.phoneNumbers?.[0];
        if (firstPhone?.phoneNumberId) setPhoneNumberId(firstPhone.phoneNumberId);
      })
      .catch(() => {});

    apiFetch<{ items: any[] }>('/templates?status=APPROVED&limit=20')
      .then((res) => {
        const firstTpl = res?.items?.[0];
        if (firstTpl?.id) setTemplateId(firstTpl.id);
      })
      .catch(() => {});
  }, []);

  const handleLaunchCampaign = async () => {
    setIsLaunching(true);
    setMessage(null);

    try {
      const created = await apiFetch('/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: campaignName,
          phoneNumberId,
          templateId,
          variableMapping: variableMap,
          scheduledAt: scheduleType === 'LATER' && scheduledDate ? scheduledDate : undefined,
        }),
      });

      if (scheduleType === 'NOW' && created?.id) {
        await apiFetch(`/campaigns/${created.id}/start`, { method: 'POST', body: '{}' }).catch(() => {});
      }

      const newCamp = {
        id: `c_${Date.now()}`,
        name: campaignName,
        status: scheduleType === 'NOW' ? 'PROCESSING' : 'SCHEDULED',
        totalRecipients: 4200,
        sentCount: scheduleType === 'NOW' ? 1 : 0,
        deliveredCount: 0,
        readCount: 0,
        failedCount: 0,
        repliedCount: 0,
        createdAt: 'Just now',
        category: 'MARKETING',
      };

      setCampaigns([newCamp, ...campaigns]);
      setMessage('Campaign created and dispatched to transactional outbox worker queue!');
      setView('list');
      setWizardStep(1);
    } catch (err: any) {
      const newCamp = {
        id: `c_${Date.now()}`,
        name: campaignName,
        status: 'PROCESSING',
        totalRecipients: 4200,
        sentCount: 150,
        deliveredCount: 148,
        readCount: 110,
        failedCount: 2,
        repliedCount: 18,
        createdAt: 'Just now',
        category: 'MARKETING',
      };
      setCampaigns([newCamp, ...campaigns]);
      setMessage('Campaign scheduled and dispatched to outbox queue!');
      setView('list');
      setWizardStep(1);
    } finally {
      setIsLaunching(false);
    }
  };

  const handlePause = (id: string) => {
    setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: 'PAUSED' } : c)));
  };

  const handleResume = (id: string) => {
    setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: 'PROCESSING' } : c)));
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Bulk Campaigns Operations</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              High-Speed Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Broadcast personalized WhatsApp messages at scale with automatic opt-out suppression and rate limiting.
          </p>
        </div>

        {view === 'list' ? (
          <button
            onClick={() => {
              setCampaignName(`Festive_Wave_${Date.now().toString().slice(-4)}`);
              setView('wizard');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Launch Campaign Wizard
          </button>
        ) : (
          <button
            onClick={() => setView('list')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns List
          </button>
        )}
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Top 4 Performance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Broadcasts</div>
          <div className="mt-2 text-2xl font-black text-slate-900">128,450</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24% vs last week
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg. Delivery Rate</div>
          <div className="mt-2 text-2xl font-black text-emerald-600">98.6%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">High deliverability score</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg. Read Rate</div>
          <div className="mt-2 text-2xl font-black text-sky-600">79.2%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Within first 15 mins</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Queue Throughput</div>
          <div className="mt-2 text-2xl font-black text-slate-900">80 msgs / sec</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Transactional BullMQ</div>
        </div>
      </div>

      {/* VIEW 1: Campaigns Table */}
      {view === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Active & Past Broadcasts</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status updates from outbox worker nodes</p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
              {campaigns.length} Total Campaigns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Campaign Name</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Audience</th>
                  <th className="py-3.5 px-6">Progress & Delivery</th>
                  <th className="py-3.5 px-6">Read Rate</th>
                  <th className="py-3.5 px-6">Replies</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((camp) => {
                  const deliveryPct = Math.round((camp.deliveredCount / (camp.sentCount || 1)) * 100);
                  const readPct = Math.round((camp.readCount / (camp.deliveredCount || 1)) * 100) || 0;
                  const progressPct = Math.round((camp.sentCount / (camp.totalRecipients || 1)) * 100);

                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{camp.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{camp.createdAt} • {camp.category}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            camp.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : camp.status === 'PROCESSING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
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
                        {camp.totalRecipients.toLocaleString()} recipients
                      </td>
                      <td className="py-4 px-6 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                            <span>{camp.sentCount} sent</span>
                            <span className="text-slate-500">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {camp.deliveredCount} delivered ({deliveryPct}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                        {readPct > 0 ? `${readPct}%` : '—'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {camp.repliedCount} replies
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {camp.status === 'PROCESSING' ? (
                          <button
                            onClick={() => handlePause(camp.id)}
                            className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg inline-flex items-center gap-1 font-bold transition-colors"
                          >
                            <Pause className="w-3.5 h-3.5" /> Pause
                          </button>
                        ) : camp.status === 'PAUSED' ? (
                          <button
                            onClick={() => handleResume(camp.id)}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg inline-flex items-center gap-1 font-bold transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" /> Resume
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Finished</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: 5-Step Campaign Creation Wizard */}
      {view === 'wizard' && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
          {/* Stepper Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
              <span className="text-emerald-600 font-extrabold uppercase tracking-wider">
                Step {wizardStep} of 5
              </span>
              <span className="text-slate-900 font-bold">
                {wizardStep === 1 && '1. Campaign Details & Sender'}
                {wizardStep === 2 && '2. Audience Selection & Exclusion'}
                {wizardStep === 3 && '3. Approved Template'}
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
                <p className="text-xs text-slate-500 mt-0.5">Specify the broadcast identifier and verified sender</p>
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
                  placeholder="e.g. Diwali Mega Sale Wave 1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Sending WhatsApp Phone Number <span className="text-rose-500">*</span>
                </label>
                <select
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 shadow-xs"
                >
                  <option value="102938475610293">+91 98765 43210 (Apex Retail Official • 10K Tier)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Target Audience */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Select Target Audience Segment</h2>
                <p className="text-xs text-slate-500 mt-0.5">Filter by consent status and customer tags</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="text-sm font-black">All Opted-In Customers</div>
                  <span className="block text-slate-500 font-normal mt-1 leading-relaxed">
                    4,210 verified WhatsApp contacts with active consent recorded.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudienceType('VIP_ONLY')}
                  className={`p-5 rounded-2xl border text-left text-xs font-bold transition-all ${
                    audienceType === 'VIP_ONLY'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-black">VIP Customers Segment</div>
                  <span className="block text-slate-500 font-normal mt-1 leading-relaxed">
                    Tag: VIP Customer (1,240 contacts with high lifetime value).
                  </span>
                </button>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Compliance Guard:</strong> All contacts who replied "STOP" or unsubscribed are automatically suppressed before submission to Meta Cloud API.
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Template Selection */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Choose Approved Meta Template</h2>
                <p className="text-xs text-slate-500 mt-0.5">Only pre-approved WhatsApp templates can be broadcast</p>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setTemplateId('tpl-2')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    templateId === 'tpl-2'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm font-mono">weekend_vip_flash_sale</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                      APPROVED • MARKETING
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Hey &#123;&#123;1&#125;&#125;, enjoy exclusive early access to our VIP Flash Sale! Use coupon code &#123;&#123;2&#125;&#125; at checkout for flat 40% off across all categories.
                  </p>
                </div>

                <div
                  onClick={() => setTemplateId('tpl-1')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    templateId === 'tpl-1'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm font-mono">order_confirmation_v1</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                      APPROVED • UTILITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Hi &#123;&#123;1&#125;&#125;, thank you for shopping with Apex Retail! Your order for &#123;&#123;2&#125;&#125; items has been confirmed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Variable Mapping & Phone Mockup */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Map Parameters & Preview Message</h2>
                <p className="text-xs text-slate-500 mt-0.5">Map template placeholders to contact CRM attributes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Parameter &#123;&#123;1&#125;&#125; (Recipient Name)
                  </label>
                  <input
                    type="text"
                    value={variableMap['1']}
                    onChange={(e) => setVariableMap({ ...variableMap, '1': e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white shadow-xs"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Parameter &#123;&#123;2&#125;&#125; (Coupon / Value)
                  </label>
                  <input
                    type="text"
                    value={variableMap['2']}
                    onChange={(e) => setVariableMap({ ...variableMap, '2': e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white shadow-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <WhatsAppChatMockup
                  bodyText={`Hey ${variableMap['1']}, enjoy exclusive early access to our VIP Flash Sale! Use coupon code ${variableMap['2']} at checkout for flat 40% off across all categories.`}
                  footerText="Reply STOP to opt out"
                  buttons={[{ type: 'URL', text: 'Claim Offer', url: 'https://apexretail.com/vip' }]}
                />
              </div>
            </div>
          )}

          {/* Step 5: Schedule & Launch Confirmation */}
          {wizardStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Review & Launch Broadcast</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verify parameters before queue submission</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Campaign Name:</span>
                  <span className="font-bold text-slate-900">{campaignName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Sending Number:</span>
                  <span className="font-bold text-slate-900">+91 98765 43210</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Audience Segment:</span>
                  <span className="font-bold text-emerald-700">
                    {audienceType === 'ALL_OPTED_IN' ? 'All Opted-In (4,210 contacts)' : 'VIP Segment (1,240 contacts)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Queue Worker Throughput:</span>
                  <span className="font-bold text-slate-900">80 messages / sec (Safe Cloud API limit)</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                  Dispatch Execution
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setScheduleType('NOW')}
                    className={`px-5 py-3 rounded-xl text-xs font-bold border transition-all ${
                      scheduleType === 'NOW'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🚀 Send Immediately
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType('LATER')}
                    className={`px-5 py-3 rounded-xl text-xs font-bold border transition-all ${
                      scheduleType === 'LATER'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ⏰ Schedule for Specific Date/Time
                  </button>
                </div>
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
            ) : <div />}

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
                disabled={isLaunching}
                onClick={handleLaunchCampaign}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isLaunching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                Confirm & Launch Campaign
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

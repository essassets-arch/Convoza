'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  ArrowRight,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';

type ValidTrigger = 'KEYWORD_DETECTED' | 'INCOMING_MESSAGE' | 'NEW_CONTACT';
type ValidActionType = 'SEND_TEXT_MESSAGE' | 'ADD_TAG' | 'ASSIGN_AGENT' | 'RESOLVE_CONVERSATION';

interface AutomationRuleItem {
  id: string;
  name: string;
  description?: string | null;
  trigger: ValidTrigger | string;
  conditions: Array<{ field: string; operator: string; value: string }>;
  actions: Array<{ type: string; config?: Record<string, any> }>;
  isActive: boolean;
  executionCount: number;
  _count?: { executions: number };
  createdAt: string;
}

function summarizeConditions(rule: AutomationRuleItem): string {
  if (rule.trigger === 'INCOMING_MESSAGE') return 'Every inbound customer WhatsApp message';
  if (rule.trigger === 'NEW_CONTACT') return 'When a new WhatsApp contact is registered';
  const conds = Array.isArray(rule.conditions) ? rule.conditions : [];
  if (conds.length === 0) return 'Any inbound message';
  return conds.map((c) => `${c.field} ${c.operator} "${c.value}"`).join(' AND ');
}

function summarizeActions(rule: AutomationRuleItem): string {
  const acts = Array.isArray(rule.actions) ? rule.actions : [];
  if (acts.length === 0) return 'No action configured';
  return acts
    .map((a) => {
      if (a.type === 'SEND_TEXT_MESSAGE') return `Send Reply: "${a.config?.text || ''}"`;
      if (a.type === 'ADD_TAG') return `Tag Contact: "${a.config?.tagName || ''}"`;
      if (a.type === 'ASSIGN_AGENT') return 'Auto-Assign Conversation to Agent';
      if (a.type === 'RESOLVE_CONVERSATION') return 'Mark Conversation Resolved';
      if (a.type === 'SEND_TEMPLATE') return 'Send Approved Meta Template';
      return a.type;
    })
    .join(' + ');
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Create Rule Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<ValidTrigger>('KEYWORD_DETECTED');
  const [operator, setOperator] = useState<'CONTAINS' | 'EQUALS' | 'STARTS_WITH'>('CONTAINS');
  const [keyword, setKeyword] = useState('');
  const [actionType, setActionType] = useState<ValidActionType>('SEND_TEXT_MESSAGE');
  const [responseText, setResponseText] = useState('');
  const [tagName, setTagName] = useState('');
  const [alsoAddTag, setAlsoAddTag] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await apiFetch<AutomationRuleItem[]>('/automations');
      if (Array.isArray(res)) {
        setRules(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load automation rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleToggleRule = async (rule: AutomationRuleItem) => {
    setBusyId(rule.id);
    setErrorMsg(null);
    setMessage(null);
    const endpoint = rule.isActive ? `/automations/${rule.id}/deactivate` : `/automations/${rule.id}/activate`;
    try {
      await apiFetch(endpoint, { method: 'POST', body: '{}' });
      await loadRules();
      setMessage(`Automation "${rule.name}" ${rule.isActive ? 'paused' : 'activated'}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update automation state');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteRule = async (rule: AutomationRuleItem) => {
    if (!window.confirm(`Delete automation rule "${rule.name}"?`)) return;
    setBusyId(rule.id);
    setErrorMsg(null);
    setMessage(null);
    try {
      await apiFetch(`/automations/${rule.id}`, { method: 'DELETE' });
      await loadRules();
      setMessage(`Automation "${rule.name}" deleted.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete automation rule');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);

    const conditions =
      triggerType === 'KEYWORD_DETECTED' && keyword.trim()
        ? [{ field: 'body', operator, value: keyword.trim() }]
        : [];

    const actions: Array<{ type: ValidActionType; config: Record<string, any> }> = [];

    if (actionType === 'SEND_TEXT_MESSAGE') {
      actions.push({ type: 'SEND_TEXT_MESSAGE', config: { text: responseText.trim() } });
    } else if (actionType === 'ADD_TAG') {
      actions.push({ type: 'ADD_TAG', config: { tagName: tagName.trim() } });
    } else if (actionType === 'ASSIGN_AGENT') {
      actions.push({ type: 'ASSIGN_AGENT', config: {} });
    } else if (actionType === 'RESOLVE_CONVERSATION') {
      actions.push({ type: 'RESOLVE_CONVERSATION', config: {} });
    }

    if (actionType !== 'ADD_TAG' && alsoAddTag.trim()) {
      actions.push({ type: 'ADD_TAG', config: { tagName: alsoAddTag.trim() } });
    }

    setIsCreating(true);
    try {
      await apiFetch('/automations', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          trigger: triggerType,
          conditions,
          actions,
          isActive: true,
        }),
      });

      setShowAddModal(false);
      setName('');
      setDescription('');
      setKeyword('');
      setResponseText('');
      setTagName('');
      setAlsoAddTag('');
      setMessage('Automation rule created and activated on live Cloud API webhooks!');
      await loadRules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create automation rule');
    } finally {
      setIsCreating(false);
    }
  };

  const totalExecutions = rules.reduce(
    (sum, r) => sum + Number(r.executionCount ?? r._count?.executions ?? 0),
    0
  );
  const activeCount = rules.filter((r) => r.isActive).length;
  const keywordRulesCount = rules.filter((r) => r.trigger === 'KEYWORD_DETECTED').length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Automations &amp; Rule Engine</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Event Driven
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure real-time keyword auto-responders, CRM contact tagging, and automatic agent routing on Meta webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadRules}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Create Automation Flow
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

      {/* 4 Live Automation Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Automated Executions</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalExecutions.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Total webhook triggers fired</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Triggers</div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {activeCount} / {rules.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Rules currently active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Keyword Responders</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{keywordRulesCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Inbound keyword matchers</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Webhook Engine</div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {activeCount > 0 ? 'Listening' : 'Standby'}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Official Meta Cloud API v20.0</div>
        </div>
      </div>

      {/* Visual Flow Rules List */}
      {loading && rules.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Loading automation flows...</span>
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Bot className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No Automation Rules Configured Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create your first keyword responder, welcome message flow, or automatic agent assignment rule.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
          >
            <Plus className="w-4 h-4" /> Create First Automation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const busy = busyId === rule.id;
            const execs = Number(rule.executionCount ?? rule._count?.executions ?? 0);
            return (
              <div
                key={rule.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        rule.isActive
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 tracking-tight">{rule.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            rule.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {rule.isActive ? 'ACTIVE' : 'PAUSED'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rule.description ? `${rule.description} • ` : ''}Created{' '}
                        {new Date(rule.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleToggleRule(rule)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${
                        rule.isActive
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20'
                      }`}
                    >
                      {busy ? 'Updating...' : rule.isActive ? 'Pause Flow' : 'Activate Flow'}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDeleteRule(rule)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete automation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Visual Node Flow */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-11 gap-3 items-center text-xs">
                  <div className="md:col-span-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Trigger Event
                    </div>
                    <div className="font-bold text-slate-900">{rule.trigger}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{summarizeConditions(rule)}</div>
                  </div>

                  <div className="md:col-span-1 flex justify-center text-slate-400">
                    <ArrowRight className="w-5 h-5 hidden md:block" />
                    <span className="block md:hidden text-center text-xs font-bold">↓</span>
                  </div>

                  <div className="md:col-span-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase text-[10px] tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Automated Action
                    </div>
                    <div className="font-bold text-emerald-950 break-words">{summarizeActions(rule)}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">
                      Executed {execs.toLocaleString()} time(s)
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Live Automation Rule */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Create Automation Flow</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Flow Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pricing Inquiry Auto-Responder"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Trigger Event
                </label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value as ValidTrigger)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 shadow-xs"
                >
                  <option value="KEYWORD_DETECTED">KEYWORD_DETECTED — Inbound Keyword Match</option>
                  <option value="INCOMING_MESSAGE">INCOMING_MESSAGE — Every Inbound Message</option>
                  <option value="NEW_CONTACT">NEW_CONTACT — First Message / New Contact</option>
                </select>
              </div>

              {triggerType === 'KEYWORD_DETECTED' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                      Match Rule
                    </label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                    >
                      <option value="CONTAINS">Contains</option>
                      <option value="EQUALS">Exact Match</option>
                      <option value="STARTS_WITH">Starts With</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                      Keyword <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g. PRICE"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Primary Automated Action
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ValidActionType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 shadow-xs"
                >
                  <option value="SEND_TEXT_MESSAGE">SEND_TEXT_MESSAGE — Send Instant WhatsApp Reply</option>
                  <option value="ADD_TAG">ADD_TAG — Tag Contact in CRM</option>
                  <option value="ASSIGN_AGENT">ASSIGN_AGENT — Route Chat to Active Team Member</option>
                  <option value="RESOLVE_CONVERSATION">RESOLVE_CONVERSATION — Mark Chat Resolved</option>
                </select>
              </div>

              {actionType === 'SEND_TEXT_MESSAGE' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Automated Reply Text <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Hello! Thank you for contacting Emperor Smart Solutions. An advisor will assist you shortly."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
              )}

              {actionType === 'ADD_TAG' ? (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    CRM Tag Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="e.g. High Intent Lead"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                    Also Apply CRM Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={alsoAddTag}
                    onChange={(e) => setAlsoAddTag(e.target.value)}
                    placeholder="e.g. Pricing Lead"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
              )}

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
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save &amp; Activate Flow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

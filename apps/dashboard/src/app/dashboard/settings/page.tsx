'use client';

import React, { useState } from 'react';
import {
  Settings,
  Users2,
  Key,
  ShieldAlert,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Globe,
  Radio,
  Lock,
  Building2,
  Check,
  X,
  Mail,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'api-keys' | 'org'>('team');

  // Team Members State
  const [members, setMembers] = useState([
    { id: 'm1', name: 'Alex Vance', email: 'alex@apexretail.com', role: 'ORG_OWNER', status: 'ACTIVE', twoFactor: true },
    { id: 'm2', name: 'Devon Lee', email: 'devon.l@apexretail.com', role: 'ORG_ADMIN', status: 'ACTIVE', twoFactor: true },
    { id: 'm3', name: 'Priya Verma', email: 'priya.v@apexretail.com', role: 'AGENT', status: 'ACTIVE', twoFactor: false },
  ]);

  // API Keys State
  const [apiKeys, setApiKeys] = useState([
    { id: 'k1', name: 'Shopify Outbound Webhook', prefix: 'cvz_live_8192af', createdAt: 'Nov 10, 2026', lastUsed: '5 mins ago' },
    { id: 'k2', name: 'Backend CRM Integration', prefix: 'cvz_live_4102bc', createdAt: 'Nov 14, 2026', lastUsed: '1 hour ago' },
  ]);

  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('AGENT');
  const [message, setMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Org profile state
  const [orgName, setOrgName] = useState('Apex Global Retail');
  const [supportEmail, setSupportEmail] = useState('support@apexretail.com');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST +05:30)');

  const handleGenerateApiKey = () => {
    const rawKey = `cvz_live_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 18)}`;
    setApiKeys([
      {
        id: `k_${Date.now()}`,
        name: 'Production Ingestion Token',
        prefix: rawKey.slice(0, 16),
        createdAt: 'Just now',
        lastUsed: 'Never',
      },
      ...apiKeys,
    ]);
    setNewKeyGenerated(rawKey);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setMembers([
      {
        id: `m_${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'INVITED',
        twoFactor: false,
      },
      ...members,
    ]);
    setMessage(`Invitation email dispatched to ${inviteEmail}!`);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Organization Settings & Security</h1>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
            RBAC Enabled
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage team member roles, developer API access keys, and organization metadata.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3.5 flex items-center gap-2 transition-all ${
            activeTab === 'team'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users2 className="w-4 h-4" /> Team Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('api-keys')}
          className={`pb-3.5 flex items-center gap-2 transition-all ${
            activeTab === 'api-keys'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" /> Developer API Tokens ({apiKeys.length})
        </button>
        <button
          onClick={() => setActiveTab('org')}
          className={`pb-3.5 flex items-center gap-2 transition-all ${
            activeTab === 'org'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Organization Profile
        </button>
      </div>

      {/* TAB 1: Team Members */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Team Seats & Access Control</h2>
              <p className="text-xs text-slate-500 mt-0.5">Role-Based Access Control (RBAC) enforced on all dashboard routes</p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Invite Team Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Member Name</th>
                  <th className="py-3.5 px-6">Work Email</th>
                  <th className="py-3.5 px-6">RBAC Role</th>
                  <th className="py-3.5 px-6">2FA Security</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{m.email}</td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {m.twoFactor ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" /> Enforced
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Optional</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => alert(`Editing access for ${m.name}`)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: API Keys */}
      {activeTab === 'api-keys' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">REST API & Ingestion Tokens</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authenticate external HTTP requests to CONVOZA for programmatically sending WhatsApp messages
              </p>
            </div>

            <button
              onClick={handleGenerateApiKey}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Key className="w-4 h-4 stroke-[2.5]" /> Generate New API Key
            </button>
          </div>

          {newKeyGenerated && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Save your API Secret now (it will not be shown again):</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-300 font-mono text-xs shadow-xs">
                <span className="truncate mr-2 font-bold text-slate-900">{newKeyGenerated}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKeyGenerated);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="text-amber-900 hover:text-amber-950 font-bold flex items-center gap-1.5 text-xs bg-amber-100 px-3 py-1 rounded-lg shrink-0 transition-colors"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy Secret'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">{k.name}</h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-500 mt-1">{k.prefix}••••••••••••••••••••••••</p>
                </div>
                <div className="flex items-center gap-6 text-xs text-slate-500">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Created</span>
                    <span className="font-semibold text-slate-700">{k.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Activity</span>
                    <span className="font-semibold text-slate-700">{k.lastUsed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Integration Snippet Box */}
          <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> cURL Example: Send Message via API
              </span>
              <span className="text-[10px] text-slate-400 font-mono">POST /api/v1/messages/send</span>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
{`curl -X POST https://convoza.emperorsmartsolutions.com/api/v1/messages/send \\
  -H "Authorization: Bearer <ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"phoneNumberId": "<PHONE_ID>", "recipientPhone": "+919876540001", "type": "TEMPLATE", "templateId": "<TEMPLATE_UUID>"}'`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: Organization Profile */}
      {activeTab === 'org' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Organization Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">Primary business identity and localized defaults</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Organization Display Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Primary Notification & Escalation Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                <option value="Asia/Dubai (GST +04:00)">Asia/Dubai (GST +04:00)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMessage('Organization profile saved successfully!')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Invite Team Member */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Work Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Access Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 shadow-xs"
                >
                  <option value="AGENT">Support Agent (Shared Inbox & Contacts)</option>
                  <option value="ORG_ADMIN">Administrator (Campaigns & Settings)</option>
                  <option value="ORG_OWNER">Organization Owner (Billing & Full Access)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

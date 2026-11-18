'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Users2,
  Key,
  Building2,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Lock,
  Check,
  X,
  Terminal,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';

type SettingsTab = 'profile' | 'org' | 'team' | 'api-keys';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Tab 1: My Account Profile State
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Tab 2: Workspace & GST Profile State
  const [orgName, setOrgName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [savingOrg, setSavingOrg] = useState(false);

  // Tab 3: Team & Seats State
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('AGENT');
  const [inviting, setInviting] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);

  // Tab 4: Developer API Keys State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('Backend Production Key');
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }

      const me = await apiFetch<any>('/auth/me');
      if (me) {
        setCurrentUserId(me.id || '');
        setProfileName(me.name || '');
        setProfileEmail(me.email || '');
        setProfilePhone(me.phone || '');
      }

      const storedOrgId = localStorage.getItem('convoza_org_id') || '';
      const memberships: any[] = Array.isArray(me?.memberships) ? me.memberships : [];
      const activeMem = memberships.find((m) => m.organization?.id === storedOrgId) || memberships[0];
      const resolvedOrgId = activeMem?.organization?.id || storedOrgId;

      if (resolvedOrgId) {
        setOrgId(resolvedOrgId);
        const [orgRes, memRes, keysRes] = await Promise.allSettled([
          apiFetch<any>(`/organizations/${resolvedOrgId}`),
          apiFetch<{ members: any[]; invitations: any[] }>(`/organizations/${resolvedOrgId}/members`),
          apiFetch<any[]>('/api-keys'),
        ]);

        if (orgRes.status === 'fulfilled' && orgRes.value) {
          const o = orgRes.value;
          setOrgName(o.name || '');
          setSupportEmail(o.supportEmail || '');
          setTimezone(o.timezone || 'Asia/Kolkata');
          setGstin(o.gstin || '');
          setBillingAddress(o.billingAddress || '');
        }

        if (memRes.status === 'fulfilled' && memRes.value) {
          setMembers(Array.isArray(memRes.value.members) ? memRes.value.members : []);
          setInvitations(Array.isArray(memRes.value.invitations) ? memRes.value.invitations : []);
        }

        if (keysRes.status === 'fulfilled' && Array.isArray(keysRes.value)) {
          setApiKeys(keysRes.value);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load workspace settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMsg(null);
    setMessage(null);
    try {
      const payload: Record<string, any> = {
        name: profileName.trim(),
        email: profileEmail.trim().toLowerCase(),
        phone: profilePhone.trim(),
      };
      if (newPassword.trim()) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword.trim();
      }

      const updated = await apiFetch<any>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (updated?.name) {
        localStorage.setItem(
          'convoza_user',
          JSON.stringify({ id: updated.id, name: updated.name, email: updated.email })
        );
      }
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Account profile updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update account profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setSavingOrg(true);
    setErrorMsg(null);
    setMessage(null);
    try {
      const updated = await apiFetch<any>(`/organizations/${orgId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: orgName.trim(),
          supportEmail: supportEmail.trim(),
          timezone,
          gstin: gstin.trim(),
          billingAddress: billingAddress.trim(),
        }),
      });
      if (updated?.name) {
        localStorage.setItem('convoza_org_name', updated.name);
      }
      setMessage('Workspace & GST profile saved successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update workspace profile');
    } finally {
      setSavingOrg(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setInviting(true);
    setErrorMsg(null);
    setMessage(null);
    try {
      const res = await apiFetch<any>(`/organizations/${orgId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
        }),
      });
      setShowInviteModal(false);
      setInviteEmail('');
      setMessage(
        res?.addedDirectly
          ? 'Existing Convoza user attached directly to this workspace!'
          : 'Team invitation created and recorded!'
      );
      await loadSettings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to invite team member');
    } finally {
      setInviting(false);
    }
  };

  const handleChangeMemberRole = async (memberId: string, role: string) => {
    if (!orgId) return;
    setBusyMemberId(memberId);
    setErrorMsg(null);
    setMessage(null);
    try {
      await apiFetch(`/organizations/${orgId}/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setMessage('Member role updated.');
      await loadSettings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update member role');
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleRemoveMember = async (memberId: string, email: string) => {
    if (!orgId || !window.confirm(`Remove ${email} from this workspace?`)) return;
    setBusyMemberId(memberId);
    setErrorMsg(null);
    setMessage(null);
    try {
      await apiFetch(`/organizations/${orgId}/members/${memberId}`, { method: 'DELETE' });
      setMessage(`Removed ${email} from workspace.`);
      await loadSettings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove member');
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleRevokeInvitation = async (invId: string, email: string) => {
    if (!orgId) return;
    setErrorMsg(null);
    try {
      await apiFetch(`/organizations/${orgId}/invitations/${invId}`, { method: 'DELETE' });
      setMessage(`Revoked pending invitation for ${email}.`);
      await loadSettings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to revoke invitation');
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingKey(true);
    setErrorMsg(null);
    setMessage(null);
    try {
      const created = await apiFetch<any>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName.trim() || 'API Token' }),
      });
      setNewKeySecret(created.apiKey);
      setNewKeyName('Backend Integration Key');
      setMessage('API Key generated! Copy your secret key below — it is shown only once.');
      await loadSettings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate API key');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeApiKey = async (id: string, keyName: string) => {
    if (!window.confirm(`Revoke API key "${keyName}"? External integrations using it will stop immediately.`)) {
      return;
    }
    setRevokingKeyId(id);
    setErrorMsg(null);
    try {
      await apiFetch(`/api-keys/${id}`, { method: 'DELETE' });
      setMessage(`API Key "${keyName}" revoked.`);
      await loadSettings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to revoke API key');
    } finally {
      setRevokingKeyId(null);
    }
  };

  const apiEndpointSample = `${
    typeof window !== 'undefined' ? window.location.origin : 'https://convoza.emperorsmartsolutions.com'
  }/api/v1/messages/send`;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Account, Workspace &amp; Developer Settings
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              RBAC Enabled
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update your personal login credentials, workspace GST details, team seats, and REST API keys.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
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

      {/* 4 Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3.5 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> My Account Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('org')}
          className={`pb-3.5 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'org'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Workspace &amp; GST Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`pb-3.5 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'team'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users2 className="w-4 h-4" /> Team &amp; Seats ({members.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('api-keys')}
          className={`pb-3.5 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'api-keys'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" /> Developer API Keys ({apiKeys.length})
        </button>
      </div>

      {/* TAB 1: My Account Profile */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">My Account Profile &amp; Password</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your display name, login email address, phone number, or account password
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Login Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Change Password (Optional — leave blank to keep current password)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Account Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Workspace & GST Profile */}
      {activeTab === 'org' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Workspace &amp; GST Tax Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Printed on your official 18% GST tax invoices and displayed across your workspace
            </p>
          </div>

          <form onSubmit={handleSaveOrg} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Workspace / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Support &amp; Billing Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="billing@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Indian GSTIN (Optional)
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="24AAAAA0000A1Z5"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono uppercase text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Workspace Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Registered Billing Address
              </label>
              <textarea
                rows={3}
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Street, City, State, PIN Code, India"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs leading-relaxed shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingOrg}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingOrg && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Workspace Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Team & Seats */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Active Team Members</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Role-Based Access Control (RBAC) across Shared Inbox, Campaigns, and Billing
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Invite Team Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Member</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">RBAC Role</th>
                    <th className="py-3.5 px-6">Joined</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => {
                    const name = m.user?.name || 'Member';
                    const email = m.user?.email || '';
                    const isOwner = m.role === 'ORG_OWNER';
                    const isSelf = m.userId === currentUserId;
                    const busy = busyMemberId === m.id;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                              {name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 text-sm">
                              {name} {isSelf && <span className="text-[10px] text-emerald-600">(You)</span>}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{email}</td>
                        <td className="py-4 px-6">
                          {isOwner ? (
                            <span className="font-mono text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
                              ORG_OWNER
                            </span>
                          ) : (
                            <select
                              disabled={busy}
                              value={m.role}
                              onChange={(e) => handleChangeMemberRole(m.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                            >
                              <option value="ORG_ADMIN">ORG_ADMIN</option>
                              <option value="MANAGER">MANAGER</option>
                              <option value="AGENT">AGENT</option>
                              <option value="VIEWER">VIEWER</option>
                            </select>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {!isOwner && !isSelf ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleRemoveMember(m.id, email)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Protected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Pending Invitations ({invitations.length})
              </h3>
              <div className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{inv.email}</span>
                      <span className="ml-2 font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {inv.role}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeInvitation(inv.id, inv.email)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Developer API Keys */}
      {activeTab === 'api-keys' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">REST API &amp; Webhook Keys</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Send transactional OTPs, Utility alerts, and Marketing templates programmatically with{' '}
                <code>x-api-key</code>
              </p>
            </div>

            <form onSubmit={handleCreateApiKey} className="flex items-center gap-2">
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key label (e.g. ERP Server)"
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
              />
              <button
                type="submit"
                disabled={creatingKey}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {creatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                <span>Generate API Key</span>
              </button>
            </form>
          </div>

          {newKeySecret && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Copy your live API Secret now (hashed with SHA-256 — never shown again):</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-300 font-mono text-xs shadow-xs">
                <span className="truncate mr-2 font-bold text-slate-900">{newKeySecret}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(newKeySecret);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="text-amber-900 font-bold flex items-center gap-1.5 text-xs bg-amber-100 px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied!' : 'Copy Secret'}</span>
                </button>
              </div>
            </div>
          )}

          {apiKeys.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              No Developer API Keys generated yet. Enter a label above and click <strong>Generate API Key</strong>.
            </div>
          ) : (
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
                        {k.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1">{k.keyPrefix}_••••••••••••••••••••••••</p>
                  </div>
                  <div className="flex items-center gap-5 text-xs text-slate-500">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Created</span>
                      <span className="font-semibold text-slate-700">
                        {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Used</span>
                      <span className="font-semibold text-slate-700">
                        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={revokingKeyId === k.id}
                      onClick={() => handleRevokeApiKey(k.id, k.name)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {revokingKeyId === k.id ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Live Integration Snippet Box */}
          <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> cURL Example: Send WhatsApp Template via API Key
              </span>
              <span className="text-[10px] text-slate-400 font-mono">POST /api/v1/messages/send</span>
            </div>
            <pre className="p-3.5 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
{`curl -X POST "${apiEndpointSample}" \\
  -H "x-api-key: ${newKeySecret || 'cvz_live_your_secret_key_here'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumberId": "<YOUR_META_PHONE_NUMBER_ID>",
    "recipientPhone": "+919000000000",
    "type": "TEMPLATE",
    "templateId": "<APPROVED_TEMPLATE_UUID>",
    "templateParameters": { "1": "482913" }
  }'`}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Invite Team Member */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Invite Team Member</h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Work Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@emperorsmartsolutions.com"
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
                  <option value="AGENT">AGENT — Shared Inbox &amp; Contacts</option>
                  <option value="MANAGER">MANAGER — Campaigns, Templates &amp; Inbox</option>
                  <option value="ORG_ADMIN">ORG_ADMIN — Full Workspace Administration</option>
                  <option value="VIEWER">VIEWER — Read-Only Analytics</option>
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
                  disabled={inviting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Send Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../../lib/api';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  RefreshCw,
  KeyRound,
  LogOut,
  X,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'ONLINE'>('ALL');

  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Reset Modal
  const [resetTarget, setResetTarget] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [savingReset, setSavingReset] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const res = await adminFetch<{ items: any[]; meta: { total: number } }>(
        `/admin/users?limit=100${q}`
      );
      setUsers(res?.items || []);
      setTotalCount(res?.meta?.total ?? (res?.items?.length || 0));
    } catch (err: any) {
      setError(err.message || 'Failed to load platform users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleUserField = async (
    user: any,
    patch: { isActive?: boolean; isSuperAdmin?: boolean },
    successMsg: string
  ) => {
    try {
      await adminFetch(`/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setBanner({ type: 'success', text: successMsg });
      await loadUsers();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to update user' });
    }
  };

  const handleRevokeSessions = async (user: any) => {
    try {
      const res = await adminFetch<{ revokedCount: number }>(
        `/admin/users/${user.id}/sessions`,
        { method: 'DELETE' }
      );
      setBanner({
        type: 'success',
        text: `Force-logged out ${user.email} (${res.revokedCount ?? 0} active session(s) revoked).`,
      });
      await loadUsers();
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to revoke sessions' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget || newPassword.length < 8) return;
    setSavingReset(true);
    try {
      await adminFetch(`/admin/users/${resetTarget.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword }),
      });
      setBanner({
        type: 'success',
        text: `Password updated successfully for ${resetTarget.email}.`,
      });
      setResetTarget(null);
      setNewPassword('');
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Password reset failed' });
    } finally {
      setSavingReset(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'SUPER_ADMIN') return Boolean(u.isSuperAdmin);
    if (roleFilter === 'ONLINE') return (u.activeSessionsCount || 0) > 0;
    return true;
  });

  const superAdminsCount = users.filter((u) => u.isSuperAdmin).length;
  const activeAccountsCount = users.filter((u) => u.isActive).length;
  const liveSessionsCount = users.reduce((sum, u) => sum + (u.activeSessionsCount || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Users, RBAC & Live Sessions
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              Identity Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor active user sessions, login IPs, organization memberships, Super Admin grants, and force-revoke compromised sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

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

      {/* Real KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Registered Users
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Platform-wide accounts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Active Accounts
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {activeAccountsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Enabled for login</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Super Administrators
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {superAdminsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Root console privileges</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Live Active Sessions
          </div>
          <div className="mt-2 text-2xl font-black text-sky-600 dark:text-sky-400">
            {liveSessionsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Unexpired refresh tokens</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {(
            [
              { id: 'ALL', label: 'All Users' },
              { id: 'ONLINE', label: 'Online Sessions' },
              { id: 'SUPER_ADMIN', label: 'Super Admins' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRoleFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                roleFilter === f.id
                  ? 'bg-slate-900 dark:bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
            <span className="text-xs font-semibold">Loading platform users & sessions...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-rose-600 font-semibold">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-500 dark:text-slate-400">
            No matching users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Organizations & Roles</th>
                  <th className="py-3.5 px-4">Authorization</th>
                  <th className="py-3.5 px-4">Active Sessions</th>
                  <th className="py-3.5 px-4">Last Login & IP</th>
                  <th className="py-3.5 px-5 text-right">Security Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                          {(u.name || u.email || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {!u.isActive && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                DISABLED
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {!u.memberships?.length ? (
                        <span className="text-slate-400 text-[11px]">No org membership</span>
                      ) : (
                        <div className="space-y-1">
                          {u.memberships.map((m: any) => (
                            <div key={m.id} className="text-[11px]">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {m.organization?.name}
                              </span>{' '}
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {m.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {u.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                            SUPER_ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
                            TENANT_USER
                          </span>
                        )}
                        {u.twoFactorEnabled && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> 2FA Enabled
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          u.activeSessionsCount > 0
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.activeSessionsCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        {u.activeSessionsCount || 0} active
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px]">
                      {u.lastLoginAt ? (
                        <div>
                          <div className="text-slate-800 dark:text-slate-200">
                            {new Date(u.lastLoginAt).toLocaleString()}
                          </div>
                          <div className="text-slate-400">
                            IP: {u.lastLoginIp || u.latestSession?.ipAddress || '—'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Never logged in</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                        {u.activeSessionsCount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRevokeSessions(u)}
                            title="Force logout all active sessions"
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold hover:bg-amber-100 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Force Logout</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget(u);
                            setNewPassword('');
                          }}
                          title="Reset user password"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset PW</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleUserField(
                              u,
                              { isActive: !u.isActive },
                              `User ${u.email} ${!u.isActive ? 'activated' : 'deactivated'}.`
                            )
                          }
                          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                            u.isActive
                              ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                              : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {u.isActive ? (
                            <>
                              <UserX className="w-3 h-3" /> Disable
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" /> Enable
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleUserField(
                              u,
                              { isSuperAdmin: !u.isSuperAdmin },
                              `Updated Super Admin privilege for ${u.email}.`
                            )
                          }
                          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer ${
                            u.isSuperAdmin
                              ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {u.isSuperAdmin ? 'Demote SA' : 'Grant SA'}
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

      {/* Modal: Reset Password */}
      {resetTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-rose-600" />
                <span>Reset User Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Set a new password (minimum 8 characters) for{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {resetTarget.email}
              </strong>
              .
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReset || newPassword.length < 8}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-60"
                >
                  {savingReset ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

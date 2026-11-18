'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { getAdminApiBaseUrl } from '../../../lib/api';
import { ThemeToggle } from '../../../components/ThemeToggle';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getAdminApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Invalid root administrator credentials');
      }

      if (!json.data?.user?.isSuperAdmin) {
        throw new Error(
          'Access Denied: Root Super Administrator privileges are required for this console.'
        );
      }

      localStorage.setItem('convoza_admin_access_token', json.data.tokens.accessToken);
      localStorage.setItem('convoza_admin_refresh_token', json.data.tokens.refreshToken);
      localStorage.setItem('convoza_admin_user', JSON.stringify(json.data.user));

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Unable to verify Super Admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-rose-600/10 dark:bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-600/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[10.5px] font-bold uppercase tracking-wider">
            <span>Restricted Root Control Plane</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            CONVOZA Super Admin
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Authorized root operators only. Every authentication event is audited.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-9 shadow-xl dark:shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-500/40 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1.5">
                Root Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@emperorsmartsolutions.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Root Access...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Root Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium text-center">
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          <span>Emperor Smart Solutions • RBAC Super Admin Enforcement</span>
        </div>
      </div>
    </div>
  );
}

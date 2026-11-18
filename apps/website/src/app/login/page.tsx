'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { getApiBaseUrl, buildDashboardRedirectUrl } from '../../lib/api';
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Login failed. Please check your credentials.');
      }

      const primaryOrg = json.data.organizations?.[0];

      // Store tokens and user info
      localStorage.setItem('convoza_access_token', json.data.tokens.accessToken);
      localStorage.setItem('convoza_refresh_token', json.data.tokens.refreshToken);
      localStorage.setItem('convoza_user', JSON.stringify(json.data.user));
      if (primaryOrg) {
        localStorage.setItem('convoza_org_id', primaryOrg.id);
        localStorage.setItem('convoza_org_name', primaryOrg.name);
      }

      // Redirect to Dashboard (with cross-port token handoff in local dev)
      window.location.href = buildDashboardRedirectUrl({
        accessToken: json.data.tokens.accessToken,
        refreshToken: json.data.tokens.refreshToken,
        user: json.data.user,
        orgId: primaryOrg?.id,
        orgName: primaryOrg?.name,
      });
    } catch (err: any) {
      setError(err.message || 'Network error connecting to API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">

        {/* Top Header & Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25D366] via-emerald-600 to-[#128C7E] flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <WhatsAppIcon className="w-7 h-7 fill-white" />
            </div>
          </Link>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10.5px] font-bold uppercase tracking-wider shadow-2xs">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
            <span>Official Meta Cloud API</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Log in to CONVOZA
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            Access your multi-agent inbox, campaigns & automation engine
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-[28px] border border-slate-200/90 p-7 sm:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.05)] relative">

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Work Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@emperorsmartsolutions.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                  Password
                </label>
                <Link
                  href="/contact"
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer accent-emerald-600"
                />
                <span className="text-xs text-slate-600 font-medium">Remember this device</span>
              </label>
              <span className="text-[11px] text-slate-400">30-day session</span>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Register Callout */}
          <div className="mt-5 text-center text-xs text-slate-500">
            Don't have an organization account?{' '}
            <Link href="/register" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
              Start 14-day free trial →
            </Link>
          </div>

        </div>

        {/* Security / Partner Footnote */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Official Meta Cloud API • AES-256 Token Encryption • Row-Level Data Isolation</span>
        </div>

      </div>
    </div>
  );
}

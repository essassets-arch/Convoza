'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { getApiBaseUrl, buildDashboardRedirectUrl } from '../../lib/api';
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
  Building2,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Sparkles,
  Check,
  Clock,
  Layers,
  Send
} from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '', text: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2) return { score: 2, label: 'Good', color: 'bg-amber-500', text: 'text-amber-600' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          organizationName: organizationName.trim(),
          email: email.toLowerCase().trim(),
          phone: phone ? phone.trim() : undefined,
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Registration failed. Please verify your details.');
      }

      // Store tokens and user info
      localStorage.setItem('convoza_access_token', json.data.tokens.accessToken);
      localStorage.setItem('convoza_refresh_token', json.data.tokens.refreshToken);
      localStorage.setItem('convoza_user', JSON.stringify(json.data.user));
      localStorage.setItem('convoza_org_id', json.data.organization.id);
      localStorage.setItem('convoza_org_name', json.data.organization.name);

      // Redirect to Dashboard
      window.location.href = buildDashboardRedirectUrl({
        accessToken: json.data.tokens.accessToken,
        refreshToken: json.data.tokens.refreshToken,
        user: json.data.user,
        orgId: json.data.organization.id,
        orgName: json.data.organization.name,
      });
    } catch (err: any) {
      setError(err.message || 'Network error connecting to API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[400px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[450px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Value Proposition & Enterprise Proof (5 Cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            <div>
              {/* Official Meta Partner Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-5 shadow-2xs">
                <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
                <span className="uppercase tracking-[0.16em] text-[10.5px] font-bold">Official Meta Tech Partner</span>
                <span className="text-emerald-300">•</span>
                <span className="text-emerald-700 font-medium">14-Day Free Trial</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight leading-[1.16]">
                Scale WhatsApp <br />
                <span className="bg-gradient-to-r from-emerald-600 via-[#128C7E] to-teal-600 bg-clip-text text-transparent">
                  Conversations at Scale
                </span>
              </h1>

              <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                Join high-volume retailers, D2C brands, and customer service teams automating outreach with the official WhatsApp Business Platform.
              </p>
            </div>

            {/* Trial Feature Highlights */}
            <div className="space-y-4">
              
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Zap className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Meta Embedded Signup in 2 Minutes
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Verify and onboard official phone numbers directly with Facebook Login for Business. No Meta manual reviews required.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Layers className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Multi-Agent 3-Column Shared Desk
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Unify customer chats, team collision prevention, ticket assignment, and internal collaboration in one ultra-fast screen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Send className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    High-Throughput Campaign Engine
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Dispatch CSV broadcasts with automated anti-ban token throttling and real-time read, delivery, and click telemetry.
                  </p>
                </div>
              </div>

            </div>

            {/* Testimonial Quote Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 border border-emerald-200/70 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
                {'★'.repeat(5)}
                <span className="text-[11px] font-bold text-slate-500 ml-1.5">5.0 Star Rating</span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-700 font-medium italic leading-relaxed">
                &ldquo;We launched CONVOZA across 12 customer support reps in under an afternoon. Our first WhatsApp broadcast generated an 84% open rate and zero delivery errors.&rdquo;
              </p>
              <div className="mt-3.5 pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 font-bold block text-xs">Aarav Sharma</strong>
                  <span className="text-[11px] text-slate-500">Head of Growth, Zenith Commerce</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Meta Partner</span>
                </div>
              </div>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> Instant activation
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> Cancel anytime
              </span>
            </div>

          </div>

          {/* Right Column: High-Converting Registration Form Card (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] p-7 sm:p-10 relative">
              
              {/* Header inside Card */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <Link href="/" className="inline-flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366] via-emerald-600 to-[#128C7E] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      <WhatsAppIcon className="w-6 h-6 fill-white" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-slate-900">CONVOZA</span>
                  </Link>

                  <span className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    14-Day Free Access
                  </span>
                </div>

                <h2 className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight">
                  Create your workspace
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Get full enterprise access. No credit card required.
                </p>
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form Grid */}
              <form onSubmit={handleRegister} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Your Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                      Your Full Name <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Company / Organization Name */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                      Organization Name <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="Apex Retail Group"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Work Email Address */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                      Work Email Address <span className="text-emerald-600">*</span>
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
                        placeholder="alex@apexretail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Phone Number (Optional) */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                      WhatsApp Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider">
                      Password <span className="text-emerald-600">*</span>
                    </label>
                    {password && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${strength.text}`}>
                        Strength: {strength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator Bars */}
                  {password && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className={`h-1 flex-1 rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                    </div>
                  )}
                </div>

                {/* Terms and Privacy Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer accent-emerald-600 shrink-0"
                    />
                    <span className="text-xs text-slate-600 leading-snug">
                      I agree to the{' '}
                      <Link href="/terms" className="font-bold text-emerald-700 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="font-bold text-emerald-700 hover:underline">
                        Privacy Policy
                      </Link>
                      . Official Meta Cloud API usage is subject to WhatsApp Business policies.
                    </span>
                  </label>
                </div>

                {/* Submit Action Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Workspace & Start Free Trial</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Already Have an Account Link */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
                Already have an organization account?{' '}
                <Link href="/login" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
                  Log in to your workspace →
                </Link>
              </div>

            </div>

            {/* Bottom Security / Partner Guarantee */}
            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Meta Tech Provider Architecture • AES-256 Token Encryption • SOC2 Ready</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

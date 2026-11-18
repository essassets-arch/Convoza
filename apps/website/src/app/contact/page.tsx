'use client';

import React, { useState } from 'react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { getApiBaseUrl } from '../../lib/api';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Zap,
  ShieldCheck,
  ArrowRight,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const INQUIRY_LABELS: Record<'enterprise' | 'onboarding' | 'integration' | 'support', string> = {
  enterprise: 'Enterprise Scaling',
  onboarding: 'Meta Onboarding',
  integration: 'Custom CRM Sync',
  support: 'General / Support',
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inquiryType, setInquiryType] = useState<
    'enterprise' | 'onboarding' | 'integration' | 'support'
  >('enterprise');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    volume: '50,000 - 250,000',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const topic = `${INQUIRY_LABELS[inquiryType]} (${formData.volume} msgs/mo)`;
      const res = await fetch(`${getApiBaseUrl()}/public/contact-inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          topic,
          message: formData.message.trim(),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message || json.message || 'Unable to submit your inquiry');
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Network error while submitting inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-12 sm:pt-16 pb-20 relative overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[400px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-4 shadow-2xs">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
            <span className="uppercase tracking-[0.16em] text-[10.5px] font-bold">
              Independent Meta Cloud API Platform
            </span>
            <span className="text-emerald-300">•</span>
            <span className="text-emerald-700 font-medium">Direct Support Desk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 tracking-tight leading-[1.18]">
            Get in Touch with Our <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-[#128C7E] to-teal-600 bg-clip-text text-transparent">
              WhatsApp Automation Team
            </span>
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Have questions about official Meta Cloud API onboarding, enterprise throughput, or custom CRM integrations? Our specialists are ready to help.
          </p>
        </div>

        {/* 2-Column High-Impact Layout */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Direct WhatsApp Chat & Contact Channels (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* VIP Direct WhatsApp Instant Chat Card */}
            <div className="p-7 rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 border-2 border-[#25D366] shadow-[0_12px_40px_rgba(37,211,102,0.14)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <WhatsAppIcon className="w-7 h-7 fill-white" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
                  Instant SLA
                </span>
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-900 tracking-tight">
                Prefer WhatsApp? Chat Directly
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect directly with our senior solutions engineers on WhatsApp for instant pricing demos, rate limit upgrades, or onboarding support.
              </p>

              <div className="mt-5 pt-4 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> Avg. Response:{' '}
                  <strong className="text-slate-800">90 Secs</strong>
                </span>
                <span className="text-emerald-700 font-bold">24/7 Priority Support</span>
              </div>

              <a
                href="https://wa.me/916354351080?text=Hi%20Convoza%20team,%20I%20want%20to%20learn%20more%20about%20WhatsApp%20Cloud%20API%20automation."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-slate-950 hover:text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Open WhatsApp Chat</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </a>
            </div>

            {/* Direct Contact Channels Box */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Enterprise Sales
                  </h4>
                  <a
                    href="mailto:sales@emperorsmartsolutions.com"
                    className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors mt-0.5 block break-all"
                  >
                    sales@emperorsmartsolutions.com
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">Guaranteed reply within 1 hour</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Technical & API Support
                  </h4>
                  <a
                    href="mailto:support@emperorsmartsolutions.com"
                    className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors mt-0.5 block break-all"
                  >
                    support@emperorsmartsolutions.com
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct developer assistance & webhooks SLA
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Phone & WhatsApp Direct
                  </h4>
                  <a
                    href="tel:+916354351080"
                    className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors mt-0.5 block"
                  >
                    +91 63543 51080
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">Mon–Sat, 9:30 AM to 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Corporate Headquarters
                  </h4>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">Emperor Smart Solutions</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    202, Shitiratna Complex, Panchavati Rd, near Radisson Hotel, Ellisbridge, Ahmedabad, Gujarat 380006
                  </p>
                </div>
              </div>
            </div>

            {/* Enterprise Trust Pillars Card */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enterprise SLA Guarantee</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All client workloads run with transactional outbox guarantees, bank-grade token encryption, and dedicated Postgres row-level tenant security.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> 99.99% Core API Uptime
                </span>
                <span>Official Meta Cloud API v20.0</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Smart Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative">
              {/* Category Filter Pills */}
              <div className="mb-8">
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5">
                  What can we help you with?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'enterprise', label: 'Enterprise Scaling' },
                    { id: 'onboarding', label: 'Meta Onboarding' },
                    { id: 'integration', label: 'Custom CRM Sync' },
                    { id: 'support', label: 'General / Other' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setInquiryType(tab.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        inquiryType === tab.id
                          ? 'bg-[#25D366] text-slate-950 font-black shadow-sm ring-2 ring-emerald-500/30'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {submitted ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100/80 text-[#128C7E] flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Inquiry Received Successfully!
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you,{' '}
                    <strong className="text-slate-900">{formData.name || 'valued customer'}</strong>.
                    Your request has been logged in our priority desk and assigned to a WhatsApp Solution Specialist.
                  </p>

                  <div className="mt-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 max-w-sm mx-auto text-xs text-slate-700">
                    <span className="font-bold text-emerald-900">⚡ Estimated Response Time:</span>{' '}
                    Under 15 Minutes
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        volume: '50,000 - 250,000',
                        message: '',
                      });
                    }}
                    className="mt-7 text-xs font-bold text-[#128C7E] hover:underline cursor-pointer"
                  >
                    Submit another inquiry →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {submitError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs font-semibold text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Row 1: Name & Work Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                        Full Name <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Aarav Patel"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                        Work Email <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="founder@emperorsmartsolutions.com"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium"
                      />
                    </div>
                  </div>

                  {/* Row 2: WhatsApp Number & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                        WhatsApp Number <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 63543 51080"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Emperor Smart Solutions"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium"
                      />
                    </div>
                  </div>

                  {/* Row 3: Monthly Message Volume */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                      Estimated Monthly Message Volume
                    </label>
                    <select
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium text-slate-800"
                    >
                      <option value="10,000 - 50,000">10,000 – 50,000 msgs / mo</option>
                      <option value="50,000 - 250,000">50,000 – 250,000 msgs / mo</option>
                      <option value="250,000 - 1,000,000">250,000 – 1,000,000 msgs / mo</option>
                      <option value="1,000,000+ Enterprise">1,000,000+ Enterprise Scale</option>
                    </select>
                  </div>

                  {/* Row 4: Message / Specific Requirements */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                      Message / Business Use Case <span className="text-emerald-600">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your team size, broadcast requirements, or questions regarding official Meta APIs..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-2xs font-medium resize-none"
                    />
                  </div>

                  {/* Submission Row */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Enterprise Inquiry</span>
                          <Send className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Zero spam guarantee • 256-bit encrypted data isolation • No credit card needed
                      </span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 3 Quick Assurance FAQ Bento Cards Beneath Form */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#128C7E] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 fill-[#128C7E]/20" />
            </div>
            <h4 className="text-sm font-black text-slate-900">How fast is onboarding?</h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              With Meta Embedded Signup, your WABA phone numbers can be approved and live in under 5 minutes without manual paperwork.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#128C7E] flex items-center justify-center mb-4">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900">Can we keep our existing number?</h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Yes! You can connect existing mobile numbers, toll-free lines, or virtual numbers to the official Cloud API seamlessly.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#128C7E] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900">Direct Meta or Prepaid Wallet</h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Choose direct Meta billing with zero markups or convenient INR prepaid wallet top-ups with instant GST invoicing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

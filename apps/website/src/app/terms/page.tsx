'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Mail,
  Zap,
  Globe,
  Building2,
  Check,
  ArrowRight,
  Clock
} from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

export default function TermsPage() {
  const legalTabs = [
    { name: 'Privacy Policy', href: '/privacy', active: false, icon: ShieldCheck },
    { name: 'Terms & Conditions', href: '/terms', active: true, icon: Scale },
    { name: 'Acceptable Use Policy', href: '/acceptable-use', active: false, icon: FileText },
  ];

  const termsHighlights = [
    {
      title: '99.99% Guaranteed SLA',
      desc: 'Tier-1 enterprise infrastructure uptime and automated disaster recovery.',
    },
    {
      title: 'Meta Cloud Compliance',
      desc: 'All messaging adheres to official Meta Business and WhatsApp commercial terms.',
    },
    {
      title: 'Customer Data Ownership',
      desc: 'You retain 100% intellectual property and ownership over all customer contacts and logs.',
    },
    {
      title: 'Transparent Billing',
      desc: 'Predictable monthly or annual software licensing with zero hidden message markups.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-10 sm:pt-14 pb-20 relative overflow-hidden">
      
      {/* Ambient Lighting */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[350px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[400px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Breadcrumb / Eyebrow */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-4 shadow-2xs">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
            <span className="uppercase tracking-[0.16em] text-[10.5px] font-bold">Official Legal Framework</span>
            <span className="text-emerald-300">•</span>
            <span className="text-emerald-700 font-medium">Enterprise Master Services</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Terms and Conditions
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Master Software-as-a-Service (SaaS) Agreement governing access to the CONVOZA platform, WhatsApp Cloud API integrations, and developer toolkits.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Effective Date: <strong>November 17, 2026</strong>
            </span>
            <span>•</span>
            <span>Agreement ID: <strong>MSA-2026-v3</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Scale className="w-4 h-4 text-emerald-600" /> Legally Binding Master Agreement
            </span>
          </div>
        </div>

        {/* Policy Switcher Tabs */}
        <div className="mt-8 sm:mt-10 max-w-2xl mx-auto flex items-center justify-center p-1.5 rounded-2xl bg-slate-200/70 border border-slate-300/80 shadow-2xs overflow-x-auto">
          {legalTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex-1 min-w-[100px] py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  tab.active
                    ? 'bg-white text-slate-950 shadow-md shadow-slate-300/60 font-black'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${tab.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="truncate">{tab.name}</span>
              </Link>
            );
          })}
        </div>

        {/* 2-Column Content Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Quick Highlights & Sticky Index (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* Quick Summary Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Terms Summary</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  MSA Framework
                </span>
              </div>

              <div className="space-y-3">
                {termsHighlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 font-bold block">{item.title}</strong>
                      <span className="text-slate-500 leading-relaxed text-[11.5px]">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Jump Index */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                Clauses & Navigation
              </h4>
              <nav className="space-y-2 text-xs font-medium text-slate-600">
                <a href="#term-1" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  1. Agreement & Platform Access
                </a>
                <a href="#term-2" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  2. Organization Accounts & Multi-Tenancy
                </a>
                <a href="#term-3" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  3. Meta WhatsApp Cloud API Guidelines
                </a>
                <a href="#term-4" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  4. Subscription Billing & Taxes
                </a>
                <a href="#term-5" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  5. Service Level Agreement (SLA) & Uptime
                </a>
                <a href="#term-6" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  6. Customer Data Ownership & IP
                </a>
                <a href="#term-7" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  7. Prohibited Uses & Suspension
                </a>
                <a href="#term-8" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  8. Limitation of Liability & Warranty
                </a>
                <a href="#term-9" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  9. Dispute Resolution & Governing Law
                </a>
              </nav>
            </div>

            {/* Legal Support Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>Enterprise Custom Agreements</span>
              </div>
              <p className="text-[11.5px] leading-relaxed">
                Organizations requiring custom redlines, custom SLAs, or enterprise BAA/DPA documents can reach our legal team directly:
              </p>
              <a
                href="mailto:legal@convoza.com"
                className="font-bold text-emerald-800 hover:underline block pt-1"
              >
                legal@convoza.com →
              </a>
            </div>

          </div>

          {/* Right Column: Full Legal Documentation (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-200/90 shadow-[0_12px_45px_rgba(0,0,0,0.04)] p-8 sm:p-12 text-slate-800 space-y-8">
            
            {/* Crucial Enterprise Notice */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-bold">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-emerald-950 tracking-wider">
                  Master Subscription Services Agreement (MSSA)
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  By creating an organization workspace, authenticating via Meta Embedded Signup, or using our REST APIs, your entity agrees to these legally binding terms.
                </p>
              </div>
            </div>

            {/* Clause 1 */}
            <section id="term-1" className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Agreement to Terms & Service Scope
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                These Terms and Conditions (&ldquo;Agreement&rdquo;) constitute a binding legal contract between Emperor Smart Solutions, operating CONVOZA (&ldquo;CONVOZA&rdquo;), and the business entity registering for or using our services (&ldquo;Customer&rdquo;, &ldquo;Organization&rdquo;, or &ldquo;You&rdquo;).
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                CONVOZA grants Customer a worldwide, non-exclusive, non-transferable right during the applicable subscription term to access and utilize the CONVOZA SaaS application, dashboard, shared inbox, campaign dispatch worker, and API endpoints solely for Customer&apos;s internal business operations.
              </p>
            </section>

            {/* Clause 2 */}
            <section id="term-2" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Organization Accounts & Multi-Tenancy Architecture
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Each organization operates within an isolated tenant environment. Customer administrators are responsible for all activities that occur under their tenant credentials:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Credential Confidentiality:</strong> Customer must safeguard login emails, passwords, and API secret keys. Customer must immediately notify CONVOZA of any known or suspected unauthorized access.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Authorized Agent Seats:</strong> Seats assigned to team agents cannot be shared concurrently across multiple individuals. Seat reassignments may be executed via the organization settings dashboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Cross-Tenant Access:</strong> Any intentional attempt to scan, probe, or access data belonging to another tenant will result in instantaneous account termination and referral to statutory cyber-defense authorities.</span>
                </li>
              </ul>
            </section>

            {/* Clause 3 */}
            <section id="term-3" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Meta WhatsApp Business Platform Guidelines
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Customer acknowledges that CONVOZA integrates directly with Meta Platforms, Inc. Customer agrees to comply fully with Meta's official WhatsApp Business Platform rules:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <p>
                  <strong>Template Pre-Approval:</strong> Outbound business-initiated messages outside the active 24-hour customer service window must use templates approved in advance by Meta.
                </p>
                <p>
                  <strong>Explicit Customer Opt-In:</strong> Customer warrants that all recipient phone numbers imported into CONVOZA have provided verifiable, explicit consent to receive messages on WhatsApp.
                </p>
                <p>
                  <strong>Quality Rating & Ban Prevention:</strong> Customer must maintain a Green/Medium quality rating on Meta. CONVOZA reserves the right to throttle outbound dispatch if an organization's spam complaint rate threatens shared IP pool standing.
                </p>
              </div>
            </section>

            {/* Clause 4 */}
            <section id="term-4" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  4
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Subscription Billing, Quotas & Taxes
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Subscriptions are billed in advance on a recurring monthly or annual basis via credit card or approved enterprise invoicing:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Software License Fee:</strong> Covers platform access, dashboard seats, campaign engine, and shared inbox tooling.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Meta Conversation Charges:</strong> WhatsApp conversation fees charged directly by Meta are billed at exact cost without markup, deducted from Customer&apos;s Meta Business Manager or prepaid conversation balance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cancellation & Upgrades:</strong> Subscriptions can be upgraded or canceled at any time from the billing dashboard. Plan downgrades take effect at the close of the current billing cycle.</span>
                </li>
              </ul>
            </section>

            {/* Clause 5 */}
            <section id="term-5" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  5
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Service Level Agreement (SLA) & High-Availability
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                CONVOZA commits to a <strong>99.99% monthly platform uptime</strong> for our campaign dispatch worker and webhook receiver pipelines. In the event of an unplanned platform outage exceeding 0.01% in a given calendar month, affected enterprise customers are entitled to service credits calculated on a prorated basis upon written request.
              </p>
            </section>

            {/* Clause 6 */}
            <section id="term-6" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  6
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Customer Data Ownership & Intellectual Property
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong>You Own Your Data:</strong> Customer retains full intellectual property rights, title, and ownership in and to all contact records, recipient databases, conversation histories, and media uploaded to CONVOZA.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                CONVOZA retains all rights, title, and interest in and to our proprietary software, algorithms, user interfaces, branding, and system telemetry.
              </p>
            </section>

            {/* Clause 7 */}
            <section id="term-7" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  7
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Prohibited Conduct & Immediate Suspension
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Customer shall not: (a) reverse-engineer, decompile, or copy the software; (b) use the platform to transmit unsolicited spam or phishing campaigns; (c) attempt unauthorized load testing against API gateways; or (d) violate our Acceptable Use Policy. Violation of these prohibitions will result in immediate suspension without refund.
              </p>
            </section>

            {/* Clause 8 */}
            <section id="term-8" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  8
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Limitation of Liability & Indemnification
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Except for gross negligence or willful misconduct, in no event shall either party&apos;s aggregate liability arising out of or related to this Agreement exceed the total amounts paid by Customer in the 12 months preceding the incident. Neither party shall be liable for indirect, punitive, or consequential damages.
              </p>
            </section>

            {/* Clause 9 */}
            <section id="term-9" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  9
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Dispute Resolution & Governing Law
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                This Agreement shall be governed by and construed in accordance with applicable corporate laws without regard to conflict of law principles. Any dispute arising out of or relating to this Agreement shall be settled by mutual good faith mediation or binding commercial arbitration.
              </p>
            </section>

            {/* Clause 10: Legal Entity & Notices */}
            <section id="term-10" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  10
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Legal Entity & Official Notices
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                All legal notices, contractual notices, and service inquiries under this Agreement should be directed to:
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
                <p><strong>Emperor Smart Solutions (operating CONVOZA)</strong></p>
                <p>Corporate Office: 202, Shitiratna Complex, Panchavati Rd, near Radisson Hotel, Ellisbridge, Ahmedabad, Gujarat 380006, India</p>
                <p>Phone & Support: <a href="tel:+916354351080" className="text-emerald-700 font-bold hover:underline">+91 63543 51080</a></p>
                <p>Legal Desk: <a href="mailto:legal@convoza.com" className="text-emerald-700 font-bold hover:underline">legal@convoza.com</a></p>
              </div>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}

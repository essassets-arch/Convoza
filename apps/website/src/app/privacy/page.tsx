'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  ExternalLink,
  Mail,
  UserCheck,
  Globe,
  Building2,
  Scale,
  Check,
  ArrowRight
} from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

export default function PrivacyPolicyPage() {
  const legalTabs = [
    { name: 'Privacy Policy', href: '/privacy', active: true, icon: ShieldCheck },
    { name: 'Terms & Conditions', href: '/terms', active: false, icon: Scale },
    { name: 'Acceptable Use Policy', href: '/acceptable-use', active: false, icon: FileText },
  ];

  const quickHighlights = [
    {
      title: 'Zero Data Selling',
      desc: 'We never sell, monetize, or broker customer contact data or message histories.',
    },
    {
      title: 'Official Meta Cloud API',
      desc: 'Direct tier-1 Meta connection with row-level tenant boundary isolation.',
    },
    {
      title: 'AES-256-GCM Encryption',
      desc: 'All integration tokens and sensitive credentials are encrypted at rest.',
    },
    {
      title: 'GDPR & SOC-2 Ready',
      desc: 'Full support for data portability, right to erasure, and audit logging.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-10 sm:pt-14 pb-20 relative overflow-hidden">
      
      {/* Ambient Radial Lighting */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[350px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[400px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Breadcrumb / Eyebrow */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-4 shadow-2xs">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
            <span className="uppercase tracking-[0.16em] text-[10.5px] font-bold">Official Legal Framework</span>
            <span className="text-emerald-300">•</span>
            <span className="text-emerald-700 font-medium">Compliance & Trust Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            CONVOZA Privacy Policy
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            How Emperor Smart Solutions (operating CONVOZA) safeguards customer personal data, phone numbers, and WhatsApp communication payloads under official Meta Business Platform standards.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Effective Date: <strong>November 17, 2026</strong>
            </span>
            <span>•</span>
            <span>Version: <strong>v2.4 (Enterprise Edition)</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> SOC-2 & GDPR Compliant
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
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Privacy At a Glance</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Strict Isolation
                </span>
              </div>

              <div className="space-y-3">
                {quickHighlights.map((item, idx) => (
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
                Table of Contents
              </h4>
              <nav className="space-y-2 text-xs font-medium text-slate-600">
                <a href="#section-1" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  1. Executive Overview & Scope
                </a>
                <a href="#section-2" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  2. Categories of Data We Process
                </a>
                <a href="#section-3" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  3. Meta Cloud API Data Transmission
                </a>
                <a href="#section-4" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  4. Cryptographic Storage & Isolation
                </a>
                <a href="#section-5" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  5. Data Retention & Auto-Pruning
                </a>
                <a href="#section-6" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  6. Sub-processors & Cloud Providers
                </a>
                <a href="#section-7" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  7. Your Statutory Privacy Rights
                </a>
                <a href="#section-8" className="block hover:text-emerald-700 hover:translate-x-1 transition-all">
                  8. Data Protection Officer (DPO) Contact
                </a>
              </nav>
            </div>

            {/* Legal Contact Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>Legal & Privacy Inquiries</span>
              </div>
              <p className="text-[11.5px] leading-relaxed">
                For GDPR data deletion requests, DPA execution, or compliance audits, contact our Data Protection Officer:
              </p>
              <a
                href="mailto:privacy@convoza.com"
                className="font-bold text-emerald-800 hover:underline block pt-1"
              >
                privacy@convoza.com →
              </a>
            </div>

          </div>

          {/* Right Column: Full Legal Documentation (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-200/90 shadow-[0_12px_45px_rgba(0,0,0,0.04)] p-8 sm:p-12 text-slate-800 space-y-8">
            
            {/* Meta Compliance Callout Box */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <WhatsAppIcon className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-emerald-950 tracking-wider">
                  Meta WhatsApp Business Platform Compliance
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  CONVOZA operates exclusively via the official Meta WhatsApp Business Cloud API. We adhere strictly to the <strong>Meta Developer Terms</strong>, <strong>WhatsApp Business Terms of Service</strong>, and <strong>Meta Commercial Terms</strong>.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section id="section-1" className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Executive Overview & Scope
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Emperor Smart Solutions (&ldquo;CONVOZA&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) provides an enterprise Software-as-a-Service (SaaS) platform facilitating multi-agent customer communication, marketing broadcasts, and workflow automation on the official WhatsApp Business Platform.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                This Privacy Policy describes our practices regarding personal data collected through our website (<code className="text-emerald-700 font-mono text-xs">convoza.emperorsmartsolutions.com</code>), dashboard applications, REST APIs, and webhook processors. When an organization utilizes our services to message end-customers on WhatsApp, the organization acts as the <strong>Data Controller</strong>, and Emperor Smart Solutions (operating CONVOZA) serves as the <strong>Data Processor</strong>.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Categories of Data We Process
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Depending on the modules activated by your organization, CONVOZA processes the following categories of data:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Account & Profile Credentials:</strong> Full name, organizational email address, hashed passwords (bcrypt/Argon2), corporate entity name, and billing tax identifiers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>WhatsApp Channel Metadata:</strong> WhatsApp Business Account (WABA) IDs, verified phone number IDs, Meta quality rating telemetry, and Meta Cloud API permanent system access tokens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Recipient Contact Records:</strong> Customer WhatsApp phone numbers, recipient display names, custom attributes (e.g. order numbers, loyalty tiers), and explicit consent timestamp records.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Communication Payloads & Media:</strong> Inbound customer text, outbound approved template variables, voice notes, transaction receipts, and delivery status receipts (sent, delivered, read, failed).</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Meta WhatsApp Cloud API Data Transmission
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                CONVOZA communicates directly with Meta's official WhatsApp Business Platform servers via TLS 1.3 encrypted endpoints. In accordance with Meta's policies:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <p>
                  <strong>No Data Monetization:</strong> We do not sell, rent, trade, or broker your customer phone numbers or conversation histories to any advertising networks, third-party brokers, or AI model trainers.
                </p>
                <p>
                  <strong>Strict Purpose Limitation:</strong> Contact data uploaded by your organization is used solely to facilitate requested outbound campaign dispatch, shared team inbox triage, and automated chatbot responses.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  4
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Cryptographic Storage & Multi-Tenant Isolation
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our infrastructure implements zero-trust architecture designed to prevent cross-tenant data leaks:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Token Encryption at Rest:</strong> All Meta permanent access tokens, webhook signing secrets, and third-party CRM API keys are encrypted at rest using <strong>AES-256-GCM</strong> authenticated encryption.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Tenant-Partitioned Database Queries:</strong> Every database query enforce strict <code className="text-emerald-800 font-mono text-xs">organizationId</code> scoping at the ORM layer, preventing unauthorized access across customer tenants.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Audit Trails & Role-Based Access:</strong> Detailed audit logs record all message dispatches, agent login attempts, export events, and credential rotations.</span>
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  5
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Data Retention, Auto-Pruning & Erasure
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Organizations retain total ownership and control over data lifecycle:
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Customer conversation histories and campaign logs are retained for the duration of the active subscription or according to the organization&apos;s custom retention rules. When an organization triggers an account deletion or purges a contact, all associated records, tokens, and messages are permanently sanitized from active database tables within 48 hours.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  6
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Authorized Sub-processors
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                CONVOZA partners with audited, enterprise cloud infrastructure providers under strict Data Processing Addendums (DPAs):
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Entity</th>
                      <th className="py-2.5 px-3">Role / Service</th>
                      <th className="py-2.5 px-3">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">Meta Platforms, Inc.</td>
                      <td className="py-2 px-3">WhatsApp Cloud API Gateway & Infrastructure</td>
                      <td className="py-2 px-3">USA / Global Tier-1 Points of Presence</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">Amazon Web Services (AWS)</td>
                      <td className="py-2 px-3">Encrypted Cloud Hosting, Redis & PostgreSQL</td>
                      <td className="py-2 px-3">US-East / EU-Frankfurt Regions</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">Cloudflare, Inc.</td>
                      <td className="py-2 px-3">DDoS Mitigation & Edge TLS Termination</td>
                      <td className="py-2 px-3">Global Anycast Network</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  7
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Your Statutory Privacy Rights (GDPR / CCPA)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Under the EU General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA/CPRA), authorized users and organizations possess the following rights:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 pt-1">
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="block text-slate-900 mb-0.5">Right of Access & Portability</strong>
                  Export all contact lists, broadcast logs, and conversation threads in machine-readable JSON/CSV formats.
                </li>
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="block text-slate-900 mb-0.5">Right to Rectification</strong>
                  Modify and update organization details and recipient data instantly via dashboard or REST endpoints.
                </li>
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="block text-slate-900 mb-0.5">Right to Erasure (To Be Forgotten)</strong>
                  Trigger complete deletion of specific phone number records or wipe entire workspaces upon demand.
                </li>
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="block text-slate-900 mb-0.5">Consent Withdrawal</strong>
                  Immediate automated suppression for recipients texting STOP or unsubscribing from marketing templates.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  8
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Data Protection Officer & Governance Contact
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For questions regarding this policy, Data Processing Addendums (DPA), or regulatory inquiries, contact our governance office:
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
                <p><strong>Emperor Smart Solutions (operating CONVOZA)</strong></p>
                <p>Corporate Address: 202, Shitiratna Complex, Panchavati Rd, near Radisson Hotel, Ellisbridge, Ahmedabad, Gujarat 380006, India</p>
                <p>Direct Support & WhatsApp: <a href="tel:+916354351080" className="text-emerald-700 font-bold hover:underline">+91 63543 51080</a></p>
                <p>Email: <a href="mailto:privacy@convoza.com" className="text-emerald-700 font-bold hover:underline">privacy@convoza.com</a></p>
                <p>Legal Desk: <a href="mailto:legal@convoza.com" className="text-emerald-700 font-bold hover:underline">legal@convoza.com</a></p>
                <p>Response SLA: Statutory response within 48 business hours.</p>
              </div>
            </section>

            {/* Section 9: Meta Platform User Data Deletion Instructions */}
            <section id="data-deletion" className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  9
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  User Data Deletion Instructions (Meta Platform &amp; WhatsApp Cloud API)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                In accordance with Meta Platform Terms, business administrators and WhatsApp end-users may revoke permissions and permanently delete stored data at any time using any of the following methods:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li>
                  <strong>Self-Service Dashboard Disconnection:</strong> Log in to your CONVOZA Dashboard &rarr; <strong>WhatsApp Phone Numbers</strong> &rarr; click the <strong>Disconnect / Delete</strong> icon next to your connected WhatsApp Business Account (WABA). All encrypted Meta access tokens, phone number bindings, and webhook subscriptions are immediately purged.
                </li>
                <li>
                  <strong>Revoke via Facebook / Meta Business Settings:</strong> Open your Facebook or Meta Business Portfolio Settings &rarr; <strong>Business Integrations</strong> &rarr; locate <strong>CONVOZA</strong> and click <strong>Remove</strong>.
                </li>
                <li>
                  <strong>Direct Erasure Request (48-Hour Guarantee):</strong> Email <a href="mailto:privacy@emperorsmartsolutions.com" className="text-emerald-700 font-bold hover:underline">privacy@emperorsmartsolutions.com</a> (or <a href="mailto:privacy@convoza.com" className="text-emerald-700 font-bold hover:underline">privacy@convoza.com</a>) with subject line <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">DATA DELETION REQUEST</code> along with your registered organization email or WhatsApp phone number. All associated account records, contact entries, and message logs are permanently erased within 48 hours and confirmed via email.
                </li>
              </ol>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}

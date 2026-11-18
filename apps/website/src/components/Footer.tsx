'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  ExternalLink,
  Zap,
  Globe,
  Sparkles,
  PhoneCall,
  MapPin,
  ChevronUp
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Footer = () => {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cities = [
    'Ahmedabad',
    'Gujarat',
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Rajkot',
    'Pune',
    'Hyderabad',
    'Chennai',
    'UAE',
  ];

  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Shitiratna+Complex+202+Panchavati+Rd+near+Radisson+Hotel+Ellisbridge+Ahmedabad+Gujarat+380006';
  const embedUrl = 'https://maps.google.com/maps?q=Shitiratna%20Complex,%20202,%20Panchavati%20Rd,%20near%20Radisson%20Hotel,%20Ellisbridge,%20Ahmedabad,%20Gujarat%20380006&t=&z=16&ie=UTF8&iwloc=&output=embed';

  return (
    <footer className="bg-[#021812] text-slate-400 pt-16 sm:pt-20 pb-10 border-t border-emerald-900/40 relative overflow-hidden">
      
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-36 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-emerald-900/40">
          
          {/* Brand Info & Trust (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform font-bold">
                <WhatsAppIcon className="w-6 h-6 fill-slate-950" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">CONVOZA</span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-800/80 uppercase tracking-wider">
                  Cloud API
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-[13px] text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade WhatsApp Business Automation platform for high-growth brands, e-commerce retailers, and multi-agent customer service teams. Built exclusively on the official Meta WhatsApp Cloud API.
            </p>

            {/* Official Cloud API Pill */}
            <div className="inline-flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-3.5 py-1.5 rounded-full shadow-2xs">
              <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400 shrink-0" />
              <span className="font-bold">Official WhatsApp Cloud API</span>
              <span className="text-emerald-600">•</span>
              <span className="text-emerald-400/80 font-medium">Graph API v20.0</span>
            </div>

            {/* Direct Support Desk CTA */}
            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-800/60 hover:border-emerald-600 text-xs font-bold text-emerald-300 transition-all group"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
                <span>Talk to WhatsApp Solution Engineer</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Product (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-white tracking-[0.16em] uppercase mb-4 flex items-center gap-1.5">
              <span>Product</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              <li>
                <Link href="/whatsapp-automation" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>WhatsApp Automation</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded">AI</span>
                </Link>
              </li>
              <li>
                <Link href="/bulk-messaging" className="hover:text-emerald-400 transition-colors">
                  Bulk Campaigns
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-emerald-400 transition-colors">
                  Template Builder
                </Link>
              </li>
              <li>
                <Link href="/shared-inbox" className="hover:text-emerald-400 transition-colors">
                  Shared Team Inbox
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-emerald-400 transition-colors">
                  Feature Matrix
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions & Use Cases (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-white tracking-[0.16em] uppercase mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              <li>
                <Link href="/whatsapp-automation" className="hover:text-emerald-400 transition-colors">
                  E-Commerce & Retail
                </Link>
              </li>
              <li>
                <Link href="/bulk-messaging" className="hover:text-emerald-400 transition-colors">
                  Abandoned Cart Recovery
                </Link>
              </li>
              <li>
                <Link href="/shared-inbox" className="hover:text-emerald-400 transition-colors">
                  Customer Support Desks
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-emerald-400 transition-colors">
                  Transactional Notifications
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-emerald-400 transition-colors">
                  Multi-Agent Live Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers & Docs (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-white tracking-[0.16em] uppercase mb-4">
              Developers
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              <li>
                <Link href="/api-docs" className="hover:text-emerald-400 transition-colors">
                  REST API Reference
                </Link>
              </li>
              <li>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>OpenAPI / Swagger</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <Link href="/api-docs#webhooks" className="hover:text-emerald-400 transition-colors">
                  Real-time Webhooks
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About CONVOZA
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Enterprise Support Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Compliance (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-white tracking-[0.16em] uppercase mb-4">
              Compliance
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="hover:text-emerald-400 transition-colors">
                  Acceptable Use Policy
                </Link>
              </li>
            </ul>

            {/* Security Badge Box */}
            <div className="mt-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Security</span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-snug">
                ISO-27001 & SOC2 compliant architecture with AES-256 token encryption.
              </p>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* NEW SECTION: Corporate Contact & Office Google Maps Embed     */}
        {/* ============================================================== */}
        <div className="py-10 sm:py-12 border-b border-emerald-900/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Office Address & Direct Phone */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Contact
              </h3>

              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-100">
                  Emperor Smart Solutions
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed max-w-lg">
                  202, Shitiratna Complex, Panchavati Rd,<br />
                  near Radisson Hotel, Ellisbridge, Ahmedabad, Gujarat 380006, India
                </p>
              </div>

              {/* Clickable Phone & WhatsApp Action Links */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="tel:+916354351080"
                  className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </div>
                  <span>+91 63543 51080</span>
                </a>

                <a
                  href="https://wa.me/916354351080?text=Hello%20CONVOZA%20Team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: Google Maps Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-900/60 shadow-xl bg-slate-950/80 group">
                
                {/* Maps Badge (Top-Left) */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 hover:bg-white text-slate-900 text-[11px] font-bold shadow-md transition-all hover:scale-105"
                >
                  <span>Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-700" />
                </a>

                {/* Google Maps iFrame */}
                <div className="w-full h-44 sm:h-48 relative">
                  <iframe
                    title="Emperor Smart Solutions Location Map"
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full object-cover filter contrast-[1.08] brightness-[0.92] group-hover:contrast-100 group-hover:brightness-100 transition-all duration-300"
                  />
                </div>

                {/* Open in Google Maps Pill Button (Bottom-Right) */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 text-white text-[11px] font-bold border border-slate-700 shadow-lg backdrop-blur transition-all hover:border-emerald-500"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

              </div>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* NEW SECTION: Serving Businesses Across India & UAE Pills      */}
        {/* ============================================================== */}
        <div className="py-6 border-b border-emerald-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              Serving businesses across India &amp; UAE:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {cities.map((city) => (
                <span
                  key={city}
                  className="px-3.5 py-1 rounded-full text-xs font-medium bg-[#031d16] hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-emerald-900/60 hover:border-emerald-700/80 transition-all cursor-default select-none shadow-2xs"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Sub-Footer Bar with Cloud API Status & Scroll to Top           */}
        {/* ============================================================== */}
        <div className="pt-7 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          
          <div className="space-y-1 text-center md:text-left max-w-2xl">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span>© {new Date().getFullYear()} Emperor Smart Solutions. All rights reserved.</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              CONVOZA is an independent business software platform operated by Emperor Smart Solutions and is not affiliated with, endorsed by, or sponsored by WhatsApp LLC or Meta Platforms, Inc. WhatsApp™ is a registered trademark of WhatsApp LLC.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            
            {/* Cloud API Status Pill */}
            <div className="inline-flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-300">Built on Official WhatsApp Cloud API</span>
            </div>

            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              type="button"
              aria-label="Scroll to top"
              className="w-9 h-9 rounded-full bg-emerald-950/80 hover:bg-emerald-600 border border-emerald-700/80 hover:border-emerald-500 text-emerald-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md group"
            >
              <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

          </div>

        </div>

      </div>
    </footer>
  );
};

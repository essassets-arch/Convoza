'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Flame,
  ShieldCheck,
  Check,
  CheckCircle2,
  X,
  ArrowRight,
  HelpCircle,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Bot,
  MessageSquare,
  Clock,
  Activity,
  Workflow,
  Lock,
  Headphones,
  Info,
  Star,
  RefreshCw,
  Send
} from 'lucide-react';

function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 blur-0'
          : 'opacity-0 translate-y-12 scale-[0.98] blur-[1px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [audienceVolume, setAudienceVolume] = useState<number>(25000);

  // 3D Tilt handler matching homepage
  const handlePricingTilt = (e: React.MouseEvent<HTMLDivElement>, baseTiltY: number = 0) => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -5.5;
    const rotY = ((x - centerX) / centerX) * 5.5 + baseTiltY;
    card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-12px) scale3d(1.02, 1.02, 1.02)`;
  };

  const handlePricingReset = (e: React.MouseEvent<HTMLDivElement>, resetTransform: string) => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    const card = e.currentTarget;
    card.style.transform = resetTransform;
  };

  // Calculator calculations
  const metaPerMsgEst = 0.78; // Average Meta conversation rate in INR (Utility ~ ₹0.30 - Marketing ~ ₹0.85)
  const metaSpend = Math.round(audienceVolume * metaPerMsgEst);
  const competitorMarkupPerMsg = 0.25; // Typical 25 paise markup charged by traditional BSPs
  const competitorMarkupTotal = Math.round(audienceVolume * competitorMarkupPerMsg);

  const getRecommendedTier = (vol: number) => {
    if (vol <= 10000) return { name: 'Starter', price: billingPeriod === 'yearly' ? 1999 : 2499 };
    if (vol <= 75000) return { name: 'Growth', price: billingPeriod === 'yearly' ? 4799 : 5999 };
    return { name: 'Enterprise', price: billingPeriod === 'yearly' ? 11999 : 14999 };
  };

  const recTier = getRecommendedTier(audienceVolume);

  // Comparison Categories & Matrix
  const comparisonSections = [
    {
      category: 'Core Platform & Meta Infrastructure',
      icon: <Layers className="w-5 h-5 text-emerald-600" />,
      features: [
        {
          name: 'Official Meta Cloud API Engine',
          tooltip: 'Direct integration with Meta Graph Cloud API. Zero QR code scraping risk.',
          starter: 'Included',
          growth: 'Included',
          enterprise: 'Included',
        },
        {
          name: 'Meta Embedded Signup (Go live in 5 min)',
          tooltip: 'Connect your Facebook Business Manager & phone number in a frictionless popup.',
          starter: 'Included',
          growth: 'Included',
          enterprise: 'Included',
        },
        {
          name: 'Official WhatsApp Numbers Connected',
          tooltip: 'Number of live phone numbers sending & receiving concurrently.',
          starter: '1 Number',
          growth: '3 Numbers',
          enterprise: 'Unlimited',
        },
        {
          name: 'Team Agent Seats Included',
          tooltip: 'Simultaneous agent logins for shared inbox & customer support care.',
          starter: '2 Seats',
          growth: '10 Seats',
          enterprise: 'Unlimited',
        },
        {
          name: 'Contact Capacity Allowance',
          tooltip: 'Opted-in customer phone contacts stored in your CONVOZA CRM.',
          starter: '2,500 Contacts',
          growth: '25,000 Contacts',
          enterprise: 'Unlimited',
        },
        {
          name: 'Official Meta Green Tick Verification Assistance',
          tooltip: 'Step-by-step guidance & direct submission to Meta for the official verified badge.',
          starter: 'Self-serve Guide',
          growth: 'Priority Review',
          enterprise: 'Dedicated VIP Concierge',
        },
      ],
    },
    {
      category: 'Campaign Broadcasting & High-Throughput Outbox',
      icon: <Send className="w-5 h-5 text-emerald-600" />,
      features: [
        {
          name: 'Monthly Included Campaign Allowance',
          tooltip: 'Monthly outgoing broadcast message credits handled through CONVOZA.',
          starter: '10,000 / mo',
          growth: '50,000 / mo',
          enterprise: '500,000+ / mo',
        },
        {
          name: 'Outbox Worker Throughput Speed',
          tooltip: 'Dispatched rate to Meta API servers without queuing bottlenecks.',
          starter: '10 msg / sec',
          growth: '50 msg / sec (Priority)',
          enterprise: '250+ msg / sec (Dedicated)',
        },
        {
          name: 'Anti-Ban Token Bucket Rate Limiter',
          tooltip: 'Protects your Meta quality score (GREEN) with adaptive throughput regulation.',
          starter: 'Standard Limiter',
          growth: 'Smart Adaptive Limiter',
          enterprise: 'Enterprise Custom Worker Cluster',
        },
        {
          name: 'Dynamic Token Personalization {{1}}, {{2}}',
          tooltip: 'Inject customer first names, tracking links, and custom coupon codes.',
          starter: 'Included',
          growth: 'Included',
          enterprise: 'Included',
        },
        {
          name: 'CSV & Excel Contact Importer with Validation',
          tooltip: 'Auto-formats Indian (+91) & International country codes and suppresses duplicates.',
          starter: 'Included',
          growth: 'Included',
          enterprise: 'Included',
        },
        {
          name: 'Automated STOP / Opt-Out Suppression',
          tooltip: 'Instantly removes contacts who reply STOP to maintain pristine Meta compliance.',
          starter: 'Included',
          growth: 'Included',
          enterprise: 'Included',
        },
      ],
    },
    {
      category: 'Automation, Visual Flow Builder & Bots',
      icon: <Workflow className="w-5 h-5 text-emerald-600" />,
      features: [
        {
          name: 'Keyword Auto-Replies & Welcome Triggers',
          tooltip: 'Instant answers when leads text keywords like PRICE, MENU, DEMO.',
          starter: 'Basic (5 Rules)',
          growth: 'Unlimited Rules',
          enterprise: 'Unlimited + Multi-Branch',
        },
        {
          name: 'Visual Drag-and-Drop Workflow Builder',
          tooltip: 'Interactive DAG canvas to design complex multi-step conversation flows.',
          starter: 'Single-step Triggers',
          growth: 'Full Visual DAG Builder',
          enterprise: 'Advanced Conditional DAG + Custom Scripts',
        },
        {
          name: 'Business Hours & Away Schedule Engine',
          tooltip: 'Custom auto-responders that trigger during nights, weekends, and holidays.',
          starter: 'Included',
          growth: 'Included',
          enterprise: 'Included',
        },
        {
          name: '24-Hour Customer Window Countdown Monitor',
          tooltip: 'Live countdown timers indicating when free-form replies close.',
          starter: 'Included',
          growth: 'Included',
          enterprise: 'Included',
        },
      ],
    },
    {
      category: 'Shared Team Inbox & Collaborative Care',
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
      features: [
        {
          name: '3-Column Team Inbox Workstation',
          tooltip: 'Filters, active chat conversation column, and full customer profile sidebar.',
          starter: 'Included',
          growth: 'Included',
          enterprise: 'Included',
        },
        {
          name: 'Agent Collision Detection',
          tooltip: 'Visual indicator showing when another agent is actively typing or viewing a chat.',
          starter: false,
          growth: 'Included',
          enterprise: 'Included',
        },
        {
          name: 'Internal Private Team Notes (@mentions)',
          tooltip: 'Leave hidden notes for teammates inside customer conversation threads.',
          starter: false,
          growth: 'Included',
          enterprise: 'Included',
        },
        {
          name: 'Canned Quick Replies & Media Snippets',
          tooltip: 'Pre-saved answers and brochures sent with a single slash shortcut.',
          starter: '10 Snippets',
          growth: 'Unlimited Snippets',
          enterprise: 'Unlimited + Team Sharing',
        },
        {
          name: 'Conversation Tagging & Custom Funnel Stages',
          tooltip: 'Categorize conversations by VIP, Urgent, Quotation Sent, Paid.',
          starter: '5 Custom Tags',
          growth: 'Unlimited Tags',
          enterprise: 'Unlimited + Auto-Routing',
        },
      ],
    },
    {
      category: 'Security, Developer APIs & Enterprise SLAs',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      features: [
        {
          name: 'REST API Access & Outgoing Webhooks',
          tooltip: 'Trigger WhatsApp messages programmatically from your own backend.',
          starter: false,
          growth: 'Standard Webhooks',
          enterprise: 'Full REST API + High-Capacity Webhooks',
        },
        {
          name: 'E-Commerce & CRM Integrations',
          tooltip: 'Connect Shopify, WooCommerce, Zoho, HubSpot, and ERP tools.',
          starter: 'Basic Webhooks',
          growth: 'Shopify & Webhook Sync',
          enterprise: 'Custom ERP & 2-Way CRM Sync',
        },
        {
          name: 'Enterprise Uptime SLA',
          tooltip: 'Contractually backed uptime SLA with financially backed guarantees.',
          starter: '99.5% Uptime',
          growth: '99.9% Uptime',
          enterprise: '99.99% Financial SLA',
        },
        {
          name: 'Dedicated Technical Support',
          tooltip: 'Response times and escalation channels for mission-critical care.',
          starter: 'Email Support (24h)',
          growth: 'Priority WhatsApp & Email (4h)',
          enterprise: 'Dedicated TAM + 24/7 VIP Phone',
        },
      ],
    },
  ];

  const faqs = [
    {
      q: 'Does CONVOZA charge any commission or markup on Meta WhatsApp conversation fees?',
      a: 'No, never. CONVOZA passes official Meta Cloud API conversation fees directly to you at 100% cost with exactly ₹0 markup. You pay Meta directly through your attached credit card or monthly business credit line, ensuring complete transparency and the lowest possible messaging costs.',
    },
    {
      q: 'How does the 14-day free trial work?',
      a: 'Your 14-day free trial gives you unrestricted access to all features of your chosen plan. You can connect your official WhatsApp Business phone number via Meta Embedded Signup in 5 minutes. No credit card is required to start, and there are no auto-charges.',
    },
    {
      q: 'Can I bring my existing WhatsApp Business phone number to CONVOZA?',
      a: 'Yes! You can easily migrate any landline, virtual, or mobile number to the official Meta WhatsApp Business Cloud API. If the number is currently registered on the mobile WhatsApp Business app, you simply delete the mobile account first, then connect it to CONVOZA via Meta Embedded Signup.',
    },
    {
      q: 'What is the difference between CONVOZA platform allowance and Meta conversation fees?',
      a: 'CONVOZA charges a software subscription for the team workspace, outbox dispatch queue, automated flow engine, and shared inbox. Meta charges a small per-conversation fee (categorized as Marketing, Utility, Authentication, or Service) for 24-hour message windows. CONVOZA never marks up Meta fees.',
    },
    {
      q: 'What happens if my business exceeds the monthly campaign allowance?',
      a: 'Your service will never be abruptly interrupted. Additional campaign dispatches are billed at a flat rate of ₹0.04 per platform message processed, or you can seamlessly upgrade to the next tier with a single click in your dashboard.',
    },
    {
      q: 'Can multiple team agents reply from the same official WhatsApp number?',
      a: 'Yes, absolutely. The CONVOZA Shared Team Inbox is built specifically for multi-agent concurrency. Your entire support or sales team can log in simultaneously, claim chats, transfer conversations, and leave internal private notes without any customer seeing who is typing.',
    },
    {
      q: 'How do I obtain the official Meta Green Tick badge?',
      a: 'Once your business is verified in Meta Business Manager and your WhatsApp phone number reaches Tier 2 quality rating with consistent messaging volume, CONVOZA helps you submit an Official Business Account (OBA) application directly to Meta. Growth and Enterprise plans receive priority submission support.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-200/70 bg-white">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        
        {/* Radial ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-emerald-200/40 via-teal-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-[13px] font-extrabold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>OFFICIAL META CLOUD API PLATFORM • ZERO HIDDEN MARKUPS</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Predictable, Transparent Pricing <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#021812] via-[#075E54] to-[#128C7E] bg-clip-text text-transparent">
              Built for Fast-Growing Brands
            </span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            No surprise per-message commission. Pay Meta official conversation charges at exact cost, backed by CONVOZA's high-throughput official infrastructure.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-10 inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-1.5 sm:p-2 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="inline-flex items-center p-1 bg-white rounded-xl shadow-xs border border-slate-200/60">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2 text-xs sm:text-sm font-extrabold rounded-lg transition-all duration-200 ${
                  billingPeriod === 'monthly'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('yearly')}
                className={`relative px-5 py-2 text-xs sm:text-sm font-extrabold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#25D366] text-slate-950">
                  Save 20%
                </span>
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <Star className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />
              <span>Get 2 Months Free with Annual Plans</span>
            </div>
          </div>

          {/* Guarantee Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              14-Day Free Trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Live in 5 Mins via Meta Embedded Signup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cancel Anytime With 1-Click
            </span>
          </div>
        </div>
      </section>

      {/* 2. THE 3 BESPOKE PRICING CARDS (WITH 3D TILT PHYSICS & METRIC CHECKS) */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-stretch pt-4">
              {/* 1. STARTER PLAN */}
              <div
                onMouseMove={(e) => handlePricingTilt(e, -2)}
                onMouseLeave={(e) => handlePricingReset(e, 'perspective(1000px) rotate(-2deg) translateY(14px)')}
                className="rounded-[36px] border border-slate-200/90 bg-white p-7 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.05)] hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)] hover:border-emerald-300/80 transition-all duration-500 ease-out flex flex-col justify-between group relative lg:[transform:perspective(1000px)_rotate(-2deg)_translateY(14px)] lg:origin-bottom-right cursor-pointer"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#128C7E] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Zap className="w-6 h-6 fill-[#128C7E]/20 text-[#128C7E]" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                      Starter Tier
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-black text-slate-900 tracking-tight">Starter</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[38px]">
                    Essential WhatsApp marketing for small businesses and budding stores.
                  </p>

                  {/* Price Box */}
                  <div className="mt-5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 group-hover:border-slate-300 transition-colors">
                    <div className="flex items-baseline gap-1.5">
                      {billingPeriod === 'yearly' && (
                        <span className="text-base text-slate-400 line-through font-semibold font-mono">
                          ₹2,499
                        </span>
                      )}
                      <span className="text-4xl sm:text-[42px] font-black text-slate-900 tracking-tight font-sans leading-none">
                        {billingPeriod === 'monthly' ? '₹2,499' : '₹1,999'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">/ mo</span>
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{billingPeriod === 'yearly' ? '⚡ Billed annually (₹23,988/yr) • 2 Months Free' : 'Billed monthly • Cancel anytime'}</span>
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="mt-6 space-y-3 text-xs sm:text-[13px] text-slate-700">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>Included Capabilities:</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-slate-900 font-bold">1 Official Phone Number</strong> (Meta Cloud)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-slate-900 font-bold">10,000 Messages</strong> / month allowance</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-slate-900 font-bold">2 Team Agent Seats</strong> for live chat</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Meta Embedded Signup (Live in 5 Mins)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Standard Outbox Worker & Anti-Ban Rate Limit</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Basic Keyword Auto-Reply Triggers</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Meta Template Builder (Buttons & Media)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100">
                  <Link
                    href="/register"
                    className="w-full py-3.5 px-6 rounded-full border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 font-extrabold text-sm text-slate-800 hover:text-emerald-950 text-center flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-200 group/btn"
                  >
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover/btn:text-emerald-600 group-hover/btn:translate-x-1 transition-all" />
                  </Link>
                  <div className="mt-2.5 text-center text-[11px] text-slate-400 font-medium">
                    No credit card required • Instant setup
                  </div>
                </div>
              </div>

              {/* 2. GROWTH PLAN (ELEVATED FEATURED CENTER CARD) */}
              <div
                onMouseMove={(e) => handlePricingTilt(e, 0)}
                onMouseLeave={(e) => handlePricingReset(e, 'perspective(1000px) translateY(-24px) scale(1.04)')}
                className="relative rounded-[38px] bg-gradient-to-b from-white via-white to-emerald-50/60 p-7 sm:p-8 border-2 border-emerald-500 shadow-[0_24px_60px_rgba(37,211,102,0.22)] hover:shadow-[0_36px_85px_rgba(37,211,102,0.32)] transition-all duration-500 ease-out flex flex-col justify-between z-20 group lg:[transform:perspective(1000px)_translateY(-24px)_scale(1.04)] cursor-pointer"
              >
                {/* Ambient Glow */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#25D366] rounded-[42px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none" />

                {/* Top Floating Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#021812] via-[#075E54] to-[#021812] border border-emerald-400/40 text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-950/20 flex items-center gap-2 whitespace-nowrap z-30">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>Most Popular • High ROI</span>
                </div>

                <div className="relative z-10">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-300 text-[#128C7E] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Flame className="w-6 h-6 text-[#128C7E] fill-emerald-500/30" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                      Best Value
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <span>Growth</span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Recommended
                    </span>
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[38px]">
                    For fast-scaling e-commerce brands, D2C merchants, and growing teams.
                  </p>

                  {/* Price Box */}
                  <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-emerald-100/50 border border-emerald-300/80 shadow-xs">
                    <div className="flex items-baseline gap-1.5">
                      {billingPeriod === 'yearly' && (
                        <span className="text-base text-slate-400 line-through font-semibold font-mono">
                          ₹5,999
                        </span>
                      )}
                      <span className="text-4xl sm:text-[42px] font-black text-[#075E54] tracking-tight font-sans leading-none">
                        {billingPeriod === 'monthly' ? '₹5,999' : '₹4,799'}
                      </span>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">/ mo</span>
                    </div>
                    <div className="mt-2 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] shrink-0" />
                      <span>{billingPeriod === 'yearly' ? 'Save ₹14,400/yr • 2 Months Free Included' : 'Instant Meta Cloud activation • Priority Outbox'}</span>
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="mt-6 space-y-3 text-xs sm:text-[13px] text-slate-700">
                    <div className="text-[11px] font-black uppercase tracking-wider text-emerald-800 pb-2 border-b border-emerald-100 flex items-center justify-between">
                      <span>Everything in Starter, plus:</span>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200">
                        3X SCALE
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/30 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-slate-900 font-bold">3 Official WhatsApp Numbers</strong> (Multi-Brand)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/30 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-slate-900 font-bold">50,000 Messages</strong> / month allowance</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/30 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-slate-900 font-bold">10 Team Seats</strong> with 3-Column Shared Inbox</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/30 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-slate-900 font-bold">Priority Worker Dispatch</strong> (50 msg/sec)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/30 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Automated Workflow Engine & Business Hours Bot</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/30 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>CSV Bulk Campaigns with Dynamic Token Replacement</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/30 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>24-Hour Window Countdown & Collision Detection</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-emerald-100 relative z-10">
                  <Link
                    href="/register"
                    className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-emerald-400 hover:to-teal-600 text-slate-950 font-black text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/35 hover:shadow-emerald-500/50 transform hover:scale-[1.02] active:scale-100 transition-all cursor-pointer group/cta"
                  >
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight className="w-4 h-4 stroke-[3] group-hover/cta:translate-x-1 transition-transform" />
                  </Link>
                  <div className="mt-2.5 text-center text-[11px] text-emerald-800 font-bold">
                    ✓ Full access to all Growth features • No credit card
                  </div>
                </div>
              </div>

              {/* 3. ENTERPRISE PLAN (OBSIDIAN DARK THEME) */}
              <div
                onMouseMove={(e) => handlePricingTilt(e, 2)}
                onMouseLeave={(e) => handlePricingReset(e, 'perspective(1000px) rotate(2deg) translateY(14px)')}
                className="rounded-[36px] bg-gradient-to-b from-[#0b1b17] via-[#091f1a] to-[#04120e] text-white p-7 sm:p-8 border border-emerald-500/30 shadow-[0_12px_40px_rgba(2,24,18,0.3)] hover:shadow-[0_30px_70px_rgba(2,24,18,0.5)] hover:border-emerald-500/50 transition-all duration-500 ease-out flex flex-col justify-between group relative overflow-hidden lg:[transform:perspective(1000px)_rotate(2deg)_translateY(14px)] lg:origin-bottom-left cursor-pointer"
              >
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      Enterprise Tier
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-black text-white tracking-tight">Enterprise</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed min-h-[38px]">
                    For high-volume retail leaders and organizations needing dedicated scale.
                  </p>

                  {/* Price Box */}
                  <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-baseline gap-1.5">
                      {billingPeriod === 'yearly' && (
                        <span className="text-base text-slate-400 line-through font-semibold font-mono">
                          ₹14,999
                        </span>
                      )}
                      <span className="text-4xl sm:text-[42px] font-black text-white tracking-tight font-sans leading-none">
                        {billingPeriod === 'monthly' ? '₹14,999' : '₹11,999'}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">/ mo</span>
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] shrink-0" />
                      <span>{billingPeriod === 'yearly' ? 'Custom high-throughput billing • Save ₹36,000/yr' : 'Custom contracts & Invoicing available'}</span>
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="mt-6 space-y-3 text-xs sm:text-[13px] text-slate-200">
                    <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400/90 pb-2 border-b border-white/10 flex items-center justify-between">
                      <span>Dedicated Scale & Support:</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-white font-bold">Unlimited Phone Numbers</strong> & Sub-Accounts</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-white font-bold">500,000+ Messages</strong> platform allowance</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-white font-bold">Unlimited Agent Seats</strong> with custom RBAC</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span><strong className="text-white font-bold">Dedicated Worker Cluster</strong> (250+ msg/sec outbox)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>99.99% Financial-Grade Uptime SLA Guarantee</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Custom Webhooks, ERP (Miracle/Tally) & CRM Sync</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Dedicated TAM & VIP WhatsApp Support</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-white/10 relative z-10">
                  <Link
                    href="/contact"
                    className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-black/30 hover:shadow-white/20 transition-all cursor-pointer group/btn"
                  >
                    <span>Contact Enterprise Sales</span>
                    <ArrowRight className="w-4 h-4 text-slate-900 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <div className="mt-2.5 text-center text-[11px] text-slate-400 font-medium">
                    Custom contracts • Invoicing & PO support
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. INTERACTIVE ROI & WHATSAPP ESTIMATOR */}
      <section className="py-16 bg-white border-y border-slate-200/80 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>INTERACTIVE SPEND ESTIMATOR</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Estimate Your Monthly WhatsApp Outlay
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Slide to your expected monthly broadcast volume. See your exact plan tier, Meta pass-through fees, and what you save with CONVOZA's 0% markup.
              </p>
            </div>

            <div className="mt-10 p-6 sm:p-10 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Volume Slider */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Monthly Message Target</span>
                    <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                      {audienceVolume.toLocaleString('en-IN')} <span className="text-sm font-semibold text-slate-400">messages / mo</span>
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[10000, 25000, 50000, 100000, 200000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAudienceVolume(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          audienceVolume === preset
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        {(preset / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <input
                    type="range"
                    min="5000"
                    max="250000"
                    step="5000"
                    value={audienceVolume}
                    onChange={(e) => setAudienceVolume(Number(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
                  />
                  <div className="mt-2 flex justify-between text-[11px] text-slate-400 font-semibold">
                    <span>5,000</span>
                    <span>50,000</span>
                    <span>100,000</span>
                    <span>175,000</span>
                    <span>250,000+</span>
                  </div>
                </div>

                {/* Calculation Cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recommended Plan</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
                      <span>{recTier.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ₹{recTier.price.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">All tools, outbox queue & team seats</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Est. Meta Official Fees</span>
                    <div className="text-2xl font-black text-white mt-1">
                      ₹{metaSpend.toLocaleString('en-IN')}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Billed directly by Meta (Zero markup)</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-[#021812] border border-emerald-500/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Your Markup Savings</span>
                    <div className="text-2xl font-black text-[#25D366] mt-1">
                      ₹{competitorMarkupTotal.toLocaleString('en-IN')} / mo
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-200/80">Saved compared to traditional 25p markups</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Meta Cloud conversation fees are charged directly by Meta per 24-hr session. CONVOZA charges ₹0 mark-up.</span>
                  </div>
                  <Link
                    href="/register"
                    className="px-5 py-2 rounded-xl bg-[#25D366] hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shrink-0"
                  >
                    Start Free Trial on {recTier.name} &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. COMPREHENSIVE DETAILED FEATURE COMPARISON TABLE */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>EXHAUSTIVE CAPABILITY BREAKDOWN</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Compare Plan Features Side-by-Side
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Detailed architectural, throughput, and support breakdown across all 3 tiers.
              </p>
            </div>

            {/* Comparison Matrix Container */}
            <div className="mt-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              {/* Sticky Column Headers */}
              <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 grid grid-cols-12 px-6 py-5 text-sm items-center shadow-xs">
                <div className="col-span-5 sm:col-span-6 font-black text-slate-900 text-base">
                  Feature / Capability
                </div>
                <div className="col-span-2 sm:col-span-2 text-center font-bold text-slate-800">
                  <div className="text-sm font-black">Starter</div>
                  <div className="text-xs text-slate-500 font-semibold">{billingPeriod === 'yearly' ? '₹1,999/mo' : '₹2,499/mo'}</div>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center font-black text-emerald-700 bg-emerald-50/70 py-1 rounded-xl border border-emerald-200/80">
                  <div className="text-sm font-black text-emerald-900">Growth ★</div>
                  <div className="text-xs text-emerald-800 font-bold">{billingPeriod === 'yearly' ? '₹4,799/mo' : '₹5,999/mo'}</div>
                </div>
                <div className="col-span-2 sm:col-span-2 text-center font-bold text-slate-900">
                  <div className="text-sm font-black">Enterprise</div>
                  <div className="text-xs text-slate-500 font-semibold">{billingPeriod === 'yearly' ? '₹11,999/mo' : '₹14,999/mo'}</div>
                </div>
              </div>

              {/* Categorized Rows */}
              <div className="divide-y divide-slate-100">
                {comparisonSections.map((sec, secIdx) => (
                  <div key={secIdx} className="bg-white">
                    {/* Category Header */}
                    <div className="bg-slate-50/90 px-6 py-3.5 border-t border-b border-slate-200/70 flex items-center gap-2.5 font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                      {sec.icon}
                      <span>{sec.category}</span>
                    </div>

                    {/* Features in this Category */}
                    <div className="divide-y divide-slate-100">
                      {sec.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="grid grid-cols-12 px-6 py-3.5 text-xs sm:text-sm items-center hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Feature Name & Tooltip */}
                          <div className="col-span-5 sm:col-span-6 pr-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{feat.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 leading-tight mt-0.5 font-normal">
                              {feat.tooltip}
                            </div>
                          </div>

                          {/* Starter Value */}
                          <div className="col-span-2 sm:col-span-2 text-center text-slate-600 font-medium">
                            {typeof feat.starter === 'boolean' ? (
                              feat.starter ? (
                                <div className="inline-flex w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="inline-flex w-5 h-5 rounded-full bg-slate-100 text-slate-400 items-center justify-center">
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              )
                            ) : (
                              <span className="font-semibold text-slate-800">{feat.starter}</span>
                            )}
                          </div>

                          {/* Growth Value */}
                          <div className="col-span-3 sm:col-span-2 text-center font-bold text-emerald-950 bg-emerald-50/30 py-1">
                            {typeof feat.growth === 'boolean' ? (
                              feat.growth ? (
                                <div className="inline-flex w-5 h-5 rounded-full bg-emerald-500 text-white items-center justify-center shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="inline-flex w-5 h-5 rounded-full bg-slate-100 text-slate-400 items-center justify-center">
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              )
                            ) : (
                              <span className="font-extrabold text-emerald-900">{feat.growth}</span>
                            )}
                          </div>

                          {/* Enterprise Value */}
                          <div className="col-span-2 sm:col-span-2 text-center text-slate-800 font-semibold">
                            {typeof feat.enterprise === 'boolean' ? (
                              feat.enterprise ? (
                                <div className="inline-flex w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="inline-flex w-5 h-5 rounded-full bg-slate-100 text-slate-400 items-center justify-center">
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              )
                            ) : (
                              <span className="font-black text-slate-900">{feat.enterprise}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Quick CTA Footer */}
              <div className="bg-slate-50 p-6 border-t border-slate-200 grid grid-cols-12 items-center">
                <div className="col-span-5 sm:col-span-6 font-bold text-slate-700 text-xs sm:text-sm">
                  Ready to start? Every plan includes a 14-day free trial.
                </div>
                <div className="col-span-2 sm:col-span-2 text-center">
                  <Link
                    href="/register"
                    className="inline-block px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-bold text-xs text-slate-800 transition-colors"
                  >
                    Select Starter
                  </Link>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center">
                  <Link
                    href="/register"
                    className="inline-block px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-extrabold text-xs text-white shadow-xs transition-colors"
                  >
                    Select Growth ★
                  </Link>
                </div>
                <div className="col-span-2 sm:col-span-2 text-center">
                  <Link
                    href="/contact"
                    className="inline-block px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 font-bold text-xs text-white transition-colors"
                  >
                    Talk to Sales
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. META OFFICIAL CLOUD API CONVERSATION PRICING TRANSPARENCY SECTION */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-black uppercase tracking-wider text-[#25D366] bg-emerald-950/90 border border-emerald-500/30 px-3 py-1 rounded-full">
                META TRANSPARENCY STANDARD
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white tracking-tight">
                How Meta Charges for WhatsApp Conversations
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Meta categorizes messages into 4 standard categories. Each conversation covers an unlimited 24-hour message window. CONVOZA charges <strong>₹0 markup</strong>.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category 1 */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  📢
                </div>
                <h3 className="mt-4 text-lg font-black text-white">Marketing</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Promotional offers, flash sales, discount coupons, and product launches to opted-in audiences.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 text-xs font-bold text-emerald-400">
                  ~₹0.82 / 24h window
                </div>
              </div>

              {/* Category 2 */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  📦
                </div>
                <h3 className="mt-4 text-lg font-black text-white">Utility</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Order confirmations, live delivery tracking, invoice delivery, and account billing notifications.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 text-xs font-bold text-emerald-400">
                  ~₹0.31 / 24h window
                </div>
              </div>

              {/* Category 3 */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  🔐
                </div>
                <h3 className="mt-4 text-lg font-black text-white">Authentication</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Single-use login OTP codes, password recovery, and multi-factor authentication tokens.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 text-xs font-bold text-emerald-400">
                  ~₹0.15 / 24h window
                </div>
              </div>

              {/* Category 4 */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  💬
                </div>
                <h3 className="mt-4 text-lg font-black text-white">Service Care</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Inbound customer support inquiries. 1,000 free service conversations included every month by Meta.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 text-xs font-bold text-emerald-400">
                  ~₹0.30 / 24h window
                </div>
              </div>
            </div>

            <div className="mt-10 text-center text-xs text-slate-400">
              * Rates are indicative for the India region (+91) as published by Meta. Meta billing is paid directly via your Facebook Business payment method.
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. EXPANDABLE FAQ ACCORDION (WITH HOVER & CLICK SUPPORT) */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Everything You Need to Know About CONVOZA Pricing
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Got a question? Check out our quick answers below or contact our WhatsApp support team.
              </p>
            </div>

            {/* Accordion List */}
            <div className="mt-12 space-y-3.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setOpenFaq(idx)}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'bg-white border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-emerald-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Still have questions card */}
            <div className="mt-12 p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Have a custom question or specific use case?</h4>
                  <p className="text-xs text-slate-600">Our WhatsApp technical specialists are online 24/7 to help evaluate your volume and setup.</p>
                </div>
              </div>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                Talk with an Expert &rarr;
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 7. BOTTOM ENTERPRISE CTA BANNER */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 to-[#021812] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>START RISK-FREE TODAY</span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Ready to Scale Your Customer Conversations on WhatsApp?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
              Join thousands of businesses who power their broadcast marketing, automated workflows, and team inbox with CONVOZA's official Meta Cloud infrastructure.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-emerald-400 hover:to-teal-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transform hover:scale-[1.02] active:scale-100 transition-all"
              >
                Start 14-Day Free Trial &rarr;
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all"
              >
                Schedule an Enterprise Demo
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                14-Day Free Trial
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                99.99% Financial Uptime SLA
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                Live in 5 Mins via Meta
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

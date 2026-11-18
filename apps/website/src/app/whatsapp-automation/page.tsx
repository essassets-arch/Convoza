'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Workflow,
  Bot,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ShoppingBag,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Activity,
  ArrowDown,
  Split,
  MessageSquare
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
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 blur-0'
          : 'opacity-0 translate-y-12 scale-[0.98] blur-[1px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function WhatsAppAutomationPage() {
  const [activeWorkflow, setActiveWorkflow] = useState<'cart' | 'cod' | 'support' | 'review'>('cart');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const workflowPresets = {
    cart: {
      title: 'Abandoned Cart Recovery Journey',
      desc: 'Recover up to 34% of dropped checkouts by triggering personalized WhatsApp reminders with dynamic discount codes.',
      trigger: {
        title: 'Shopify / ERP Webhook',
        event: 'Checkout Abandoned > 30 Mins',
        tag: 'TRIGGER',
      },
      condition: {
        title: 'Cart Value Evaluation',
        rule: 'If Cart Value >= ₹1,500',
        tag: 'LOGIC',
      },
      actionYes: {
        title: 'VIP WhatsApp Message + 15% Off Coupon',
        preview: 'Hi Rahul! Your cart is reserved. Use VIP15 for 15% OFF storewide before midnight!',
        tag: 'HIGH VALUE',
      },
      actionNo: {
        title: 'Standard Nudge + Free Delivery Voucher',
        preview: 'Hi Rahul! Complete your order now and enjoy Free Express Delivery on us.',
        tag: 'STANDARD',
      },
      outcome: 'Automated Recovery: 34.2% conversion rate • Average payback in 2 hours',
    },
    cod: {
      title: 'Automated COD Order & Address Verification',
      desc: 'Cut Return-to-Origin (RTO) shipping losses by verifying customer intent and precise street address immediately after checkout.',
      trigger: {
        title: 'New COD Order Ingested',
        event: 'Order Placed with Cash on Delivery',
        tag: 'TRIGGER',
      },
      condition: {
        title: 'Fraud & Location Screening',
        rule: 'Customer Address Completeness Check',
        tag: 'LOGIC',
      },
      actionYes: {
        title: 'Interactive 1-Click WhatsApp Confirmation',
        preview: 'Order #9921 placed for ₹2,499. Please confirm delivery to Flat 402, Green Heights, Bengaluru.',
        tag: 'INTERACTIVE',
      },
      actionNo: {
        title: 'Address Rectification & Pin Request',
        preview: 'Your address seems incomplete. Please share your WhatsApp location pin or landmark.',
        tag: 'PIN REQUEST',
      },
      outcome: 'RTO Reduced by 34% • Bogus orders auto-cancelled before courier dispatch',
    },
    support: {
      title: '24/7 AI Intent & Keyword Resolution Bot',
      desc: 'Instantly resolve 80% of customer questions about order tracking, returns, and catalog pricing with zero human delays.',
      trigger: {
        title: 'Inbound Customer Inquiry',
        event: 'Customer types: \"Where is my order?\"',
        tag: 'TRIGGER',
      },
      condition: {
        title: 'Natural Language Intent Parser',
        rule: 'Match Intent: Logistics_Tracking (99.8%)',
        tag: 'AI INTENT',
      },
      actionYes: {
        title: 'Dynamic ERP Tracking Card Dispatched',
        preview: 'Your order #ESS-4912 is out for delivery with Bluedart (Tracking: #BD9821). Expected today before 5 PM! 📦',
        tag: 'AUTO RESOLVE',
      },
      actionNo: {
        title: 'Smart Human Agent Handover',
        preview: 'Routing conversation to Alex (Support Desk) with customer history and tags.',
        tag: 'HANDOVER',
      },
      outcome: 'First Response Time < 1.2s • 82% tickets resolved without agent touch',
    },
    review: {
      title: 'Post-Delivery Review & VIP Upsell Journey',
      desc: 'Collect verified WhatsApp customer ratings and automatically re-engage happy buyers with tailored product recommendations.',
      trigger: {
        title: 'Courier Delivery Confirmation',
        event: 'Order Status changed to \"DELIVERED\"',
        tag: 'TRIGGER',
      },
      condition: {
        title: 'Customer Satisfaction Rating',
        rule: 'Customer Rates: ⭐⭐⭐⭐⭐ (5 Stars)',
        tag: 'SENTIMENT',
      },
      actionYes: {
        title: 'Exclusive VIP Re-order Catalog',
        preview: 'Thank you for loving your order! Here is an exclusive preview of our new arrivals with 20% off.',
        tag: 'UPSELL',
      },
      actionNo: {
        title: 'Priority Customer Care Escalation',
        preview: 'We are sorry to hear that. Our senior manager will contact you within 15 minutes to make this right.',
        tag: 'SERVICE RECOVERY',
      },
      outcome: '3.8x More Product Reviews • 22% repeat purchase within 30 days',
    },
  };

  const current = workflowPresets[activeWorkflow];

  const faqs = [
    {
      q: 'How quickly do automated workflows trigger after an event happens in our store?',
      a: 'CONVOZA webhooks trigger within 150 milliseconds of an event firing from Shopify, WooCommerce, or your custom database. The customer receives their WhatsApp message almost instantly.'
    },
    {
      q: 'Can I build multi-step journeys with custom delay timers?',
      a: 'Yes! You can add delay nodes such as \"Wait 30 minutes\", \"Wait 2 hours\", or \"Wait until 10:00 AM in the recipient timezone\" to create natural, non-intrusive nurture sequences.'
    },
    {
      q: 'How does the COD verification journey protect our business against RTO losses?',
      a: 'When a customer places a Cash on Delivery order, CONVOZA sends an interactive WhatsApp message with [Confirm Order] and [Cancel Order] buttons. If unconfirmed after 2 hours, it flags the order in your dashboard before courier pickup.'
    },
    {
      q: 'What happens when a customer sends a query that requires human attention?',
      a: 'The automation engine detects unhandled intents or frustration and immediately routes the chat to the Shared Team Inbox, alerting active agents while preserving complete context.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#021812] via-[#04281e] to-[#021812] py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[480px] h-[480px] bg-teal-400/12 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Visual Journey Builder</span>
            <span className="text-emerald-500/50">•</span>
            <span className="text-emerald-400 font-normal">Official Meta Cloud API</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Intelligent WhatsApp Journeys. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-[#25D366] to-teal-300 bg-clip-text text-transparent">
              Zero Code. Complete Autopilot.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Automate customer acquisition, COD order verification, cart abandonment recovery, and 24/7 intelligent query resolution on official Meta Cloud infrastructure.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Build First Automation Free</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 font-bold text-base border border-emerald-500/40 shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>View Pricing Plans</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <ScrollReveal delay={150}>
            <div className="mt-14 pt-10 border-t border-emerald-900/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">&lt; 150ms</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">Webhook Dispatch Latency</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">-34%</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">COD RTO Reduction</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">24h Meta Policy Compliance</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">24 / 7</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">Automated Resolution</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. BESPOKE REPRESENTATION: INTERACTIVE VISUAL WORKFLOW CANVAS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
              <Workflow className="w-3.5 h-3.5 text-[#128C7E]" />
              <span>Interactive Workflow Explorer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              See How Workflows Run in Real Time
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Select a recipe below to preview how trigger events automatically branch, verify, and resolve conversations on WhatsApp.
            </p>

            {/* Workflow Preset Switcher Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: 'cart', label: '🛒 Cart Recovery' },
                { id: 'cod', label: '📦 COD Verification' },
                { id: 'support', label: '🤖 24/7 AI Bot' },
                { id: 'review', label: '⭐ Review & Upsell' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkflow(tab.id as any)}
                  className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeWorkflow === tab.id
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Visual Workflow Canvas Interface */}
        <ScrollReveal delay={120}>
          <div className="rounded-[36px] bg-[#021812] border border-emerald-500/30 p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Canvas Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-emerald-900/60 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>active_journey_runtime // v20.0</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{current.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">{current.desc}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                  Live State: RUNNING
                </span>
              </div>
            </div>

            {/* Connected Workflow DAG Diagram */}
            <div className="mt-12 max-w-4xl mx-auto space-y-4">
              {/* Step 1: Trigger Node */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md p-4 rounded-2xl bg-white/5 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-400 font-mono font-bold">{current.trigger.tag}</div>
                      <div className="text-sm font-bold text-white">{current.trigger.title}</div>
                      <div className="text-xs text-slate-400">{current.trigger.event}</div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-ping" />
                </div>

                <div className="w-0.5 h-10 bg-gradient-to-b from-emerald-500 to-emerald-400 relative my-1">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                </div>
              </div>

              {/* Step 2: Logic Condition Node */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                      <Split className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-300 font-mono font-bold">{current.condition.tag}</div>
                      <div className="text-sm font-bold text-white">{current.condition.title}</div>
                      <div className="text-xs text-slate-300">{current.condition.rule}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-300">Evaluating</span>
                </div>

                <div className="w-full max-w-xl grid grid-cols-2 gap-8 my-2 text-center text-[10px] font-mono">
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-400 font-bold mb-1">✓ Branch A (Match)</span>
                    <div className="w-0.5 h-8 bg-emerald-400" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 font-bold mb-1">✕ Branch B (Fallback)</span>
                    <div className="w-0.5 h-8 bg-slate-600" />
                  </div>
                </div>
              </div>

              {/* Step 3: Two Branched Outcome Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {current.actionYes.tag}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold">WhatsApp Action</span>
                  </div>
                  <div className="font-bold text-white text-sm">{current.actionYes.title}</div>
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    &ldquo;{current.actionYes.preview}&rdquo;
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                      {current.actionNo.tag}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">Alternative Path</span>
                  </div>
                  <div className="font-bold text-white text-sm">{current.actionNo.title}</div>
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    &ldquo;{current.actionNo.preview}&rdquo;
                  </div>
                </div>
              </div>

              {/* Final Outcome Banner */}
              <div className="pt-6">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{current.outcome}</span>
                  </div>
                  <Link
                    href="/register"
                    className="px-4 py-1.5 rounded-full bg-[#25D366] text-slate-950 font-black text-xs hover:bg-[#20bd5a] transition-all shrink-0 cursor-pointer"
                  >
                    Deploy Recipe →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. EDITORIAL SPLIT-ROW HIGHLIGHTS (Clean & Professional) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Architecture Built for Resilience
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Learn why high-growth brands replace fragile third-party bots with official Meta Cloud automation.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-16">
          <ScrollReveal delay={100}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-xs font-mono font-bold text-[#128C7E] uppercase tracking-wider mb-2">01 // Reliability</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  PostgreSQL Transactional Triggers &amp; Skip-Locked Queues
                </h3>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Never lose a customer event during peak flash sales. Our backend queues events inside transactional PostgreSQL rows, using <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono text-xs">FOR UPDATE SKIP LOCKED</code> to process parallel dispatches without collisions.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">Sub-200ms Latency</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">Zero Duplicate Dispatches</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">Exponential Backoff</span>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-slate-900 text-white font-mono text-xs shadow-xl border border-slate-800 space-y-2">
                <div className="text-slate-500">// Transactional Worker Pipeline</div>
                <div className="text-emerald-400">BEGIN TRANSACTION;</div>
                <div className="text-slate-300">SELECT id, event_payload FROM outbound_events</div>
                <div className="text-slate-300">WHERE status = &apos;PENDING&apos;</div>
                <div className="text-amber-400">FOR UPDATE SKIP LOCKED LIMIT 100;</div>
                <div className="text-emerald-400">COMMIT; // Dispatched to Meta Cloud API v20.0</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center lg:flex-row-reverse">
              <div className="lg:order-2">
                <div className="text-xs font-mono font-bold text-[#128C7E] uppercase tracking-wider mb-2">02 // Compliance</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  24-Hour Customer Window Sentinel
                </h3>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Meta strictly enforces a 24-hour window from the customer&apos;s last message for free-form customer care. CONVOZA keeps real-time countdown timers on every conversation and automatically switches to approved templates when the window lapses.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">Zero Policy Strikes</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">Template Re-Opening</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">Protected Phone Tier</span>
                </div>
              </div>
              <div className="lg:order-1 p-6 rounded-3xl bg-[#031d16] border border-emerald-500/30 text-white shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Meta Policy Compliance Guard:</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Free-Form Session Active</div>
                    <div className="text-xs text-slate-400 mt-0.5">Remaining Window: 18h 42m</div>
                  </div>
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-xs text-emerald-200">
                  ✓ Auto-Fallback Template Ready (Shipping Update #491)
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. HOVER-TO-OPEN FAQ ACCORDION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-[#128C7E]" />
              <span>Automation FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Hover over any question to expand details about CONVOZA WhatsApp Automation.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => {
            const isOpen = openFaq === fIdx;
            return (
              <ScrollReveal key={fIdx} delay={fIdx * 60}>
                <div
                  onMouseEnter={() => setOpenFaq(fIdx)}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${
                    isOpen
                      ? 'bg-white border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                      : 'bg-white/80 border-slate-200 hover:border-emerald-300 hover:bg-white'
                  }`}
                >
                  <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </div>
                  <div
                    className={`grid transition-all duration-300 ease-in-out px-5 sm:px-6 ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 pb-5 sm:pb-6' : 'grid-rows-[0fr] opacity-0 pb-0'
                    }`}
                  >
                    <div className="overflow-hidden text-xs sm:text-sm text-slate-600 leading-relaxed pl-10 border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 5. BOTTOM CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <ScrollReveal delay={100}>
          <div className="relative rounded-[36px] bg-gradient-to-br from-[#021812] via-[#04281e] to-[#01140e] p-10 sm:p-14 lg:p-16 text-center text-white overflow-hidden shadow-2xl border border-emerald-500/30">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-3xl mx-auto relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Ready to Put Your WhatsApp Revenue on Autopilot?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
                Launch automated triggers, COD verification, and keyword bots in under 5 minutes with our Meta Embedded Signup.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

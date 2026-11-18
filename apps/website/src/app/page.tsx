'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { getDashboardUrl } from '../lib/api';
import {
  MessageSquare,
  Zap,
  Users,
  Send,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Inbox,
  Flame,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Globe,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Package,
  Headphones,
  Check,
  Star,
  ExternalLink,
  Play,
  RotateCcw,
  Camera,
  Paperclip,
  Cloud,
  CreditCard,
  Store,
  ShoppingBag,
  ShoppingCart,
  Table2,
  Workflow,
  Target,
  Clock,
  Lock,
  Activity,
  Mail,
  TrendingDown,
  TrendingUp,
  MessageCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';

export default function HomePage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [audienceSize, setAudienceSize] = useState<number>(10000);
  const [glowKey, setGlowKey] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [dashboardUrl, setDashboardUrl] = useState<string>('/dashboard');

  useEffect(() => {
    setDashboardUrl(getDashboardUrl());
  }, []);

  const handlePricingTilt = (e: React.MouseEvent<HTMLDivElement>, baseTiltY: number = 0) => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -6.5;
    const rotY = ((x - centerX) / centerX) * 6.5 + baseTiltY;
    card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-14px) scale3d(1.03, 1.03, 1.03)`;
  };

  const handlePricingReset = (e: React.MouseEvent<HTMLDivElement>, resetTransform: string) => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    const card = e.currentTarget;
    card.style.transform = resetTransform;
  };


  const handleSelectAudience = (size: number) => {
    setAudienceSize(size);
    setGlowKey(prev => prev + 1);
  };

  // Animation state for Enterprise Capabilities section
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const [animStage, setAnimStage] = useState<'idle' | 'shaking' | 'cascading' | 'done'>('idle');
  const [visibleCards, setVisibleCards] = useState<number[]>([1]); // Center card (index 1) ready by default

  const startFeaturesAnimation = useCallback(() => {
    // Stage 1: Only center card (index 1: High-Throughput Bulk Campaigns) is shown and shaking
    setAnimStage('shaking');
    setVisibleCards([1]);

    // Stage 2: After 800ms of vigorous shake, reveal all remaining cards one by one
    setTimeout(() => {
      setAnimStage('cascading');
      const sequence = [0, 2, 3, 4, 5];
      sequence.forEach((cardIdx, index) => {
        setTimeout(() => {
          setVisibleCards(prev => (prev.includes(cardIdx) ? prev : [...prev, cardIdx]));
          if (index === sequence.length - 1) {
            setTimeout(() => setAnimStage('done'), 600);
          }
        }, (index + 1) * 220); // 220ms stagger between each card
      });
    }, 850);
  }, []);

  useEffect(() => {
    const el = featuresSectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && animStage === 'idle') {
            startFeaturesAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animStage, startFeaturesAnimation]);

  // Integrations Marquee Data (Enriched for Advanced Enterprise Showcase)
  const integrations = [
    {
      name: 'HubSpot',
      category: 'Marketing & CRM',
      status: '2-Way Sync',
      icon: (
        <svg className="w-6 h-6 fill-[#FF7A59]" viewBox="0 0 24 24">
          <path d="M18.8 7.3V4.9c.7-.4 1.2-1.2 1.2-2.1C20 1.3 18.7 0 17.2 0s-2.8 1.3-2.8 2.8c0 .9.5 1.7 1.2 2.1v2.4c-1.1.4-2.1 1.1-2.8 2L6.4 4.5c.1-.3.2-.6.2-.9C6.6 1.6 5.1.1 3.3.1S0 1.6 0 3.6c0 1.9 1.5 3.5 3.3 3.5.8 0 1.6-.3 2.1-.8l6.3 4.7c-.5 1-.8 2.1-.8 3.3 0 1.2.3 2.3.8 3.3L8.2 20c-.5-.4-1.1-.6-1.8-.6-1.7 0-3.1 1.4-3.1 3.1 0 1.7 1.4 3.1 3.1 3.1 1.7 0 3.1-1.4 3.1-3.1 0-.4-.1-.8-.3-1.1l3.5-2.4c.8.9 1.8 1.6 2.9 2v2.4c-.7.4-1.2 1.2-1.2 2.1 0 1.5 1.3 2.8 2.8 2.8 1.5 0 2.8-1.3 2.8-2.8 0-.9-.5-1.7-1.2-2.1v-2.4c2.6-.9 4.4-3.4 4.4-6.3 0-2.9-1.8-5.4-4.4-6.3zm-1.6 9.6c-2 0-3.6-1.6-3.6-3.6s1.6-3.6 3.6-3.6 3.6 1.6 3.6 3.6-1.6 3.6-3.6 3.6z"/>
        </svg>
      ),
      highlight: false,
    },
    {
      name: 'Salesforce',
      category: 'Enterprise Cloud CRM',
      status: 'Live Sync',
      icon: <Cloud className="w-6 h-6 text-[#00A1E0]" />,
      highlight: false,
    },
    {
      name: 'Zoho CRM',
      category: 'Leads & Customer Pipeline',
      status: 'Automated',
      icon: (
        <span className="w-6 h-6 rounded-md bg-[#E42528] flex items-center justify-center text-white font-extrabold text-xs leading-none">
          Z
        </span>
      ),
      highlight: false,
    },
    {
      name: 'IndiaMART',
      category: 'B2B Inquiries & Leads',
      status: 'Instant Webhook',
      icon: <Store className="w-6 h-6 text-[#0084FF]" />,
      highlight: false,
    },
    {
      name: 'Miracle ERP',
      category: 'Accounting & Invoicing',
      status: 'Official Partner',
      icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
      highlight: true,
    },
    {
      name: 'Stripe',
      category: 'Global Card Payments',
      status: 'Instant Receipts',
      icon: <CreditCard className="w-6 h-6 text-[#635BFF]" />,
      highlight: false,
    },
    {
      name: 'Zapier',
      category: '5,000+ App Workflows',
      status: 'Webhooks',
      icon: <Zap className="w-6 h-6 text-[#FF4A00] fill-[#FF4A00]" />,
      highlight: false,
    },
    {
      name: 'Razorpay',
      category: 'UPI & Payment Links',
      status: 'Auto Pay Links',
      icon: (
        <svg className="w-6 h-6 text-[#0C2340]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.4 0H8.3L1.6 14.5h6.6L4.5 24 22.4 0z" />
        </svg>
      ),
      highlight: false,
    },
    {
      name: 'Shopify',
      category: 'Abandoned Cart & Orders',
      status: 'Real-Time Sync',
      icon: <ShoppingBag className="w-6 h-6 text-[#96BF48]" />,
      highlight: false,
    },
    {
      name: 'WooCommerce',
      category: 'Order Status & Tracking',
      status: '2-Way API',
      icon: <ShoppingCart className="w-6 h-6 text-[#96588A]" />,
      highlight: false,
    },
    {
      name: 'Google Sheets',
      category: 'Live Lead Auto-Export',
      status: 'Cloud Sync',
      icon: <Table2 className="w-6 h-6 text-[#0F9D58]" />,
      highlight: false,
    },
    {
      name: 'Pabbly Connect',
      category: 'Multi-Step Automation',
      status: 'Webhooks',
      icon: <Workflow className="w-6 h-6 text-[#1E90FF]" />,
      highlight: false,
    },
    {
      name: 'LeadSquared',
      category: 'High-Velocity Sales CRM',
      status: 'Lead Capture',
      icon: <Target className="w-6 h-6 text-[#FF7043]" />,
      highlight: false,
    },
    {
      name: 'Webflow',
      category: 'Lead Capture Forms',
      status: 'Instant Dispatch',
      icon: (
        <span className="w-6 h-6 rounded-md bg-[#4353FF] flex items-center justify-center text-white font-bold text-xs leading-none">
          W
        </span>
      ),
      highlight: false,
    },
  ];

  // Automated Conversation Loop State Machine (Zero Overflow, Natural Flow)
  const [convoStep, setConvoStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [activeBtn, setActiveBtn] = useState<'track' | 'support' | null>(null);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    if (convoStep === 0) {
      setIsTyping(false);
      setActiveBtn(null);
      // Wait 1.8s then auto-tap "Track Order"
      timer = setTimeout(() => {
        setActiveBtn('track');
        setTimeout(() => {
          setConvoStep(1);
          setActiveBtn(null);
        }, 300);
      }, 1800);
    } else if (convoStep === 1) {
      // Wait 0.8s then start bot typing
      timer = setTimeout(() => {
        setIsTyping(true);
        setConvoStep(2);
      }, 800);
    } else if (convoStep === 2) {
      // Bot types for 1.1s then delivers auto-reply
      timer = setTimeout(() => {
        setIsTyping(false);
        setConvoStep(3);
      }, 1100);
    } else if (convoStep === 3) {
      // Display completed result for 5s then smoothly restart loop
      timer = setTimeout(() => {
        setConvoStep(0);
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [convoStep]);

  const handleManualAction = (action: 'track' | 'support') => {
    setActiveBtn(action);
    if (action === 'track') {
      setConvoStep(1);
    } else {
      setConvoStep(3);
    }
  };

  const faqs = [
    {
      q: 'Does CONVOZA use official WhatsApp APIs or unofficial web scrapers?',
      a: 'CONVOZA exclusively integrates with the official Meta WhatsApp Business Platform Cloud API. We do not use QR code scraping, unofficial web clients, or browser automation. Your numbers are fully protected from bans and compliant with Meta policies.',
      category: 'Compliance & Safety',
    },
    {
      q: 'What is Meta Embedded Signup and how fast is onboarding?',
      a: 'Meta Embedded Signup allows your organization to onboard and verify WhatsApp phone numbers in under 2 minutes directly from the CONVOZA dashboard using official Facebook Login for Business—no waiting weeks for manual BSP reviews.',
      category: 'Onboarding',
    },
    {
      q: 'How does the 24-hour customer service window work?',
      a: 'Meta WhatsApp Business policy allows free-form two-way conversations when a customer initiates or replies to a message. Once 24 hours elapse without a customer response, pre-approved WhatsApp Templates can be sent to re-open the conversation.',
      category: 'Messaging Rules',
    },
    {
      q: 'Can multiple agents manage the same WhatsApp number simultaneously?',
      a: 'Yes! Our Shared Team Inbox is built for multi-agent support teams with role-based access control, ticket assignment, 24-hour countdown timers, internal private notes, and real-time Socket.IO live sync across all team members.',
      category: 'Collaboration',
    },
    {
      q: 'How fast can CONVOZA send bulk campaign broadcasts?',
      a: 'Our PostgreSQL-backed transactional worker engine is architected with token-bucket rate limiting to process up to 50 messages per second per phone number (scalable to 250+ msg/s on Enterprise) with automatic retry and live delivery status tracking.',
      category: 'Performance',
    },
    {
      q: 'How does billing for Meta official conversation fees work?',
      a: 'CONVOZA charges a flat platform subscription with zero message markups. Meta conversation fees (Marketing, Utility, Authentication, Service) are billed directly through your Meta Business payment method at official cost with no hidden commissions.',
      category: 'Pricing Transparency',
    },
  ];

  return (
    <div className="bg-slate-50 overflow-hidden">
      
      {/* ========================================================= */}
      {/* EXACT REFERENCE HERO SECTION (DARK GREEN LUXURY THEME)    */}
      {/* ========================================================= */}
      <section className="relative bg-gradient-to-b from-[#021812] via-[#04281e] to-[#021812] min-h-[calc(100vh-4.5rem)] flex items-center py-10 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Subtle Ambient Radial Glows and Dot Pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[520px] h-[520px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[460px] h-[460px] bg-teal-400/12 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Clean & Balanced Hero Typography */}
          <div className="lg:col-span-7 text-left">
            
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <WhatsAppIcon className="w-4 h-4 fill-[#25D366]" />
              <span>WhatsApp Business Automation Platform</span>
              <span className="text-emerald-500/50">•</span>
              <span className="text-emerald-400 text-xs font-normal">Official Meta Cloud API</span>
            </div>

            {/* Distinctive Headline Layout */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-white tracking-tight leading-[1.14]">
              Grow Your Business <br />
              <span className="font-normal text-slate-300">with</span>{' '}
              <span className="text-emerald-400 font-extrabold">WhatsApp Automation</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
              Broadcast high-converting bulk campaigns, automate customer journeys 24/7, and manage multi-agent support teams on the official Meta WhatsApp Cloud API.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={dashboardUrl}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-white font-semibold text-base border border-emerald-500/40 shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <span>View Demo</span>
              </a>
            </div>

            {/* Feature Checklist */}
            <div className="mt-10 pt-6 border-t border-emerald-900/50 grid grid-cols-2 gap-3.5 text-xs sm:text-sm text-slate-300 font-medium">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
                </div>
                <span className="font-semibold text-white">Official WhatsApp API</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Bulk & Individual Messaging</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Automation & Chatbot</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Shared Team Inbox</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Enterprise SaaS Live WhatsApp Simulator Box */}
          <div className="lg:col-span-5 relative flex justify-center py-2">
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-emerald-500/15 rounded-3xl blur-3xl transform scale-95 -z-10 pointer-events-none" />

            {/* Normal Professional Box Container with Strict Fixed Height (Never Resizes) */}
            <div className="w-full max-w-[460px] sm:max-w-[480px] h-[570px] sm:h-[585px] rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(16,185,129,0.12)] overflow-hidden flex flex-col">
              
              {/* Window Header (Fixed Height) */}
              <div className="shrink-0 bg-[#075E54] px-4 py-3 flex items-center justify-between text-white border-b border-emerald-800">
                <div className="flex items-center gap-3">
                  {/* Verified Business Avatar */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-emerald-800 border border-emerald-300/40 flex items-center justify-center text-white shadow-sm">
                      <WhatsAppIcon className="w-5 h-5 fill-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#25D366] border-2 border-[#075E54] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white tracking-tight">Convoza Store</span>
                      <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-300/30">
                        Official Meta API
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      <span>{isTyping ? 'Automated bot is typing...' : 'Active Automation Engine'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-bold text-emerald-950 bg-emerald-300 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-950" />
                    <span>120ms Auto-Reply</span>
                  </span>
                </div>
              </div>

              {/* Automation Step Status Ribbon (Fixed Height) */}
              <div className="shrink-0 bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold text-emerald-400">Live Automation:</span>
                  <span className="text-slate-300">
                    {convoStep === 0 && '1. Order template dispatched to customer'}
                    {convoStep === 1 && '2. Customer clicked "Track Order"'}
                    {convoStep === 2 && '3. Webhook received & rule triggered'}
                    {convoStep === 3 && '4. Instant auto-reply delivered'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full transition-all ${convoStep >= 0 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <span className={`w-2 h-2 rounded-full transition-all ${convoStep >= 1 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <span className={`w-2 h-2 rounded-full transition-all ${convoStep >= 2 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <span className={`w-2 h-2 rounded-full transition-all ${convoStep >= 3 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                </div>
              </div>

              {/* WhatsApp Message Canvas (Locked Height Flex Container) */}
              <div className="flex-1 bg-[#EFEAE2] p-4 flex flex-col justify-between text-slate-800 text-xs select-none overflow-hidden">
                
                {/* Message Stack (Scroll-free, zero resizing) */}
                <div className="space-y-2.5 overflow-hidden">
                  
                  {/* Encrypted Notice Pill */}
                  <div className="mx-auto bg-[#FDF4C5] text-[9.5px] text-slate-600 px-3 py-1 rounded-md text-center max-w-[280px] shadow-xs font-medium border border-amber-200/60 flex items-center justify-center gap-1">
                    <span>🔒</span>
                    <span>Messages end-to-end encrypted with Meta Cloud API</span>
                  </div>

                  {/* Message 1: Outbound Business Template Card */}
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-slate-200/80 max-w-[320px] animate-message">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <span>Hello Sarah!</span>
                        <span>🎉</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        Order #12345
                      </span>
                    </div>

                    <p className="mt-2 text-slate-700 text-xs leading-relaxed">
                      Your package has been dispatched via Express Delivery and is on the way!
                    </p>

                    <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[10.5px]">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <span>🚚</span>
                        <span className="font-semibold">BlueDart Express</span>
                      </div>
                      <span className="text-emerald-700 font-bold text-[10px]">Today, 3:30 PM</span>
                    </div>

                    <div className="mt-1.5 text-[9.5px] text-slate-400 flex items-center justify-end gap-1">
                      <span>10:24 AM</span>
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                    </div>

                    {/* Interactive WhatsApp Quick-Reply Buttons */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                      <button
                        onClick={() => handleManualAction('track')}
                        className={`w-full py-1.5 rounded-lg text-emerald-700 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-emerald-300 ${
                          activeBtn === 'track' || convoStep >= 1
                            ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500'
                            : 'bg-emerald-50/90 hover:bg-emerald-100'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Track Order</span>
                      </button>
                      <button
                        onClick={() => handleManualAction('support')}
                        className="w-full py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-200"
                      >
                        <Headphones className="w-3.5 h-3.5 text-slate-500" />
                        <span>Contact Support</span>
                      </button>
                    </div>
                  </div>

                  {/* Stage 1+: Customer Response Sent Automatically */}
                  {convoStep >= 1 && (
                    <div className="bg-[#D9FDD3] rounded-2xl rounded-tr-sm p-2.5 shadow-sm border border-emerald-200/80 ml-auto max-w-[210px] animate-message">
                      <p className="text-xs text-slate-800 font-medium flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Track Order</span>
                      </p>
                      <div className="mt-0.5 text-[9.5px] text-slate-500 flex items-center justify-end gap-1">
                        <span>10:24 AM</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    </div>
                  )}

                  {/* Stage 2: Typing Indicator */}
                  {isTyping && (
                    <div className="bg-white rounded-xl rounded-tl-sm px-3 py-1.5 shadow-sm w-fit flex items-center gap-1.5 animate-message border border-slate-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 typing-dot-1" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 typing-dot-2" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 typing-dot-3" />
                    </div>
                  )}

                  {/* Stage 3: Instant Dispatch Bot Card */}
                  {convoStep >= 3 && (
                    <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-emerald-200 max-w-[310px] animate-message">
                      <p className="text-xs text-slate-800 leading-snug">
                        🚚 <strong>BlueDart Express:</strong> Driver Ramesh is 2 stops away. Arriving by <strong>3:30 PM</strong>!
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-emerald-600" />
                          <span>120ms Auto-Reply</span>
                        </span>
                        <div className="text-slate-400 flex items-center gap-1">
                          <span>10:24 AM</span>
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Authentic WhatsApp Message Input Bar (Pinned at bottom) */}
                <div className="shrink-0 mt-auto pt-2.5 flex items-center gap-2 border-t border-slate-200/80 bg-[#EFEAE2]">
                  <div className="flex-1 bg-white rounded-full px-4 py-2 text-xs text-slate-400 border border-slate-200/90 flex items-center justify-between shadow-xs">
                    <span>Type a message...</span>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Paperclip className="w-4 h-4 hover:text-slate-600 cursor-pointer" />
                      <Camera className="w-4 h-4 hover:text-slate-600 cursor-pointer" />
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer hover:bg-emerald-600 transition-colors">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TRUSTED INTEGRATIONS & META CLOUD API MARQUEE             */}
      {/* ========================================================= */}
      <section className="bg-white py-14 sm:py-16 border-y border-slate-200/90 relative overflow-hidden">
        
        {/* Subtle Ambient Engineering Grid & Glow */}
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[180px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mb-8 sm:mb-10">
          
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-semibold tracking-wide mb-5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase tracking-[0.16em] text-[10.5px] font-bold text-slate-600">Enterprise Ecosystem</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">Integrated with 1,000+ Platforms</span>
          </div>

          {/* Meta WhatsApp Cloud API Integration Showcase */}
          <div className="flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-4 sm:gap-5 px-6 sm:px-8 py-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all group">
              <div className="flex items-center gap-2.5">
                <svg className="h-7 sm:h-8 w-auto fill-[#0064E0]" viewBox="0 0 100 62" fill="none">
                  <path d="M50 37.5C44.8 27.8 38.3 18.2 28.5 18.2C17.2 18.2 8.5 27.2 8.5 38.8C8.5 50.4 17.5 59.4 28.5 59.4C37.8 59.4 44.5 51.5 50 41.5C55.5 51.5 62.2 59.4 71.5 59.4C82.5 59.4 91.5 50.4 91.5 38.8C91.5 27.2 82.8 18.2 71.5 18.2C61.7 18.2 55.2 27.8 50 37.5ZM28.5 50.2C22.2 50.2 17.5 45.2 17.5 38.8C17.5 32.4 22.2 27.4 28.5 27.4C34.5 27.4 39.8 34.5 44.2 41.8C40.2 47.5 35 50.2 28.5 50.2ZM71.5 50.2C65 50.2 59.8 47.5 55.8 41.8C60.2 34.5 65.5 27.4 71.5 27.4C77.8 27.4 82.5 32.4 82.5 38.8C82.5 45.2 77.8 50.2 71.5 50.2Z" />
                </svg>
                <span className="text-2xl sm:text-[1.75rem] font-black tracking-tight text-slate-900 font-sans">
                  Meta
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 tracking-tight">Built on Official Meta WhatsApp Cloud API v20.0</span>
                  <CheckCircle2 className="w-4 h-4 text-[#0064E0] fill-[#0064E0] text-white" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] shrink-0" />
                  <span>Independent Meta Cloud API Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee Track Container: Data Moves Smoothly from Left to Right */}
        <div className="relative w-full overflow-hidden">
          {/* Edge Fade Gradients on Pure White */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          {/* Infinite Left-to-Right Moving Strip with Large Advanced Cards */}
          <div className="animate-marquee-ltr flex items-center gap-5 py-3">
            {[...integrations, ...integrations].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl min-w-[260px] whitespace-nowrap transition-all select-none group cursor-pointer ${
                  item.highlight
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50/60 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 hover:shadow-xl hover:-translate-y-1'
                    : 'bg-white border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:border-emerald-500/60 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* App Brand Icon Box */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                  item.highlight ? 'bg-white border border-emerald-200' : 'bg-slate-50 border border-slate-100'
                }`}>
                  {item.icon}
                </div>

                {/* App Details */}
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                      {item.name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      item.highlight 
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200/80'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium block truncate mt-0.5">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* WHY WHATSAPP? THE NUMBERS DON'T LIE (CHANNEL ROI DUEL)   */}
      {/* ========================================================= */}
      <section className="relative bg-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-y border-slate-200/90 overflow-hidden text-slate-900">
        
        {/* Subtle Ambient Engineering Grid and Soft Glow */}
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[360px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-semibold mb-5 shadow-2xs">
              <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
              <span className="uppercase tracking-[0.16em] text-[10.5px] font-bold text-slate-600">Why WhatsApp?</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Channel ROI Comparison</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.14]">
              The Numbers Don't Lie: <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 via-[#128C7E] to-teal-600 bg-clip-text text-transparent">
                WhatsApp Outperforms Email by 5.4X
              </span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Email marketing is dying in spam folders. WhatsApp delivers 5x higher engagement and direct customer relationships. See why leading businesses are making the switch.
            </p>

            {/* Interactive Audience Simulator Controller */}
            <div className="mt-9 flex flex-col items-center">
              <div className="w-full max-w-3xl rounded-2xl bg-slate-50/90 p-2 sm:p-2.5 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                
                {/* Header row inside simulator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 pt-1 pb-2 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100/90 text-[#128C7E] flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 fill-[#128C7E]" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Simulate Your Audience List
                    </span>
                    <span className="hidden sm:inline text-xs text-slate-600">• Real-Time ROI Engine</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <span className="text-slate-600 font-medium">Selected Tier:</span>
                    <span className="font-mono font-black text-slate-950 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      {audienceSize.toLocaleString()} Contacts
                    </span>
                  </div>
                </div>

                {/* 5-Column Responsive Button Grid - perfectly aligned, never awkward wrapping */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                  {[
                    { size: 5000, label: '5,000', tag: 'Starter' },
                    { size: 10000, label: '10,000', tag: 'Growth' },
                    { size: 25000, label: '25,000', tag: 'Popular' },
                    { size: 50000, label: '50,000', tag: 'Scale' },
                    { size: 100000, label: '100,000', tag: 'Enterprise' },
                  ].map((tier) => {
                    const isSelected = audienceSize === tier.size;
                    return (
                      <button
                        key={tier.size}
                        onClick={() => handleSelectAudience(tier.size)}
                        className={`group relative py-2.5 px-2 rounded-xl transition-all cursor-pointer text-center select-none transform active:scale-95 ${
                          isSelected
                            ? 'bg-[#25D366] text-slate-950 font-black shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                            : 'bg-white hover:bg-slate-100/80 text-slate-800 font-bold border border-slate-200/90 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-black tracking-tight font-sans">
                          {tier.label}
                        </div>
                        <div
                          className={`text-[10px] uppercase tracking-wider font-extrabold mt-0.5 ${
                            isSelected ? 'text-emerald-950' : 'text-slate-600'
                          }`}
                        >
                          Contacts
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Click any contact tier above to preview real-time reach & trigger live conversion glow</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Duel Cards with Dynamic Click-Glow */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* The Problem Card: Traditional Email Marketing */}
            <div
              key={`email-card-${glowKey}`}
              className={`rounded-3xl bg-white border-2 p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden shadow-[0_4px_24px_rgba(244,63,94,0.06)] group transition-all duration-300 ${
                glowKey > 0 ? 'animate-glow-rose' : 'border-rose-200 hover:border-rose-400 hover:shadow-xl'
              }`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    The Problem
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-2xs">
                    <Mail className="w-6 h-6" />
                  </div>
                </div>

                {/* Main Metric */}
                <div className="mt-7">
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl sm:text-7xl font-black text-rose-600 tracking-tight font-sans">
                      18%
                    </span>
                    <span className="text-rose-700 flex items-center gap-1 text-sm font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <TrendingDown className="w-4 h-4 stroke-[3]" /> Avg. Open Rate
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    Traditional Email Marketing
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Your carefully crafted emails are going straight to spam or promotions tabs. <strong className="text-rose-600">82% never get opened</strong> or read by your customers.
                  </p>
                </div>

                {/* Realistic Simulated Email Spam Preview */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 text-[10.5px]">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Filtered to Promotions / Spam</span>
                    </div>
                    <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[9.5px]">
                      Unopened
                    </span>
                  </div>
                  <div className="mt-2 text-slate-700 text-[11px] truncate font-medium">
                    Summer Mega Offer: 50% discount on entire catalog...
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">
                    Sent: 3 days ago • 82% of contacts never saw this
                  </div>
                </div>

                {/* Real Impact on Selected List Size */}
                <div className="mt-5 p-4 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Opened Messages:</span>
                    <strong className={`text-rose-600 text-sm font-mono font-bold ${glowKey > 0 ? 'animate-number-pop' : ''}`}>
                      {Math.round(audienceSize * 0.18).toLocaleString()} / {audienceSize.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Est. Click-Throughs:</span>
                    <span className="text-slate-800 font-mono font-semibold">
                      ~{Math.round(audienceSize * 0.025).toLocaleString()} clicks (2.5%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Avg. Customer Response Lag:</span>
                    <span className="text-slate-700 font-medium">48+ Hours (If ever)</span>
                  </div>
                </div>
              </div>

              {/* Segmented Low Chart Bars */}
              <div className="mt-7 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span>Open Rate Benchmark: 18%</span>
                  <span className="text-rose-600 font-bold">Depleted Reach</span>
                </div>
                <div className="grid grid-cols-10 gap-1.5 h-7">
                  <div className="bg-rose-500/80 rounded-md h-full" />
                  <div className="bg-rose-400/60 rounded-md h-[80%] mt-auto" />
                  <div className="bg-slate-200/90 rounded-md h-[30%] mt-auto" />
                  <div className="bg-slate-200/90 rounded-md h-[25%] mt-auto" />
                  <div className="bg-slate-200/70 rounded-md h-[20%] mt-auto" />
                  <div className="bg-slate-200/70 rounded-md h-[20%] mt-auto" />
                  <div className="bg-slate-200/70 rounded-md h-[20%] mt-auto" />
                  <div className="bg-slate-200/70 rounded-md h-[20%] mt-auto" />
                  <div className="bg-slate-200/70 rounded-md h-[20%] mt-auto" />
                  <div className="bg-slate-200/70 rounded-md h-[20%] mt-auto" />
                </div>
              </div>
            </div>

            {/* The Solution Card: WhatsApp Automation */}
            <div
              key={`whatsapp-card-${glowKey}`}
              className={`rounded-3xl bg-white border-2 p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden shadow-[0_10px_40px_rgba(37,211,102,0.12)] group transition-all duration-300 ${
                glowKey > 0 ? 'animate-glow-emerald' : 'border-[#25D366] hover:shadow-[0_20px_50px_rgba(37,211,102,0.22)]'
              }`}
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#128C7E]" />
                    The Solution
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#128C7E] flex items-center justify-center shadow-xs">
                    <WhatsAppIcon className="w-7 h-7 fill-[#25D366]" />
                  </div>
                </div>

                {/* Main Metric */}
                <div className="mt-7">
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl sm:text-7xl font-black text-[#128C7E] tracking-tight font-sans">
                      98%
                    </span>
                    <span className="text-slate-950 bg-[#25D366] flex items-center gap-1 text-sm font-extrabold px-3 py-1 rounded-full shadow-xs">
                      <TrendingUp className="w-4 h-4 stroke-[3]" /> WhatsApp Open Rate
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Convoza WhatsApp Automation</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      Meta Cloud API
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Your messages land directly in your customer's pocket with an instant lockscreen chime. <strong className="text-slate-900">Real conversations, real conversions.</strong>
                  </p>
                </div>

                {/* Realistic Simulated WhatsApp Push Notification Preview */}
                <div className="mt-5 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/80 text-[10.5px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center p-0.5">
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                      </div>
                      <span>Convoza Verified Store</span>
                      <span className="text-[9.5px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                        Cloud API v20.0
                      </span>
                    </div>
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> Read in 90s
                    </span>
                  </div>
                  <div className="mt-2 text-slate-800 text-[11px] font-medium leading-tight">
                    🚚 <strong>VIP Flash Sale:</strong> Your 50% voucher is active! Tap below to redeem now.
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 text-[10px] font-bold text-emerald-700 shadow-2xs">
                      🛍️ Shop Catalog
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 text-[10px] font-bold text-slate-700 shadow-2xs">
                      💬 Chat Support
                    </span>
                  </div>
                </div>

                {/* Real Impact on Selected List Size */}
                <div className="mt-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Opened Messages:</span>
                    <strong className={`text-[#128C7E] text-sm font-mono font-bold ${glowKey > 0 ? 'animate-number-pop' : ''}`}>
                      {Math.round(audienceSize * 0.98).toLocaleString()} / {audienceSize.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Est. Click-Throughs:</span>
                    <span className="text-emerald-900 font-mono font-bold">
                      ~{Math.round(audienceSize * 0.45).toLocaleString()} clicks (45%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Avg. Bot Auto-Reply:</span>
                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" /> 120ms Latency SLA
                    </span>
                  </div>
                </div>

                {/* Highlighted Net Audience Advantage Banner */}
                <div className={`mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-[#128C7E] text-white flex items-center justify-between text-xs font-bold shadow-sm ${glowKey > 0 ? 'animate-number-pop' : ''}`}>
                  <span>✨ Net Customer Reach Gain:</span>
                  <span className="text-sm font-extrabold font-mono tracking-tight bg-white/20 px-2.5 py-0.5 rounded-lg">
                    +{(Math.round(audienceSize * 0.98) - Math.round(audienceSize * 0.18)).toLocaleString()} Extra Customers
                  </span>
                </div>
              </div>

              {/* Segmented High Chart Bars */}
              <div className="mt-7 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-600 mb-2">
                  <span>Open Rate Benchmark: 98%</span>
                  <span className="text-emerald-700 font-extrabold">Instant Read in 3 Mins</span>
                </div>
                <div className="grid grid-cols-10 gap-1.5 h-7">
                  <div className="bg-[#25D366] rounded-md h-full shadow-2xs" />
                  <div className="bg-[#25D366] rounded-md h-full shadow-2xs" />
                  <div className="bg-[#25D366] rounded-md h-full shadow-2xs" />
                  <div className="bg-[#25D366] rounded-md h-full shadow-2xs" />
                  <div className="bg-[#25D366] rounded-md h-full shadow-2xs" />
                  <div className="bg-[#25D366] rounded-md h-full shadow-2xs" />
                  <div className="bg-[#25D366] rounded-md h-full shadow-2xs" />
                  <div className="bg-[#25D366] rounded-md h-full shadow-2xs" />
                  <div className="bg-[#25D366] rounded-md h-full shadow-2xs" />
                  <div className="bg-emerald-400 rounded-md h-[95%] shadow-2xs" />
                </div>
              </div>
            </div>

          </div>

          {/* 4 Supplementary ROI Multiplier Bento Cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Response Speed */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#128C7E] flex items-center justify-center shadow-2xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                    ⚡ 32X Faster
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight">
                  90 Secs
                </div>
                <div className="mt-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                  Avg. Response Time
                </div>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Customers read and reply to WhatsApp messages within 90 seconds, compared to 48 hours on email.
                </p>
              </div>
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-medium">Email Benchmark:</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10.5px]">48+ Hours</span>
              </div>
            </div>

            {/* Card 2: Cart Recovery */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#128C7E] flex items-center justify-center shadow-2xs">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                    🛒 6X Revenue
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight">
                  45% - 65%
                </div>
                <div className="mt-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                  Cart Recovery Rate
                </div>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Automated 1-click WhatsApp cart recovery triggers convert up to 6x more lost revenue than email.
                </p>
              </div>
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-medium">Email Cart Recovery:</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10.5px]">Only ~8%</span>
              </div>
            </div>

            {/* Card 3: Sales Conversion */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#128C7E] flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                    ✨ 380% Lift
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight">
                  3.8X
                </div>
                <div className="mt-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                  Sales Conversion
                </div>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Interactive CTA buttons and WhatsApp catalog carousels convert high-intent buyers on the spot.
                </p>
              </div>
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-medium">Email Click-Through:</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10.5px]">~2.5% CTR</span>
              </div>
            </div>

            {/* Card 4: 0 Spam Folders */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#128C7E] flex items-center justify-center shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                    🛡️ Cloud API v20.0
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight">
                  0 Spam
                </div>
                <div className="mt-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                  Direct Lockscreen Reach
                </div>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Official Meta Cloud API tier guarantees verified phone notifications with zero deliverability drops.
                </p>
              </div>
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-medium">Deliverability SLA:</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10.5px]">99.9% In-Pocket</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* ENTERPRISE CAPABILITIES FEATURE GRID                     */}
      {/* ========================================================= */}
      <section ref={featuresSectionRef} className="py-24 sm:py-28 bg-gradient-to-b from-white via-slate-50/70 to-white border-y border-slate-200/80 relative overflow-hidden">
        
        {/* Subtle Ambient Background Elements */}
        <div className="absolute inset-0 bg-dot-pattern opacity-25 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[360px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-4 shadow-2xs">
              <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
              <span className="uppercase tracking-[0.18em] text-[10.5px] font-bold">Enterprise Platform Architecture</span>
              <span className="text-emerald-300">•</span>
              <span className="text-emerald-700 font-medium">Official Meta Cloud API v20.0</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Everything Your Business Needs <br className="hidden sm:inline" />
              to <span className="bg-gradient-to-r from-emerald-600 via-[#128C7E] to-teal-600 bg-clip-text text-transparent">Scale on WhatsApp</span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Engineered with strict multi-tenancy, transactional outbox reliability, real-time Socket.IO streaming, and official Meta Cloud APIs.
            </p>

            {/* Platform Credibility Badges & Replay Trigger */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
              <button
                onClick={startFeaturesAnimation}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-full shadow-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer font-bold text-xs"
                title="Click to replay the scroll animation"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Replay Animation
              </button>
              <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 99.98% Deliverability
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> &lt;120ms Bot Latency
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> AES-256-GCM Encrypted
              </span>
            </div>
          </div>

          {/* Advanced Enterprise 6-Card Grid with Center-Shake and Cascading Stagger Entrance */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            
            {/* Card 0: Meta Embedded Signup */}
            <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-emerald-500/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.09)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between p-7 group ${
              visibleCards.includes(0)
                ? animStage === 'done'
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'animate-card-pop'
                : 'opacity-0 pointer-events-none translate-y-8 scale-95 transition-all duration-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#25D366] transition-all shadow-xs">
                    <WhatsAppIcon className="w-6 h-6 fill-[#25D366] group-hover:fill-white transition-colors" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                    Official Meta OAuth
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                  Meta Embedded Signup
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Connect official WhatsApp Business Accounts and numbers in seconds with Facebook Login for Business dialogs, eliminating complex developer portals.
                </p>

                {/* Micro-UI Preview Widget */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>WABA Verified Status</span>
                    </div>
                    <span className="text-[9.5px] bg-blue-50 text-[#0064E0] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                      Meta Cloud API v21.0
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Phone Number +91 98... Linked</span>
                    </div>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-extrabold">
                      Live Tier
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> Zero manual tokens
                </span>
                <span className="text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Instant Connect <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 1: High-Throughput Bulk Campaigns (CENTER BOX THAT SHAKES) */}
            <div className={`bg-white rounded-2xl border flex flex-col justify-between p-7 group transition-all duration-500 ${
              animStage === 'shaking'
                ? 'animate-box-shake ring-4 ring-emerald-500/50 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.35)] z-20'
                : animStage === 'cascading'
                ? 'ring-2 ring-emerald-500/30 border-emerald-400 shadow-xl'
                : 'border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-emerald-500/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.09)] hover:-translate-y-1.5'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#128C7E] group-hover:text-white transition-all shadow-xs">
                    <Send className="w-6 h-6" />
                  </div>
                  {animStage === 'shaking' ? (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 shadow-sm animate-pulse flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-slate-950" /> Initializing Core Engine...
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      High Scale Queue
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                  High-Throughput Bulk Campaigns
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Broadcast personalized messages to thousands of customers with dynamic CSV variables, anti-ban token buckets, and opt-out suppression.
                </p>

                {/* Micro-UI Preview Widget */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                  <div className="flex items-center justify-between pb-1.5">
                    <span className="font-semibold text-slate-800">Festive Mega Sale Broadcast</span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      99.8% Sent
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-[#25D366] h-full rounded-full w-[99.8%]" />
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-1 text-center pt-1 border-t border-slate-200/60">
                    <div>
                      <div className="font-extrabold text-slate-800 text-[11px]">24,500</div>
                      <div className="text-[9.5px] text-slate-400">Delivered</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-emerald-600 text-[11px]">98.4%</div>
                      <div className="text-[9.5px] text-slate-400">Open Rate</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-blue-600 text-[11px]">41.2%</div>
                      <div className="text-[9.5px] text-slate-400">CTR</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 250 msg/sec Rate
                </span>
                <span className="text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Explore Engine <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 2: Multi-Agent Shared Inbox */}
            <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-emerald-500/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.09)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between p-7 group ${
              visibleCards.includes(2)
                ? animStage === 'done'
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'animate-card-pop'
                : 'opacity-0 pointer-events-none translate-y-8 scale-95 transition-all duration-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#128C7E] group-hover:text-white transition-all shadow-xs">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80">
                    Real-Time Socket.IO
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                  Multi-Agent Shared Inbox
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Equip support and sales teams with 3-column ticket routing, 24-hour window countdowns, private internal notes, and instant live sync.
                </p>

                {/* Micro-UI Preview Widget */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shadow-2xs">
                        AK
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">Alex K. (Support Lead)</span>
                    </div>
                    <span className="text-[9.5px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200/80 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> 21h Window
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 truncate max-w-[170px] italic">"Order dispatched via BlueDart Express"</span>
                    <span className="text-[9.5px] font-extrabold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                      Assigned
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> Unlimited Team Seats
                </span>
                <span className="text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Team Inbox <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 3: Visual Template Builder */}
            <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-emerald-500/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.09)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between p-7 group ${
              visibleCards.includes(3)
                ? animStage === 'done'
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'animate-card-pop'
                : 'opacity-0 pointer-events-none translate-y-8 scale-95 transition-all duration-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#128C7E] group-hover:text-white transition-all shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                    Interactive Preview
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                  Visual Template Builder
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Design Marketing, Utility, and Authentication templates with dynamic variables, interactive quick-reply buttons, and phone simulator.
                </p>

                {/* Micro-UI Preview Widget */}
                <div className="mt-5 p-3 rounded-xl bg-[#EFEAE2] border border-slate-300/80 text-xs">
                  <div className="bg-white rounded-lg p-2.5 shadow-2xs border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold text-emerald-700">ORDER CONFIRMATION #&#123;&#123;1&#125;&#125;</span>
                      <span className="text-[9px] text-slate-400 font-medium">Auto-Sync</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-tight">
                      Hi &#123;&#123;name&#125;&#125;! Your order is confirmed and shipping today.
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <div className="flex-1 py-1 rounded bg-slate-50 border border-slate-200 text-[9.5px] text-center font-bold text-emerald-700">
                        📦 Track Order
                      </div>
                      <div className="flex-1 py-1 rounded bg-slate-50 border border-slate-200 text-[9.5px] text-center font-bold text-slate-700">
                        💬 Support
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Meta Auto-Approval
                </span>
                <span className="text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Create Templates <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 4: Automated 24/7 Workflow Engine */}
            <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-emerald-500/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.09)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between p-7 group ${
              visibleCards.includes(4)
                ? animStage === 'done'
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'animate-card-pop'
                : 'opacity-0 pointer-events-none translate-y-8 scale-95 transition-all duration-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#128C7E] group-hover:text-white transition-all shadow-xs">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    120ms SLA
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                  Automated Workflow Engine
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Trigger instant auto-replies, business hours routing, intent categorization, and automated team assignment based on message keywords.
                </p>

                {/* Micro-UI Preview Widget */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <span className="font-bold text-slate-800 text-[11px]">Rule: Price Inquiry Trigger</span>
                    <span className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono bg-white p-2 rounded-lg border border-slate-200/80">
                    <span className="text-emerald-700 font-bold">KEYWORD</span>
                    <span className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">"PRICE"</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-blue-700 font-bold">SEND</span>
                    <span className="text-slate-700 font-semibold truncate">Brochure.pdf</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 flex items-center gap-1">
                  <Workflow className="w-3.5 h-3.5 text-emerald-600" /> Visual No-Code Logic
                </span>
                <span className="text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Explore Workflows <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 5: Bank-Grade Security & Isolation */}
            <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-emerald-500/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.09)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between p-7 group ${
              visibleCards.includes(5)
                ? animStage === 'done'
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'animate-card-pop'
                : 'opacity-0 pointer-events-none translate-y-8 scale-95 transition-all duration-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#128C7E] group-hover:text-white transition-all shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Bank-Grade ISO Ready
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                  AES-256 Encrypted Security
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Bank-grade token encryption, HMAC timing-safe webhook verification, refresh token rotation, and strict multi-tenant row-level database isolation.
                </p>

                {/* Micro-UI Preview Widget */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-700">AES-256-GCM</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-700">HMAC-SHA256</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-700">Multi-Tenant</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-bold text-slate-700">GDPR Compliant</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 99.99% Guaranteed SLA
                </span>
                <span className="text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Security Docs <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PRICING PLANS SECTION                                     */}
      {/* ========================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        
        {/* Subtle Ambient Radial Glow behind Pricing Hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-emerald-500/10 via-teal-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-xs font-semibold mb-4 shadow-2xs">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
            <span className="uppercase tracking-[0.16em] text-[10.5px] font-extrabold">Transparent Wholesale Pricing</span>
            <span className="text-emerald-400">•</span>
            <span className="text-emerald-700 font-semibold">Official Meta Cloud API</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Simple, Predictable Plans for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-[#128C7E] to-teal-600 bg-clip-text text-transparent">
              Every Stage of Growth
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Zero message markup or hidden fees. Connect your official WhatsApp numbers with full isolation, high-speed outbox queues, and automated campaigns.
          </p>

          {/* Premium Segmented Billing Switcher */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-slate-950 shadow-md shadow-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-emerald-500 to-[#128C7E] text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-slate-950/80 text-emerald-300 border border-emerald-400/30'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                <span>Save 20%</span>
              </span>
            </button>
          </div>
        </div>

        {/* 3 Tier Pricing Cards - Dynamic 3D Tilt & Round Crescent Arc Layout */}
        <div className="mt-16 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-7 items-stretch relative z-10 pt-6 pb-6 [perspective:1400px]">
          
          {/* 1. Starter Plan (Tilted Inward Left Arc) */}
          <div
            onMouseMove={(e) => handlePricingTilt(e, -2)}
            onMouseLeave={(e) => handlePricingReset(e, 'perspective(1000px) rotate(-2deg) translateY(14px)')}
            className="rounded-[40px] border border-slate-200/90 bg-white/95 backdrop-blur-sm p-7 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.05)] hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)] hover:border-emerald-300/80 transition-all duration-500 ease-out flex flex-col justify-between group relative lg:[transform:perspective(1000px)_rotate(-2deg)_translateY(14px)] lg:origin-bottom-right cursor-pointer"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#128C7E] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 fill-[#128C7E]/20 text-[#128C7E]" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                  Starter Tier
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-black text-slate-900 tracking-tight">Starter</h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[38px]">
                Essential WhatsApp marketing for small businesses and budding stores.
              </p>

              {/* Price Pill */}
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
                <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{billingPeriod === 'yearly' ? '⚡ Billed annually (₹23,988/yr) • 2 Months Free' : 'Billed monthly • Cancel anytime'}</span>
                </div>
              </div>

              {/* Feature Checklist */}
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
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <Link
                href="/register"
                className="w-full py-4 px-6 rounded-full border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 font-bold text-sm text-slate-800 hover:text-emerald-950 text-center flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-200 group/btn cursor-pointer"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover/btn:text-emerald-600 group-hover/btn:translate-x-1 transition-all" />
              </Link>
              <div className="mt-2 text-center text-[11px] text-slate-400 font-medium">
                No credit card required • Instant setup
              </div>
            </div>
          </div>

          {/* 2. Growth Plan (Elevated Featured Center Card) */}
          <div
            onMouseMove={(e) => handlePricingTilt(e, 0)}
            onMouseLeave={(e) => handlePricingReset(e, 'perspective(1000px) translateY(-24px) scale(1.04)')}
            className="relative rounded-[40px] bg-gradient-to-b from-white via-white to-emerald-50/50 p-7 sm:p-8 border-2 border-emerald-500 shadow-[0_24px_60px_rgba(37,211,102,0.22)] hover:shadow-[0_36px_85px_rgba(37,211,102,0.32)] transition-all duration-500 ease-out flex flex-col justify-between z-20 group lg:[transform:perspective(1000px)_translateY(-24px)_scale(1.04)] cursor-pointer"
          >
            {/* Ambient Background Glow Effect */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#25D366] rounded-[44px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none" />

            {/* Top Floating Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#021812] via-[#075E54] to-[#021812] border border-emerald-400/40 text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-950/20 flex items-center gap-2 whitespace-nowrap z-30">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Most Popular • High ROI</span>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-300 text-[#128C7E] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Flame className="w-5 h-5 text-[#128C7E] fill-emerald-500/30" />
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

              {/* Price Pill */}
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
                  <span>{billingPeriod === 'yearly' ? 'Save ₹14,400/yr • 2 Months Free' : 'Instant Meta Cloud activation'}</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="mt-6 space-y-3 text-xs sm:text-[13px] text-slate-700">
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-800 pb-2 border-b border-emerald-100 flex items-center justify-between">
                  <span>Everything in Starter, plus:</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">3X Scale</span>
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
                  <span>24-Hour Window Countdown & Smart Tags</span>
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
              <div className="mt-2 text-center text-[11px] text-emerald-800 font-bold">
                ✓ Full access to all Growth features • No credit card
              </div>
            </div>
          </div>

          {/* 3. Enterprise Plan (Tilted Inward Right Arc) */}
          <div
            onMouseMove={(e) => handlePricingTilt(e, 2)}
            onMouseLeave={(e) => handlePricingReset(e, 'perspective(1000px) rotate(2deg) translateY(14px)')}
            className="rounded-[40px] bg-gradient-to-b from-[#0b1b17] via-[#091f1a] to-[#04120e] text-white p-7 sm:p-8 border border-emerald-500/30 shadow-[0_12px_40px_rgba(2,24,18,0.3)] hover:shadow-[0_30px_70px_rgba(2,24,18,0.5)] hover:border-emerald-500/50 transition-all duration-500 ease-out flex flex-col justify-between group relative overflow-hidden lg:[transform:perspective(1000px)_rotate(2deg)_translateY(14px)] lg:origin-bottom-left cursor-pointer"
          >
            {/* Subtle Top Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                  Enterprise Tier
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-black text-white tracking-tight">Enterprise</h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed min-h-[38px]">
                For high-volume retail leaders and organizations needing dedicated scale.
              </p>

              {/* Price Pill */}
              <div className="mt-5 p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{billingPeriod === 'yearly' ? '⚡ Billed annually (₹143,988/yr)' : 'Custom high-throughput billing available'}</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="mt-6 space-y-3 text-xs sm:text-[13px] text-slate-200">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 flex items-center justify-between">
                  <span>Dedicated Scale & Support:</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong className="text-white font-bold">Unlimited Phone Numbers</strong> & Sub-Accounts</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong className="text-white font-bold">Unlimited Messages</strong> (Meta conversation at cost)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong className="text-white font-bold">Unlimited Team Seats</strong> with custom roles</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong className="text-white font-bold">Dedicated Worker Cluster</strong> (250+ msg/sec outbox)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>99.99% Financial-Grade Uptime SLA Guarantee</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Custom Webhooks, ERP & CRM Integrations</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Dedicated TAM & VIP WhatsApp Support</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10 relative z-10">
              <Link
                href="/contact"
                className="w-full py-4 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:shadow-xl transition-all cursor-pointer group/btn"
              >
                <span>Contact Enterprise Sales</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <div className="mt-2 text-center text-[11px] text-slate-400 font-medium">
                Custom contracts • Invoicing & PO support
              </div>
            </div>
          </div>

        </div>

        {/* High-Trust Value & Guarantees Bar Below Pricing */}
        <div className="mt-16 max-w-6xl mx-auto rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Built on Official Meta Cloud API</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">100% compliant with zero risk of bans</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Zero Message Markup</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Official Meta conversation rates at cost</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">5-Minute Embedded Setup</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Go live instantly with Facebook Login</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Cancel Anytime in 1-Click</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">No long-term contracts or lock-in</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* FREQUENTLY ASKED QUESTIONS SECTION                       */}
      {/* ========================================================= */}
      <section className="py-24 bg-gradient-to-b from-white via-slate-50/60 to-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-3 shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="uppercase tracking-[0.16em] text-[10.5px] font-bold">Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Everything You Need to Know About <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 via-[#128C7E] to-teal-600 bg-clip-text text-transparent">
                Convoza Automation
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Clear answers to common questions about official Meta Cloud APIs, compliance, broadcast throughput, and setup.
            </p>
          </div>

          {/* Interactive Modern Accordion List */}
          <div className="mt-12 space-y-3.5">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setOpenFaq(i)}
                  className={`group rounded-2xl transition-all duration-300 border overflow-hidden cursor-pointer ${
                    isOpen
                      ? 'bg-white border-emerald-400 shadow-[0_8px_30px_rgba(37,211,102,0.12)] ring-1 ring-emerald-400/30'
                      : 'bg-white border-slate-200/90 hover:border-emerald-300/80 hover:shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          isOpen
                            ? 'bg-[#25D366]/15 text-[#128C7E] border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200/60 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-200/50'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-base sm:text-lg font-bold tracking-tight transition-colors duration-200 ${
                          isOpen ? 'text-slate-900' : 'text-slate-800 group-hover:text-emerald-950'
                        }`}>
                          {faq.q}
                        </span>
                        {faq.category && (
                          <span className={`hidden sm:inline-block ml-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                            isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50/70 group-hover:text-emerald-700'
                          }`}>
                            {faq.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? 'bg-emerald-50 text-emerald-700 rotate-180'
                          : 'bg-slate-50 text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50/70'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pl-16 sm:pl-18">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dedicated 24/7 Specialist Support Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-[#128C7E] flex items-center justify-center shadow-xs shrink-0">
                <WhatsAppIcon className="w-7 h-7 fill-[#25D366]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Have a custom question or specific use case?</h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Our WhatsApp technical specialists are online 24/7 to help evaluate your volume and setup.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-slate-950 hover:text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Talk with an Expert</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* FINAL HIGH-CONVERTING CTA                                 */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 rounded-3xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <WhatsAppIcon className="w-9 h-9 fill-[#25D366]" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Ready to connect your business to 2+ billion WhatsApp users?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Get started in 2 minutes with official Meta Embedded Signup. 14-day free trial, no credit card required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-base transition-colors shadow-lg shadow-emerald-400/20"
            >
              Start Free 14-Day Trial
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-base border border-slate-700 transition-colors"
            >
              Schedule Demo Call
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

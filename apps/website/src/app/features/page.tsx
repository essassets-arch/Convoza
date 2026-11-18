'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap,
  MessageSquare,
  Users,
  Send,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Radio,
  FileSpreadsheet,
  Sparkles,
  Bot,
  Inbox,
  Flame,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Check,
  Star,
  Store,
  ShoppingBag,
  ShoppingCart,
  Workflow,
  Target,
  Clock,
  Activity,
  Mail,
  MessageCircle,
  Layers,
  Smartphone,
  Share2,
  Code2,
  SlidersHorizontal,
  CheckCheck,
  PhoneCall,
  Filter,
  Eye,
  CreditCard,
  Building2,
  QrCode,
  Tag,
  Headphones,
  RotateCcw,
  TrendingUp,
  Cpu,
  Server,
  Play
} from 'lucide-react';

interface HighlightItem {
  lead: string;
  detail: string;
}

interface FeatureItem {
  category: string;
  categoryLabel: string;
  badge: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: HighlightItem[];
  previewType: 'campaign' | 'inbox' | 'workflow' | 'commerce' | 'leads' | 'security';
}

function FeatureBox({
  feature,
  idx,
  isEven,
}: {
  feature: FeatureItem;
  idx: number;
  isEven: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-white via-slate-50/70 to-emerald-50/20 border border-slate-200/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_-15px_rgba(18,140,126,0.12)] hover:border-emerald-500/40 p-8 sm:p-10 lg:p-12 overflow-hidden transform transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 blur-0'
          : 'opacity-0 translate-y-16 scale-[0.97] blur-[1px]'
      }`}
    >
      {/* Decorative ambient radial glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 via-teal-400/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      {/* Sequence Watermark */}
      <span className="absolute top-6 right-8 text-7xl sm:text-8xl font-black text-slate-100/70 select-none tracking-tighter pointer-events-none font-mono">
        0{idx + 1}
      </span>

      <div
        className={`relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center ${
          isEven ? '' : 'lg:flex-row-reverse'
        }`}
      >
        {/* Left Column: Feature Narrative & Highlights */}
        <div className={`lg:col-span-7 ${isEven ? '' : 'lg:order-2'}`}>
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-emerald-200 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-5 shadow-2xs backdrop-blur-md">
            <span className="text-[#128C7E]">{feature.icon}</span>
            <span>{feature.categoryLabel}</span>
            <span className="text-emerald-300">•</span>
            <span className="text-emerald-600 font-extrabold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {feature.badge}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">
            {feature.title}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {feature.description}
          </p>

          {/* Structured Capability Micro-Cards (High-End & Professional) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {feature.highlights.map((h, hIdx) => (
              <div
                key={hIdx}
                className="p-3.5 rounded-2xl bg-white/90 hover:bg-emerald-50/60 border border-slate-200/70 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-start gap-3 group/item cursor-default"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100/90 text-[#128C7E] flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-[#128C7E] group-hover/item:text-white group-hover/item:scale-110 transition-all duration-200 shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-xs leading-snug">
                  <div className="font-extrabold text-slate-900 group-hover/item:text-emerald-950 transition-colors">
                    {h.lead}
                  </div>
                  <div className="text-slate-500 mt-0.5 text-[11.5px] leading-relaxed">
                    {h.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-slate-900/10 hover:shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Try This Capability</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-xs sm:text-sm font-bold text-[#128C7E] hover:text-emerald-800 transition-all cursor-pointer"
            >
              <span>Available in Growth & Enterprise</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: High-Fidelity Interactive Console Mockup */}
        <div className={`lg:col-span-5 ${isEven ? '' : 'lg:order-1'}`}>
          <div className="rounded-3xl bg-[#031d16] border border-emerald-500/30 p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden ring-1 ring-emerald-500/20">
            {/* Ambient Internal Glow */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Simulated macOS Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-900/50 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-emerald-400/80 ml-2">
                  convoza // {feature.category} // v20.0
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Active
              </span>
            </div>

            {/* Mockup Body */}
            <div className="mt-5 space-y-4 relative z-10 text-xs">
              {feature.previewType === 'campaign' && (
                <div className="space-y-3 font-sans">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Broadcast Dispatch Queue</span>
                      <span className="text-emerald-400 font-mono font-bold">50 msg/sec</span>
                    </div>
                    <div className="text-base font-black text-white mt-1">
                      VIP Weekend Flash Sale #4910
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span>Progress: 9,890 / 10,000 sent</span>
                        <span className="text-emerald-300 font-bold">98.9%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#25D366] rounded-full w-[98.9%]" />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-emerald-400 font-black text-base">10,000</div>
                        <div className="text-[10px] text-slate-400">Total Sent</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-emerald-400 font-black text-base">98.9%</div>
                        <div className="text-[10px] text-slate-400">Delivered</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-emerald-400 font-black text-base">85.4%</div>
                        <div className="text-[10px] text-slate-400">Read Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Message Preview Bubble */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-emerald-300 font-mono">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Cloud API Message Bubble</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11.5px] text-slate-200 leading-relaxed">
                      ✨ Hi <strong>Rahul</strong>! Your VIP access pass is active. Use code <span className="text-emerald-400 font-bold font-mono">DIWALI40</span> for 40% OFF storewide today!
                    </div>
                    <button className="w-full py-2 rounded-lg bg-[#25D366] text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Claim My 40% Discount</span>
                    </button>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[10.5px]">
                    <span className="text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Token-Bucket Rate Limiter Active</span>
                    </span>
                    <span className="text-slate-400 font-mono">0% Ban Risk</span>
                  </div>
                </div>
              )}

              {feature.previewType === 'inbox' && (
                <div className="space-y-3 font-sans">
                  {/* Active Chat Header */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-500/40">
                        SM
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs flex items-center gap-1.5">
                          <span>Sarah Miller</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 font-semibold">VIP</span>
                        </div>
                        <div className="text-[10px] text-slate-400">+91 •••• ••0001 (Number Masked)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>21h 14m window</span>
                    </span>
                  </div>

                  {/* Customer Message */}
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11.5px] leading-relaxed text-slate-300">
                    &ldquo;Could you confirm when order #ESS-4912 will arrive?&rdquo;
                  </div>

                  {/* Agent Reply */}
                  <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-[11.5px] leading-relaxed text-emerald-100 flex items-start justify-between">
                    <div>
                      <div className="text-[10px] text-emerald-400 font-bold mb-0.5">Agent Alex (Tier 2 Support):</div>
                      <div>&ldquo;Hello Sarah! Your order is with Bluedart (Tracking: #BD9821). Delivery is scheduled today before 5 PM! 📦&rdquo;</div>
                    </div>
                    <CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-1 ml-2" />
                  </div>

                  {/* Internal Private Team Note */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10.5px] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Private Note: Alex added priority shipping voucher (Customer Tier: VIP Gold)</span>
                  </div>
                </div>
              )}

              {feature.previewType === 'workflow' && (
                <div className="space-y-2.5 font-sans">
                  {/* Node 1 */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
                      <span className="font-bold text-white">Trigger:</span>
                      <span className="text-slate-300">Keyword &ldquo;TRACK_ORDER&rdquo;</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-mono text-slate-300">Event</span>
                  </div>

                  <div className="w-0.5 h-3.5 bg-emerald-500/50 mx-auto" />

                  {/* Node 2 */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="font-bold text-white">AI Decision:</span>
                      <span className="text-slate-300">Intent Match &gt; 99.4%</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-mono">NLP</span>
                  </div>

                  <div className="w-0.5 h-3.5 bg-emerald-500/50 mx-auto" />

                  {/* Node 3 */}
                  <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between text-[11px] text-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-white">Action:</span>
                      <span>Fetch ERP Tracking &amp; Send WhatsApp Template</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[9px] font-mono">Complete</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>COD Address Verification Active</span>
                    <span className="text-emerald-400 font-bold font-mono">Zero Code</span>
                  </div>
                </div>
              )}

              {feature.previewType === 'commerce' && (
                <div className="space-y-3 font-sans">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
                      <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                        <Store className="w-3.5 h-3.5" />
                        <span>Meta Catalog Storefront</span>
                      </span>
                      <span className="text-emerald-400 font-mono text-[10px]">142 SKUs Synced</span>
                    </div>

                    {/* Product Card */}
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xl">
                        ⌚
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-xs truncate">Minimalist Chrono Watch</div>
                        <div className="text-emerald-400 font-mono text-[11px] mt-0.5">₹4,999 <span className="line-through text-slate-400 text-[10px]">₹7,999</span></div>
                        <div className="text-[10px] text-slate-300">In Stock (14 left)</div>
                      </div>
                    </div>

                    {/* WhatsApp In-Chat Checkout Action */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button className="py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-[10.5px] border border-white/10 transition-colors flex items-center justify-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add to Cart</span>
                      </button>
                      <button className="py-2 rounded-lg bg-[#25D366] text-slate-950 font-black text-[10.5px] flex items-center justify-center gap-1 shadow-sm">
                        <Zap className="w-3 h-3 fill-slate-950" />
                        <span>Instant UPI Pay</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[10.5px] flex items-center justify-between">
                    <span>Razorpay &amp; Stripe 1-Click Gateway</span>
                    <span className="font-mono text-emerald-400 font-bold">₹0 Added Markup</span>
                  </div>
                </div>
              )}

              {feature.previewType === 'leads' && (
                <div className="space-y-3 font-sans">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[11px]">
                    <div className="text-slate-400 text-[10.5px]">Incoming Click-to-WhatsApp Ad Attribution</div>
                    <div className="text-white font-black text-sm mt-1">Campaign: VIP Summer Festival #CTWA-881</div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-blue-400 font-black text-sm">Instagram Reels</div>
                        <div className="text-[10px] text-slate-400">Ad Creative Source</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-emerald-400 font-black text-sm">9.4x ROAS</div>
                        <div className="text-[10px] text-slate-400">Campaign Return</div>
                      </div>
                    </div>

                    <div className="mt-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10.5px] flex items-center justify-between font-mono">
                      <span>Cost per Conversation:</span>
                      <span className="font-bold text-white">₹4.20 / chat</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-[10.5px] text-emerald-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Auto-assigned to Senior Sales Rep within 3 seconds</span>
                  </div>
                </div>
              )}

              {feature.previewType === 'security' && (
                <div className="space-y-2.5 font-mono text-[10.5px]">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
                    <div><span className="text-emerald-400 font-bold">POST</span> /api/v1/messages/broadcast</div>
                    <div className="text-slate-500">Authorization: Bearer jwt_tenant_sec</div>
                    <div className="text-slate-500">TenantGuard: org_01a_isolated</div>
                    <div className="text-slate-400 mt-2 font-mono text-[10px]">
                      &#123; &quot;template&quot;: &quot;vip_promo&quot;, &quot;recipients&quot;: 10000 &#125;
                    </div>
                    <div className="pt-2 text-emerald-400 font-bold flex items-center gap-1.5 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>HTTP 200 OK • 42ms response latency</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-sans">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>AES-256-GCM Token Encryption</span>
                    </span>
                    <span className="font-mono text-slate-300">SOC2 Certified</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories = [
    { id: 'all', label: 'All Capabilities', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'broadcasts', label: 'Bulk Broadcasts', icon: <Send className="w-3.5 h-3.5" /> },
    { id: 'inbox', label: 'Shared Team Inbox', icon: <Inbox className="w-3.5 h-3.5" /> },
    { id: 'automation', label: 'AI & Workflows', icon: <Workflow className="w-3.5 h-3.5" /> },
    { id: 'commerce', label: 'WhatsApp Commerce', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'leads', label: 'Leads & Ad Hub', icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'security', label: 'Security & APIs', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const allFeatures: FeatureItem[] = [
    {
      category: 'broadcasts',
      categoryLabel: 'Bulk Campaigns & Broadcasts',
      badge: 'Zero Ban Risk',
      icon: <Send className="w-4 h-4 text-[#128C7E]" />,
      title: 'High-Throughput Official Meta Broadcast Engine',
      description:
        'Deliver marketing promotions, flash sale announcements, and event updates to tens of thousands of opted-in customers using official Meta-approved Cloud API templates.',
      highlights: [
        { lead: 'PostgreSQL Outbox Queue', detail: '50 msg/sec dedicated worker throughput' },
        { lead: 'Token-Bucket Rate Limiter', detail: 'Protects phone quality score and prevents throttling' },
        { lead: 'Dynamic Variable Tokens', detail: 'Personalize {{name}}, {{order_no}}, {{tracking_link}}' },
        { lead: 'Automated Opt-Out Engine', detail: 'Automatic STOP suppression honoring Meta policies' },
        { lead: 'Timezone-Smart Dispatch', detail: 'Scheduled delivery for peak customer engagement' },
        { lead: 'Live Message Telemetry', detail: 'Real-time Sent, Delivered, Read & CTR analytics' },
      ],
      previewType: 'campaign',
    },
    {
      category: 'inbox',
      categoryLabel: 'Shared Team Inbox',
      badge: 'Multi-Agent Live Sync',
      icon: <Inbox className="w-4 h-4 text-emerald-600" />,
      title: '3-Column Collaborative Customer Care Workspace',
      description:
        'Empower multiple customer support and sales agents to manage conversations on a single official WhatsApp number with zero conflicts and real-time Socket.IO live sync.',
      highlights: [
        { lead: 'Multi-Agent Live Sync', detail: 'Real-time WebSocket sync with zero collision locks' },
        { lead: '24h Service Window Timer', detail: 'Countdown clock with automatic template fallback' },
        { lead: 'Smart Chat Routing', detail: 'Auto-distribute by department, skill, or availability' },
        { lead: 'Private Team Notes', detail: 'Internal @mentions hidden completely from customers' },
        { lead: 'Phone Number Masking', detail: 'Enterprise protection against customer data export' },
        { lead: 'Rich Media Engine', detail: 'Send PDF invoices, catalog media, and voice notes' },
      ],
      previewType: 'inbox',
    },
    {
      category: 'automation',
      categoryLabel: 'AI & Workflow Automation',
      badge: '24/7 Intelligent Automation',
      icon: <Workflow className="w-4 h-4 text-teal-600" />,
      title: 'Visual Journey Builder & Keyword Auto-Reply Engine',
      description:
        'Automate routine customer interactions, qualify inbound leads, and trigger post-purchase nurture sequences using intelligent condition-based automation rules.',
      highlights: [
        { lead: 'Visual Journey Builder', detail: 'Drag-and-drop conditions, branches, and delay timers' },
        { lead: 'AI Intent & Keyword Bots', detail: 'Instant 24/7 resolution of frequent customer queries' },
        { lead: 'COD & Anti-RTO Engine', detail: 'Automatic WhatsApp address confirmation before shipping' },
        { lead: 'Cart Recovery Sequences', detail: 'Automated discount nudges recovering up to 34% carts' },
        { lead: 'Event-Driven Auto Tags', detail: 'Dynamic customer segmentation by spending tiers' },
        { lead: 'Interactive Meta Flows', detail: 'In-chat native booking, surveys, and lead forms' },
      ],
      previewType: 'workflow',
    },
    {
      category: 'commerce',
      categoryLabel: 'WhatsApp Commerce',
      badge: 'Storefront Inside WhatsApp',
      icon: <ShoppingBag className="w-4 h-4 text-emerald-700" />,
      title: 'Meta Catalog Sync & 1-Click Conversational Checkout',
      description:
        'Transform WhatsApp into a high-converting digital showroom. Sync your product catalog directly from Shopify, WooCommerce, or custom ERPs for frictionless in-chat browsing.',
      highlights: [
        { lead: 'Shopify & ERP Sync', detail: 'Real-time Meta Commerce catalog synchronization' },
        { lead: 'Multi-Product Catalogs', detail: 'Interactive in-chat product carousels with variants' },
        { lead: '1-Click Payment Gateways', detail: 'Direct UPI, Razorpay & Stripe in-chat checkout' },
        { lead: 'Live Order Tracking', detail: 'Real-time tracking buttons and delivery status alerts' },
        { lead: 'Automated Star Reviews', detail: 'Post-delivery customer satisfaction rating collection' },
        { lead: 'VIP Re-engagement', detail: 'Personalized product upsells based on past orders' },
      ],
      previewType: 'commerce',
    },
    {
      category: 'leads',
      categoryLabel: 'Leads & Click-to-WhatsApp Ads',
      badge: 'High-ROI Attribution',
      icon: <Target className="w-4 h-4 text-amber-600" />,
      title: 'Omnichannel Leads Hub & Ad Attribution Tracking',
      description:
        'Convert cold ad clicks into active WhatsApp conversations. Track ad source, creative ID, and campaign ROI with automated lead qualification and CRM distribution.',
      highlights: [
        { lead: 'Click-to-WhatsApp Ads', detail: 'Direct Meta & Instagram ad lead ingestion' },
        { lead: 'Full ROAS Attribution', detail: 'Track ad creative ID, click cost, and conversion revenue' },
        { lead: 'Instant Ad Welcome Triggers', detail: 'Tailored greeting messages matched to the clicked ad' },
        { lead: 'Website WhatsApp Widget', detail: 'Floating branded chat button with custom pre-filled text' },
        { lead: 'Smart Lead Qualification', detail: 'Automated bot questionnaires before human handover' },
        { lead: 'Executive Daily Briefs', detail: 'Automated summary reports on new leads & conversion ROI' },
      ],
      previewType: 'leads',
    },
    {
      category: 'security',
      categoryLabel: 'Enterprise Security & APIs',
      badge: 'Bank-Grade Infrastructure',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
      title: 'Tenant-Safe Relational Architecture & Developer REST APIs',
      description:
        'Engineered for maximum reliability and strict data governance. Fully compliant with official Meta Business Solution Provider policies and SOC2/ISO standards.',
      highlights: [
        { lead: 'TenantGuard Data Isolation', detail: 'Strict logical schema separation across organizations' },
        { lead: 'Hardware AES-256-GCM', detail: 'Military-grade encryption for access tokens and credentials' },
        { lead: 'OpenAPI REST v1 Endpoints', detail: 'Interactive Swagger documentation ready at /api/docs' },
        { lead: 'HMAC Webhook Signatures', detail: 'Cryptographically verified real-time event callbacks' },
        { lead: 'Transactional Skip-Locked', detail: 'PostgreSQL FOR UPDATE SKIP LOCKED prevents duplicate sends' },
        { lead: '1,000 Concurrent VUs Tested', detail: 'Formally benchmarked with sub-500ms P95 latency' },
      ],
      previewType: 'security',
    },
  ];

  const filteredFeatures =
    activeCategory === 'all'
      ? allFeatures
      : allFeatures.filter((f) => f.category === activeCategory);

  const comparisonRows = [
    {
      feature: 'Official Meta WhatsApp Cloud API v20.0',
      convoza: true,
      legacyBsp: true,
      scrapers: false,
      note: 'Zero account ban risk, direct Meta server connection'
    },
    {
      feature: 'Embedded Signup (Go live in 2 minutes)',
      convoza: true,
      legacyBsp: true,
      scrapers: false,
      note: 'Facebook Login for Business onboarding'
    },
    {
      feature: 'Zero Message Markup (Wholesale Meta Rates)',
      convoza: true,
      legacyBsp: false,
      scrapers: false,
      note: 'Official conversation fees billed at pure cost'
    },
    {
      feature: '3-Column Shared Multi-Agent Inbox',
      convoza: true,
      legacyBsp: true,
      scrapers: false,
      note: 'Real-time WebSocket sync with private internal notes'
    },
    {
      feature: 'Strict 24-Hour Service Window Countdown',
      convoza: true,
      legacyBsp: true,
      scrapers: false,
      note: 'Prevents policy violations with template fallback'
    },
    {
      feature: 'High-Throughput Outbox (50+ msg/sec)',
      convoza: true,
      legacyBsp: false,
      scrapers: false,
      note: 'PostgreSQL SKIP LOCKED transactional queues'
    },
    {
      feature: 'Automated COD & Address Verification',
      convoza: true,
      legacyBsp: true,
      scrapers: false,
      note: 'Drastically cuts e-commerce Return-to-Origin'
    },
    {
      feature: 'Phone Number Masking for Support Agents',
      convoza: true,
      legacyBsp: true,
      scrapers: false,
      note: 'Protects proprietary customer phone numbers'
    },
    {
      feature: 'AES-256-GCM Credential Encryption',
      convoza: true,
      legacyBsp: false,
      scrapers: false,
      note: 'Hardware-grade cryptographic token security'
    },
    {
      feature: 'Interactive OpenAPI / Swagger Documentation',
      convoza: true,
      legacyBsp: false,
      scrapers: false,
      note: 'Standardized developer endpoints at /api/docs'
    }
  ];

  const faqs = [
    {
      q: 'How does CONVOZA prevent WhatsApp account bans during bulk broadcasts?',
      a: 'CONVOZA exclusively communicates through official Meta WhatsApp Business Cloud API servers. Unlike illegal web scrapers or browser extensions that Meta actively blocks, official Cloud API numbers are immune to account bans when using approved message templates and honoring opt-outs.'
    },
    {
      q: 'What is Meta Embedded Signup and how quickly can my business go live?',
      a: 'Meta Embedded Signup is an official popup dialog powered by Facebook Login for Business. It lets you register, connect, and verify your existing phone number or purchase a new one in under 2 minutes directly from the CONVOZA dashboard, with zero manual paperwork.'
    },
    {
      q: 'Can multiple customer support agents share one WhatsApp phone number?',
      a: 'Yes! CONVOZA provides a high-performance 3-Column Shared Team Inbox. Unlimited team members can collaborate on the same number, view conversation histories, assign chats, send internal notes, and use canned replies simultaneously.'
    },
    {
      q: 'Do you charge per-message commissions on top of Meta conversation rates?',
      a: 'No. CONVOZA operates on a transparent wholesale model with flat subscription pricing. Meta conversation fees (Utility, Marketing, Authentication, Service) are billed directly through your Meta Business payment method with zero added markup.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Dark Emerald Luxury Theme)               */}
      {/* ========================================================= */}
      <section className="relative bg-gradient-to-b from-[#021812] via-[#04281e] to-[#021812] py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden text-center">
        
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[480px] h-[480px] bg-teal-400/12 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Complete Feature Suite</span>
            <span className="text-emerald-500/50">•</span>
            <span className="text-emerald-400 font-normal">Official Meta Cloud API v20.0</span>
          </div>

          {/* Distinctive Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Engineered for High-Velocity <br />
            <span className="bg-gradient-to-r from-emerald-400 via-[#25D366] to-teal-300 bg-clip-text text-transparent">
              WhatsApp Growth &amp; Automation
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Everything your team needs to broadcast mass campaigns with zero ban risk, collaborate in a real-time team inbox, deploy AI workflows, and automate e-commerce revenue on official Meta infrastructure.
          </p>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Start 14-Day Free Trial</span>
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

          {/* Key Platform Proof Metrics */}
          <div className="mt-14 pt-10 border-t border-emerald-900/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">98%</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Average Open Rate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">50 msg/s</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Outbox Worker Speed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">0%</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Ban Risk (Official Meta)</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">&lt; 2 Mins</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Embedded Signup Time</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. INTERACTIVE FEATURE CATEGORY FILTER DOCK (PREMIUM)     */}
      {/* ========================================================= */}
      <section className="sticky top-[73px] z-40 py-3.5 transition-all pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          
          {/* Floating Segmented Command Capsule */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl sm:rounded-full p-1.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 max-w-full">
            <div 
              className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-1 py-0.5 sm:flex-wrap sm:justify-center"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`group relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 via-[#128C7E] to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-white/30 transform scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/90'
                    }`}
                  >
                    {cat.icon && (
                      <span className={`transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600 group-hover:scale-110'}`}>
                        {cat.icon}
                      </span>
                    )}
                    <span>{cat.label}</span>
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse ml-0.5" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contextual Filter Feedback Pill (Only visible when a specific category is filtered) */}
          {activeCategory !== 'all' && (
            <div className="pointer-events-auto mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-emerald-200/90 text-emerald-900 text-xs font-semibold shadow-xs backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Filtering: <strong className="text-emerald-950">{categories.find(c => c.id === activeCategory)?.label}</strong></span>
              <button
                onClick={() => setActiveCategory('all')}
                className="ml-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 hover:bg-emerald-200/90 text-emerald-800 text-[11px] font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show All (6)</span>
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. CORE FEATURE CARDS SHOWCASE (Scroll-Revealed Boxes)    */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-16">
          {filteredFeatures.map((feature, idx) => (
            <FeatureBox
              key={feature.category + idx}
              feature={feature}
              idx={idx}
              isEven={idx % 2 === 0}
            />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. COMPARISON MATRIX (CONVOZA vs Legacy BSPs vs Scrapers) */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#128C7E]" />
            <span>Competitive Architectural Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Modern Brands Choose CONVOZA
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Compare official Meta infrastructure capabilities side-by-side against alternatives.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-black uppercase tracking-wider text-slate-700">
                <th className="p-5 sm:p-6">Feature &amp; Capability</th>
                <th className="p-5 sm:p-6 text-emerald-800 bg-emerald-50/60 font-black border-x border-emerald-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>CONVOZA (Official)</span>
                  </div>
                </th>
                <th className="p-5 sm:p-6 text-slate-600">Legacy BSP Tools</th>
                <th className="p-5 sm:p-6 text-rose-700">Unofficial QR Scrapers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {comparisonRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 sm:p-6 font-bold text-slate-900">
                    <div>{row.feature}</div>
                    <div className="text-xs text-slate-400 font-normal mt-0.5">{row.note}</div>
                  </td>
                  <td className="p-5 sm:p-6 bg-emerald-50/30 border-x border-emerald-100/60 font-bold text-emerald-700">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Included</span>
                    </div>
                  </td>
                  <td className="p-5 sm:p-6 text-slate-600">
                    {row.legacyBsp ? (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Check className="w-4 h-4 text-slate-500" />
                        <span>Included</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">Limited / Add-on</span>
                    )}
                  </td>
                  <td className="p-5 sm:p-6 text-rose-600">
                    <div className="flex items-center gap-2 text-rose-500 font-medium">
                      <span>&times; Not supported</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE HOVER-TO-OPEN FAQ ACCORDION                */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#128C7E]" />
            <span>Clear Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Hover over any question to expand instant answers about Meta APIs and CONVOZA.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => {
            const isOpen = openFaq === fIdx;
            return (
              <div
                key={fIdx}
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
                        isOpen
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {faq.q}
                    </span>
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
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. HIGH-CONVERTING BOTTOM CALL-TO-ACTION                  */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-[36px] bg-gradient-to-br from-[#021812] via-[#04281e] to-[#01140e] p-10 sm:p-14 lg:p-16 text-center text-white overflow-hidden shadow-2xl border border-emerald-500/30">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-6">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Meta Cloud API Activation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready to Scale Your WhatsApp Operations with Zero Ban Risk?
            </h2>

            <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join high-growth e-commerce brands, healthcare providers, and retail teams automating millions of WhatsApp conversations.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Start 14-Day Free Trial</span>
              </Link>
              <Link
                href="/contact"
                className="px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-base border border-white/20 transition-all cursor-pointer"
              >
                <span>Talk with an Expert</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Zero message markup</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Cancel anytime in 1 click</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

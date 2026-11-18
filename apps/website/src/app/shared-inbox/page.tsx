'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Users,
  Clock,
  ShieldCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Sparkles,
  CheckCheck,
  MessageSquare,
  Lock,
  Headphones,
  SlidersHorizontal,
  Send,
  UserCheck,
  AlertCircle,
  Tag,
  Paperclip,
  Smile,
  Search,
  Filter,
  Phone
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

export default function SharedInboxPage() {
  const [activeQueue, setActiveQueue] = useState<'all' | 'mine' | 'vip'>('all');
  const [selectedChat, setSelectedChat] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const chatList = [
    {
      id: 1,
      name: 'Sarah Miller',
      phone: '+91 •••• ••0001',
      preview: 'Could you confirm when order #ESS-4912 will arrive?',
      time: '2m ago',
      unread: 1,
      tag: 'VIP Customer',
      assigned: 'Alex (Support)',
      window: '21h 14m',
      ltv: '₹34,500',
      city: 'Mumbai',
    },
    {
      id: 2,
      name: 'Rajesh Patel',
      phone: '+91 •••• ••8812',
      preview: 'Address updated successfully! Dispatched via Bluedart...',
      time: '14m ago',
      unread: 0,
      tag: 'Order Support',
      assigned: 'Priya (Tier 2)',
      window: '18h 30m',
      ltv: '₹12,400',
      city: 'Ahmedabad',
    },
    {
      id: 3,
      name: 'Anita Desai',
      phone: '+91 •••• ••4490',
      preview: 'Can you send the product catalog for wedding jewelry?',
      time: '1h ago',
      unread: 0,
      tag: 'High Intent Lead',
      assigned: 'Sneha (Sales)',
      window: '23h 40m',
      ltv: '₹58,000',
      city: 'Delhi',
    },
  ];

  const current = chatList[selectedChat];

  const faqs = [
    {
      q: 'Can multiple team agents manage customer conversations on the same official WhatsApp number simultaneously?',
      a: 'Yes! CONVOZA is built specifically for team collaboration. Unlimited support agents can log in, answer chats, assign tickets, and leave private internal notes simultaneously on one official verified number.'
    },
    {
      q: 'How does collision prevention stop agents from sending duplicate answers?',
      a: 'When an agent clicks into a conversation or starts drafting a reply, a real-time typing indicator alerts all other team members that the thread is currently being answered, preventing duplicate or conflicting replies.'
    },
    {
      q: 'What are private internal notes and can customers see them?',
      a: 'Private internal notes are highlighted in amber within the chat thread. They are visible strictly to your internal staff to hand over context or record customer preferences, and are 100% invisible to the customer.'
    },
    {
      q: 'How does phone number masking protect our customer database?',
      a: 'Phone masking displays numbers as +91 •••• ••0001 to support representatives. Agents can message, call, and resolve issues freely without being able to export or scrape proprietary customer contact lists.'
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
            <span>Collaborative Customer Care Workspace</span>
            <span className="text-emerald-500/50">•</span>
            <span className="text-emerald-400 font-normal">Official Meta Cloud API</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            One WhatsApp Number. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-[#25D366] to-teal-300 bg-clip-text text-transparent">
              Unlimited Collaborative Agents.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Empower your support and sales team to manage thousands of incoming customer inquiries on a single official WhatsApp number with zero collision locks.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Try Shared Inbox Free</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 font-bold text-base border border-emerald-500/40 shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>View Team Seat Pricing</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <ScrollReveal delay={150}>
            <div className="mt-14 pt-10 border-t border-emerald-900/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">Unlimited</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">Multi-Agent Seats Available</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">&lt; 15s</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">Average First Response Time</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">Phone Number Privacy Masking</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">Real-Time</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">WebSocket Collision Sync</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. BESPOKE REPRESENTATION: FULL-SCALE 3-COLUMN LIVE COLLABORATIVE WORKSPACE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
              <Inbox className="w-3.5 h-3.5 text-[#128C7E]" />
              <span>Live Interactive Console</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              The 3-Column Team Customer Care Console
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Click on any conversation in the queue to preview live agent assignments, private team internal notes, and customer 360 data.
            </p>
          </div>
        </ScrollReveal>

        {/* Full-Scale 3-Column Software Interface */}
        <ScrollReveal delay={120}>
          <div className="rounded-[36px] bg-[#021812] border border-emerald-500/30 shadow-2xl text-white overflow-hidden ring-1 ring-emerald-500/20">
            
            {/* Workspace Top Navigation Bar */}
            <div className="bg-[#04281e] px-6 py-3.5 border-b border-emerald-900/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-emerald-400 font-bold ml-2">convoza_inbox // live_workspace</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">Active Agent: <strong>Alex (Support Desk)</strong></span>
              </div>
            </div>

            {/* 3-Column Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
              
              {/* PANE 1: Conversation Queues (3.5 Cols) */}
              <div className="lg:col-span-4 bg-[#031d16] border-r border-emerald-900/50 p-4 space-y-4">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-center">
                  <button
                    onClick={() => setActiveQueue('all')}
                    className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeQueue === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All (14)
                  </button>
                  <button
                    onClick={() => setActiveQueue('mine')}
                    className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeQueue === 'mine' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mine (4)
                  </button>
                  <button
                    onClick={() => setActiveQueue('vip')}
                    className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeQueue === 'vip' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    VIP (3)
                  </button>
                </div>

                <div className="space-y-2">
                  {chatList.map((chat, idx) => {
                    const isSelected = selectedChat === idx;
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(idx)}
                        className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-500/50 shadow-md'
                            : 'bg-white/5 hover:bg-white/10 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{chat.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{chat.time}</span>
                        </div>
                        <p className="text-[11.5px] text-slate-300 mt-1 truncate">{chat.preview}</p>
                        <div className="mt-2.5 flex items-center justify-between text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                            {chat.tag}
                          </span>
                          <span className="text-slate-400 font-mono">{chat.assigned}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PANE 2: Active Chat Stream & Composer (5 Cols) */}
              <div className="lg:col-span-5 bg-[#021812] border-r border-emerald-900/50 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3.5 border-b border-emerald-900/60">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{current.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          {current.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{current.phone} (Masked)</div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{current.window} window</span>
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 font-sans text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed max-w-[90%]">
                      &ldquo;{current.preview}&rdquo;
                      <div className="text-[9px] text-slate-400 text-right mt-1 font-mono">10:42 AM</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 leading-relaxed max-w-[90%] ml-auto">
                      <div className="text-[10px] text-emerald-400 font-bold mb-1">Alex (Support Specialist):</div>
                      <p>&ldquo;Hello {current.name}! Your order has been scheduled for priority delivery with Bluedart today before 5 PM! 📦&rdquo;</p>
                      <div className="text-[9px] text-emerald-300 text-right mt-1 font-mono flex items-center justify-end gap-1">
                        <span>10:43 AM</span>
                        <CheckCheck className="w-3 h-3 text-blue-400" />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Internal Private Note (Visible only to team):</span>
                      </div>
                      <p className="text-amber-200 text-[10.5px] leading-snug">
                        @Alex Customer is a VIP Gold member. Priority shipping voucher applied to ticket #491.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10.5px] text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Agent Priya is viewing this thread • Collision Protection Active</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-emerald-900/60 space-y-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-slate-300">
                    <span className="text-slate-500">Fast Replies:</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">/tracking</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">/refund</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">/catalog</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>Type a message or &apos;/&apos; for canned replies...</span>
                    <button className="px-3 py-1 rounded-lg bg-[#25D366] text-slate-950 font-bold text-xs">
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* PANE 3: Customer 360 & Privacy Sentinel (3.5 Cols) */}
              <div className="lg:col-span-3 bg-[#031d16] p-5 space-y-5">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Customer 360 Profile
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Customer Name</span>
                      <span className="font-bold text-white text-sm">{current.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Lifetime Value</span>
                      <span className="font-mono text-emerald-400 font-bold">{current.ltv}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">City</span>
                      <span className="text-white font-medium">{current.city}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Data Security Sentinel
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Phone Masking Active</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Raw customer phone numbers are encrypted. Support staff can communicate seamlessly without data leak risks.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <button className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-colors">
                    Reassign to Department
                  </button>
                  <button className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition-colors">
                    Trigger Meta Template
                  </button>
                </div>
              </div>

            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* 3. HOVER-TO-OPEN FAQ ACCORDION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-[#128C7E]" />
              <span>Shared Inbox FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Hover over any question to expand details about CONVOZA Shared Team Inbox.
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

      {/* 4. BOTTOM CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <ScrollReveal delay={100}>
          <div className="relative rounded-[36px] bg-gradient-to-br from-[#021812] via-[#04281e] to-[#01140e] p-10 sm:p-14 lg:p-16 text-center text-white overflow-hidden shadow-2xl border border-emerald-500/30">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-3xl mx-auto relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Transform Your WhatsApp Customer Care Today
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
                Empower your support team to answer faster, collaborate seamlessly, and safeguard customer data on one official number.
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

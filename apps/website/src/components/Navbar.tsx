'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { WhatsAppIcon } from './WhatsAppIcon';
import {
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Workflow,
  Send,
  FileSpreadsheet,
  Inbox,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [loggedUser, setLoggedUser] = useState<{ name?: string; email?: string; isSuperAdmin?: boolean } | null>(null);
  const [dashboardHref, setDashboardHref] = useState('/dashboard');
  const [adminHref, setAdminHref] = useState('/admin');
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('convoza_access_token');
      const rawUser = localStorage.getItem('convoza_user');
      if (token && rawUser) {
        setLoggedUser(JSON.parse(rawUser));
      }
      if (window.location.port === '3000') {
        setDashboardHref(`${window.location.protocol}//${window.location.hostname}:3001/dashboard`);
        setAdminHref(`${window.location.protocol}//${window.location.hostname}:3002/admin`);
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('convoza_access_token');
    localStorage.removeItem('convoza_refresh_token');
    localStorage.removeItem('convoza_user');
    localStorage.removeItem('convoza_org_id');
    localStorage.removeItem('convoza_org_name');
    setLoggedUser(null);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSolutionsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setSolutionsOpen(false);
    }, 180);
  };

  const solutions = [
    {
      title: 'WhatsApp Automation',
      desc: 'Auto-replies, keyword triggers & bot workflows',
      href: '/whatsapp-automation',
      badge: '24/7 AI',
      icon: <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Bulk Campaigns',
      desc: 'High-throughput mass broadcasts with zero bans',
      href: '/bulk-messaging',
      badge: '50 msg/s',
      icon: <Send className="w-4 h-4 text-teal-400" />,
      iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
    },
    {
      title: 'Template Builder',
      desc: 'Interactive buttons, OTPs & media templates',
      href: '/templates',
      badge: 'Meta Sync',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-300" />,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    },
    {
      title: 'Shared Team Inbox',
      desc: 'Multi-agent live chat, routing & private notes',
      href: '/shared-inbox',
      badge: 'Multi-Agent',
      icon: <Inbox className="w-4 h-4 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#031d16]/95 backdrop-blur-md border-b border-emerald-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform font-bold">
              <WhatsAppIcon className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">CONVOZA</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80 uppercase tracking-wider">
                Official Cloud API
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/features"
              className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
            >
              Features
            </Link>

            {/* Solutions Dropdown Menu */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setSolutionsOpen(!solutionsOpen)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors py-2 cursor-pointer group"
              >
                <span>Solutions</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:text-emerald-400 ${
                    solutionsOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {/* Invisible Bridge & Luxury Floating Mega-Popup */}
              <div
                className={`absolute top-full left-0 pt-2 w-96 transition-all duration-200 transform ${
                  solutionsOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                    : 'opacity-0 -translate-y-2 pointer-events-none invisible'
                }`}
              >
                <div className="bg-[#031d16]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_25px_rgba(18,140,126,0.2)] ring-1 ring-emerald-500/20 space-y-1">
                  
                  {solutions.map((item, sIdx) => (
                    <Link
                      key={sIdx}
                      href={item.href}
                      onClick={() => setSolutionsOpen(false)}
                      className="group/item flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-emerald-500/30 hover:bg-emerald-950/60 transition-all duration-200"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover/item:scale-110 shadow-xs ${item.iconBg}`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs group-hover/item:text-emerald-300 transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-1 group-hover/item:text-slate-300">
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover/item:text-emerald-400 group-hover/item:translate-x-0.5 transition-all shrink-0 mt-2.5 opacity-0 group-hover/item:opacity-100" />
                    </Link>
                  ))}

                  {/* Dropdown Footer */}
                  <div className="pt-2 mt-1 border-t border-emerald-900/50 px-2 flex items-center justify-between text-[11px]">
                    <Link
                      href="/features"
                      onClick={() => setSolutionsOpen(false)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Explore Complete Feature Suite</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <span className="text-slate-500 text-[10px] font-mono">Meta API v20.0</span>
                  </div>

                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/api-docs"
              className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/contact"
              className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
            >
              Help
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loggedUser ? (
              <>
                {loggedUser.isSuperAdmin && (
                  <a
                    href={adminHref}
                    className="text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 px-3 py-2 rounded-lg hover:bg-rose-900/60 transition-colors"
                  >
                    Root Admin
                  </a>
                )}
                <a
                  href={dashboardHref}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2.5 rounded-lg shadow-md shadow-emerald-500/25 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  title={`Sign out (${loggedUser.email || ''})`}
                  className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/60 border border-emerald-900/60 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-200 hover:text-white px-3.5 py-2 rounded-lg hover:bg-emerald-950/40 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-5 py-2.5 rounded-lg shadow-md shadow-emerald-500/25 hover:shadow-lg transition-all"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#031d16] border-b border-emerald-900/80 px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-200 hover:bg-emerald-950/60 rounded-lg"
          >
            Features
          </Link>
          <div className="pl-2 space-y-1 border-l-2 border-emerald-500/30 my-2">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-3 py-1">
              Solutions
            </div>
            {solutions.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-emerald-950/60 rounded-lg"
              >
                <span>{item.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  {item.badge}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-200 hover:bg-emerald-950/60 rounded-lg"
          >
            Pricing
          </Link>
          <Link
            href="/api-docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-200 hover:bg-emerald-950/60 rounded-lg"
          >
            API Docs
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-200 hover:bg-emerald-950/60 rounded-lg"
          >
            Contact & Support
          </Link>
          <div className="pt-4 border-t border-emerald-900/60 flex flex-col gap-2">
            {loggedUser ? (
              <>
                <a
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-slate-950 font-bold rounded-lg bg-emerald-400 shadow-md"
                >
                  Open Dashboard →
                </a>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 text-slate-200 font-semibold rounded-lg bg-emerald-950/60 border border-emerald-800/50"
                >
                  Sign Out ({loggedUser.name || loggedUser.email})
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-slate-200 font-semibold rounded-lg bg-emerald-950/60 border border-emerald-800/50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-slate-950 font-bold rounded-lg bg-emerald-400 shadow-md"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Tag,
  FileText,
  FileCode2,
  Paperclip,
  Check,
  AlertCircle,
  MoreVertical,
  Smile,
  ShieldCheck,
  CheckCheck,
  User,
  ShoppingBag,
  CreditCard,
  Plus,
  Sparkles,
  ChevronLeft,
  X,
} from 'lucide-react';
import io from 'socket.io-client';
import { WhatsAppIcon } from '@convoza/ui';
import { apiFetch, getApiOrigin } from '../../../lib/api';

export default function SharedInboxPage() {
  const [conversations, setConversations] = useState([
    {
      id: 'conv-1',
      contactId: 'c1',
      contact: {
        name: 'Sarah Miller',
        phone: '+91 98765 40001',
        email: 'sarah.m@apexretail.com',
        tags: ['VIP Customer', 'High Value', 'Apparel'],
        ltv: '₹42,500',
        orders: 6,
        city: 'Mumbai, IN',
      },
      status: 'OPEN',
      unreadCount: 1,
      lastMessagePreview: 'Could you confirm when order #APX-4912 will be delivered?',
      lastMessageAt: '10:14 AM',
      isWindowActive: true,
      windowExpiresIn: '18h left',
      assignedAgent: { name: 'Alex Vance' },
    },
    {
      id: 'conv-2',
      contactId: 'c2',
      contact: {
        name: 'Rohan Sharma',
        phone: '+91 98765 40002',
        email: 'rohan.s@example.com',
        tags: ['Festive Buyer'],
        ltv: '₹12,400',
        orders: 2,
        city: 'Delhi, IN',
      },
      status: 'OPEN',
      unreadCount: 0,
      lastMessagePreview: 'Thanks! The coupon worked seamlessly on checkout.',
      lastMessageAt: 'Yesterday',
      isWindowActive: false,
      windowExpiresIn: 'Window Closed',
      assignedAgent: null,
    },
    {
      id: 'conv-3',
      contactId: 'c3',
      contact: {
        name: 'Elena Rostova',
        phone: '+91 98765 40003',
        email: 'elena.r@example.com',
        tags: ['VIP Customer', 'International'],
        ltv: '₹89,200',
        orders: 11,
        city: 'Bengaluru, IN',
      },
      status: 'RESOLVED',
      unreadCount: 0,
      lastMessagePreview: 'Perfect, got the tracking number. Thank you!',
      lastMessageAt: 'Nov 14',
      isWindowActive: false,
      windowExpiresIn: 'Window Closed',
      assignedAgent: { name: 'Alex Vance' },
    },
  ]);

  const [selectedConvId, setSelectedConvId] = useState('conv-1');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ASSIGNED_ME' | 'ACTIVE_24H' | 'RESOLVED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected conversation message thread
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'm1',
      direction: 'INBOUND',
      body: 'Hi there! Could you confirm when order #APX-4912 will be delivered?',
      time: '10:14 AM',
      status: 'DELIVERED',
    },
    {
      id: 'm2',
      direction: 'OUTBOUND',
      body: 'Hello Sarah! I checked with our logistics desk. Your package #APX-4912 has been handed over to BlueDart express and will arrive tomorrow before 1:00 PM.',
      time: '10:16 AM',
      status: 'READ',
    },
  ]);

  const [replyText, setReplyText] = useState('');
  const [internalNotes, setInternalNotes] = useState([
    { id: 'n1', author: 'Alex Vance', content: 'Customer verified order APX-4912 with BlueDart tracking AW-891041.', date: '10:15 AM' },
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  // Quick reply suggestions
  const quickReplies = [
    'Your package is scheduled for delivery tomorrow.',
    'Thank you for contacting Apex Retail!',
    'Here is your live tracking link: https://apexretail.com/track',
    'Would you like me to connect you with billing support?',
  ];

  // Load live conversations + Socket.IO real-time connection
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
    if (token) {
      apiFetch<{ items: any[] }>('/inbox/conversations?limit=50')
        .then((res) => {
          const items = res?.items || [];
          if (items.length > 0) {
            const mapped = items.map((c: any) => ({
              id: c.id,
              contactId: c.contactId,
              contact: {
                name: c.contact?.name || c.contact?.phone || 'WhatsApp User',
                phone: c.contact?.phone || '',
                email: c.contact?.email || '',
                tags: (c.contact?.tags || []).map((t: any) => t.name || t),
                ltv: '—',
                orders: 0,
                city: 'WhatsApp Cloud',
              },
              status: c.status,
              unreadCount: c.unreadCount || 0,
              lastMessagePreview: c.lastMessagePreview || '',
              lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              isWindowActive: Boolean(c.isWindowActive),
              windowExpiresIn: c.isWindowActive ? 'Active 24h Window' : 'Window Closed',
              assignedAgent: c.assignedAgent || null,
            }));
            setConversations(mapped);
            setSelectedConvId((prev) => (mapped.some((m: any) => m.id === prev) ? prev : mapped[0].id));
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
    if (token && selectedConvId && !selectedConvId.startsWith('conv-')) {
      apiFetch<{ items: any[] }>(`/inbox/conversations/${selectedConvId}/messages?limit=50`)
        .then((res) => {
          const items = res?.items || [];
          setMessages(
            items.map((m: any) => ({
              id: m.id,
              direction: m.direction,
              body: m.body || '',
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              status: m.status,
            }))
          );
        })
        .catch(() => {});
    }

    try {
      const socket = io(`${getApiOrigin()}/inbox`, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('message:new', (msg) => {
        if (msg.conversationId === selectedConvId) {
          setMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              direction: msg.direction,
              body: msg.body,
              time: 'Just now',
              status: msg.status,
            },
          ]);
        }
      });

      return () => {
        socket.disconnect();
      };
    } catch {}
  }, [selectedConvId]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      direction: 'OUTBOUND',
      body: replyText,
      time: 'Just now',
      status: 'SENT',
    };

    setMessages([...messages, newMsg]);
    setReplyText('');

    apiFetch(`/inbox/conversations/${selectedConvId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ type: 'TEXT', body: newMsg.body }),
    }).catch(console.error);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setInternalNotes([
      { id: `n_${Date.now()}`, author: 'Alex Vance', content: newNoteText, date: 'Just now' },
      ...internalNotes,
    ]);
    setNewNoteText('');
  };

  const filteredConversations = conversations.filter((c) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      c.contact.name.toLowerCase().includes(s) ||
      c.contact.phone.includes(s) ||
      c.lastMessagePreview.toLowerCase().includes(s);

    if (!matchesSearch) return false;
    if (filter === 'UNREAD') return c.unreadCount > 0;
    if (filter === 'ACTIVE_24H') return c.isWindowActive;
    if (filter === 'ASSIGNED_ME') return c.assignedAgent?.name === 'Alex Vance';
    if (filter === 'RESOLVED') return c.status === 'RESOLVED';
    return true;
  });

  const renderCRMContent = () => (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Customer Profile
          </h3>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Opted-In
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Name</span>
            <span className="font-bold text-slate-900 block text-sm">{activeConv.contact.name}</span>
            <span className="font-mono text-slate-600 block">{activeConv.contact.phone}</span>
            <span className="text-slate-500 block">{activeConv.contact.email}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Lifetime Value</span>
              <span className="font-black text-slate-900 block text-sm mt-0.5">{activeConv.contact.ltv}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Orders Placed</span>
              <span className="font-black text-slate-900 block text-sm mt-0.5">{activeConv.contact.orders} Orders</span>
            </div>
          </div>

          {/* Audience Tags */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Segment Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeConv.contact.tags.map((t, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Agent */}
      <div className="pt-4 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Ticket Assignment
        </label>
        <select className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-semibold text-slate-800">
          <option>Alex Vance (You)</option>
          <option>Devon Lee (Senior Support)</option>
          <option>Priya Verma (Sales Agent)</option>
          <option>Unassigned</option>
        </select>
      </div>

      {/* Internal Team Notes */}
      <div className="pt-4 border-t border-slate-100 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Internal Team Notes
          </h3>
          <span className="text-[10px] text-slate-400">Private to agents</span>
        </div>

        <form onSubmit={handleAddNote} className="mb-4">
          <textarea
            rows={2}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Add private note for fellow agents..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
          >
            Post Internal Note
          </button>
        </form>

        <div className="space-y-2.5 overflow-y-auto">
          {internalNotes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs space-y-1"
            >
              <div className="flex justify-between items-center text-[10px] text-amber-800 font-bold">
                <span>{note.author}</span>
                <span className="text-amber-600 font-normal">{note.date}</span>
              </div>
              <p className="text-slate-800 leading-relaxed text-[11px]">{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-8.5rem)] bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex relative">
      {/* COLUMN 1: Conversations List (Width: 340px on desktop, full width on mobile list view) */}
      <div
        className={`w-full md:w-80 lg:w-[340px] border-r border-slate-200/80 flex-col shrink-0 bg-white ${
          mobileView === 'list' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Inbox Header */}
        <div className="p-4 border-b border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Shared Team Inbox</h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Multi-Agent
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by contact or message..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 text-[10px] font-bold overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filter === 'UNREAD' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('ACTIVE_24H')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filter === 'ACTIVE_24H' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              24h Active
            </button>
            <button
              onClick={() => setFilter('ASSIGNED_ME')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filter === 'ASSIGNED_ME' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Mine
            </button>
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConvId;
            return (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConvId(conv.id);
                  setMobileView('chat');
                }}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-50/70 border-l-4 border-emerald-600'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {conv.contact.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{conv.contact.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{conv.contact.phone}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{conv.lastMessageAt}</span>
                </div>

                <p className="text-xs text-slate-600 truncate mt-2 leading-relaxed">
                  {conv.lastMessagePreview}
                </p>

                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {conv.isWindowActive ? (
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {conv.windowExpiresIn}
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Template Only
                      </span>
                    )}
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2: Message Thread & Composer (Flex-1) */}
      <div
        className={`flex-1 flex-col bg-[#ECE5DD] border-r border-slate-200/80 relative min-w-0 ${
          mobileView === 'chat' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Chat Header */}
        <div className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              aria-label="Back to conversations list"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
              {activeConv.contact.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 truncate">{activeConv.contact.name}</h2>
                <svg className="w-3.5 h-3.5 text-emerald-500 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
                {activeConv.contact.phone} <span className="hidden sm:inline">• {activeConv.contact.city}</span>
              </p>
            </div>
          </div>

          {/* 24h Customer Service Window Indicator & Mobile Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center">
              {activeConv.isWindowActive ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  24h Session Active
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-bold shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Window Closed
                </div>
              )}
            </div>

            <button
              onClick={() => alert('Conversation marked as resolved.')}
              className="px-2.5 sm:px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              Resolve
            </button>

            {/* Mobile / Tablet CRM Profile Button */}
            <button
              type="button"
              onClick={() => setShowMobileProfile(!showMobileProfile)}
              className="xl:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              aria-label="Toggle CRM Customer Details"
              title="Customer CRM Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WhatsApp Background Chat Stream */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{
            backgroundImage: `radial-gradient(#d3c9bf 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            backgroundColor: '#ECE5DD',
          }}
        >
          {/* Security Notice */}
          <div className="mx-auto bg-amber-50/90 text-amber-900 border border-amber-200/80 rounded-xl px-3 py-1.5 text-[11px] text-center max-w-sm shadow-xs leading-relaxed flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Customer verified via Meta Cloud API. Chat logs are synchronized.</span>
          </div>

          {messages.map((m) => {
            const isOut = m.direction === 'OUTBOUND';
            return (
              <div key={m.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed ${
                    isOut
                      ? 'bg-[#E7FFDB] text-slate-900 rounded-tr-none border border-emerald-900/10'
                      : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/80'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.body}</div>
                  <div className="mt-1.5 text-[10px] flex items-center justify-end gap-1 text-slate-400">
                    <span>{m.time}</span>
                    {isOut && <CheckCheck className="w-3.5 h-3.5 text-sky-500 font-bold" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Reply Chips */}
        <div className="px-4 py-2 bg-white/90 border-t border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Quick Replies:
          </span>
          {quickReplies.map((qr, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setReplyText(qr)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-200"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Composer Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSendReply} className="flex items-center gap-2.5">
            <button
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                activeConv.isWindowActive
                  ? 'Type a message to customer...'
                  : 'Customer window closed. Click Template to re-engage...'
              }
              className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" /> <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* COLUMN 3: Contact Context & Internal CRM Notes (Desktop XL) */}
      <div className="w-80 bg-white flex-col shrink-0 overflow-y-auto p-6 space-y-6 hidden xl:flex">
        {renderCRMContent()}
      </div>

      {/* Mobile / Tablet CRM Profile Slide-Over Drawer */}
      {showMobileProfile && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
          <div
            onClick={() => setShowMobileProfile(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <h3 className="text-sm font-black text-slate-900">Customer CRM Profile</h3>
              <button
                type="button"
                onClick={() => setShowMobileProfile(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Close profile drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderCRMContent()}
          </div>
        </div>
      )}
    </div>
  );
}

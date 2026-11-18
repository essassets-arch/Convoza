'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  Send,
  Check,
  AlertCircle,
  ShieldCheck,
  CheckCheck,
  User,
  Plus,
  ChevronLeft,
  X,
  RefreshCw,
  Loader2,
  Inbox as InboxIcon,
} from 'lucide-react';
import io from 'socket.io-client';
import { apiFetch, getApiOrigin } from '../../../lib/api';

interface UiConversation {
  id: string;
  contactId: string;
  phoneNumberId: string;
  contact: {
    name: string;
    phone: string;
    email: string;
    tags: string[];
  };
  status: string;
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageAt: string;
  isWindowActive: boolean;
  assignedAgent: { id?: string; name: string } | null;
}

function mapApiConv(c: any): UiConversation {
  const isWin =
    c.isWindowActive !== undefined
      ? Boolean(c.isWindowActive)
      : Boolean(c.customerWindowExpiresAt && new Date(c.customerWindowExpiresAt) > new Date());

  return {
    id: c.id,
    contactId: c.contactId,
    phoneNumberId: c.phoneNumberId || '',
    contact: {
      name: c.contact?.name || c.contact?.phone || 'WhatsApp User',
      phone: c.contact?.phone || '',
      email: c.contact?.email || '',
      tags: Array.isArray(c.contact?.tags)
        ? c.contact.tags.map((t: any) => (typeof t === 'string' ? t : t?.name || '')).filter(Boolean)
        : [],
    },
    status: c.status || 'OPEN',
    unreadCount: c.unreadCount || 0,
    lastMessagePreview: c.lastMessagePreview || '',
    lastMessageAt: c.lastMessageAt
      ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    isWindowActive: isWin,
    assignedAgent: c.assignedAgent || null,
  };
}

export default function SharedInboxPage() {
  const [conversations, setConversations] = useState<UiConversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ACTIVE_24H' | 'RESOLVED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const selectedIdRef = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedIdRef.current = selectedConvId;
  }, [selectedConvId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await apiFetch<{ items: any[] }>('/inbox/conversations?page=1&limit=100');
      const raw = Array.isArray(res) ? res : res?.items || [];
      const items = raw.map(mapApiConv);
      setConversations(items);
      if (items.length > 0 && (!selectedIdRef.current || !items.some((i) => i.id === selectedIdRef.current))) {
        selectedIdRef.current = items[0].id;
        setSelectedConvId(items[0].id);
      }
    } catch {
      // Unauthenticated or empty
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadConversationDetail = useCallback(async (convId: string) => {
    if (!convId) return;
    setReplyError(null);
    setMessagesError(null);
    setLoadingMessages(true);
    try {
      const encodedId = encodeURIComponent(convId);
      const [detailOutcome, msgOutcome] = await Promise.allSettled([
        apiFetch<any>(`/inbox/conversations/${encodedId}`),
        apiFetch<{ items: any[] }>(`/inbox/conversations/${encodedId}/messages?page=1&limit=100`),
      ]);

      // Ignore stale response if user already switched to another conversation
      if (selectedIdRef.current && selectedIdRef.current !== convId) {
        return;
      }

      if (msgOutcome.status === 'fulfilled') {
        const msgRes: any = msgOutcome.value;
        const rawMessages = Array.isArray(msgRes)
          ? msgRes
          : Array.isArray(msgRes?.items)
          ? msgRes.items
          : [];

        const msgItems = rawMessages.map((m: any) => ({
          id: m.id,
          direction: m.direction,
          type: m.type || 'TEXT',
          templateName: m.template?.name || null,
          body: m.body || (m.template?.name ? `[Template: ${m.template.name}]` : ''),
          time: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
          status: m.status,
          errorMessage: m.errorMessage,
        }));
        setMessages(msgItems);
        scrollToBottom();
      } else {
        setMessagesError(msgOutcome.reason?.message || 'Unable to load message history');
      }

      if (detailOutcome.status === 'fulfilled') {
        const detail = detailOutcome.value;
        const notes = (detail?.notes || []).map((n: any) => ({
          id: n.id,
          author: n.user?.name || 'Agent',
          content: n.content,
          date: n.createdAt
            ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
        }));
        setInternalNotes(notes);

        // Sync unread badge, status, and 24h window locally
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  unreadCount: 0,
                  status: detail?.status || c.status,
                  isWindowActive:
                    detail?.isWindowActive !== undefined ? Boolean(detail.isWindowActive) : c.isWindowActive,
                }
              : c
          )
        );
      }
    } finally {
      if (!selectedIdRef.current || selectedIdRef.current === convId) {
        setLoadingMessages(false);
      }
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConvId) {
      loadConversationDetail(selectedConvId);
    }
  }, [selectedConvId, loadConversationDetail]);

  // Persistent Real-Time Socket.IO Connection (WhatsApp Web Live Sync)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('convoza_access_token') : null;
    if (!token) return;

    const socket = io(`${getApiOrigin()}/inbox`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('conversation:update', (updatedConv: any) => {
      const mapped = mapApiConv(updatedConv);
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === mapped.id);
        if (exists) {
          const updatedList = prev.map((c) =>
            c.id === mapped.id
              ? {
                  ...c,
                  ...mapped,
                  contact: mapped.contact.phone ? mapped.contact : c.contact,
                  unreadCount: selectedIdRef.current === mapped.id ? 0 : mapped.unreadCount,
                }
              : c
          );
          // Move updated conversation to top
          const target = updatedList.find((c) => c.id === mapped.id)!;
          return [target, ...updatedList.filter((c) => c.id !== mapped.id)];
        }
        if (!selectedIdRef.current) {
          setSelectedConvId(mapped.id);
        }
        return [mapped, ...prev];
      });
    });

    socket.on('message:new', (msg: any) => {
      if (msg.conversationId === selectedIdRef.current) {
        setMessages((prev) => {
          if (prev.some((p) => p.id === msg.id)) return prev;
          return [
            ...prev,
            {
              id: msg.id,
              direction: msg.direction,
              body: msg.body || '',
              time: 'Just now',
              status: msg.status || 'DELIVERED',
            },
          ];
        });
        scrollToBottom();
      } else {
        // Ensure conversation list reflects new message even if conversation:update arrived first/after
        loadConversations();
      }
    });

    socket.on('message:status', (evt: any) => {
      if (evt.conversationId === selectedIdRef.current) {
        setMessages((prev) =>
          prev.map((m) => (m.id === evt.messageId ? { ...m, status: evt.status } : m))
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [loadConversations]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;

  const quickReplies = [
    'Hello! How can we help you today?',
    'Thank you for reaching out! Checking this for you right now.',
    'Your request has been processed.',
  ];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    const textToSend = replyText.trim();
    setSendingReply(true);
    setReplyError(null);
    setReplyText('');

    try {
      const sent = await apiFetch(`/inbox/conversations/${activeConv.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ type: 'TEXT', body: textToSend }),
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [
          ...prev,
          {
            id: sent.id,
            direction: 'OUTBOUND',
            body: textToSend,
            time: 'Just now',
            status: sent.status || 'SENT',
          },
        ];
      });
      scrollToBottom();
    } catch (err: any) {
      setReplyText(textToSend);
      setReplyError(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleResolve = async () => {
    if (!activeConv) return;
    const nextStatus = activeConv.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
    try {
      await apiFetch(`/inbox/conversations/${activeConv.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ status: nextStatus }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConv.id ? { ...c, status: nextStatus } : c))
      );
    } catch {}
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeConv) return;

    const content = newNoteText.trim();
    setNewNoteText('');
    try {
      const created = await apiFetch(`/inbox/conversations/${activeConv.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setInternalNotes((prev) => [
        {
          id: created.id || `n_${Date.now()}`,
          author: created.user?.name || 'You',
          content,
          date: 'Just now',
        },
        ...prev,
      ]);
    } catch {}
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
    if (filter === 'RESOLVED') return c.status === 'RESOLVED';
    return true;
  });

  const renderStatusTicks = (status?: string) => {
    if (status === 'READ') return <CheckCheck className="w-3.5 h-3.5 text-sky-500" />;
    if (status === 'DELIVERED') return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
    if (status === 'FAILED') return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
    return <Check className="w-3.5 h-3.5 text-slate-400" />;
  };

  const renderCRMContent = () => {
    if (!activeConv) return null;
    return (
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
              <span className="text-slate-400 block text-[10px] uppercase font-bold">WhatsApp Contact</span>
              <span className="font-bold text-slate-900 block text-sm">{activeConv.contact.name}</span>
              <span className="font-mono text-slate-600 block">{activeConv.contact.phone}</span>
              {activeConv.contact.email && (
                <span className="text-slate-500 block">{activeConv.contact.email}</span>
              )}
            </div>

            {activeConv.contact.tags.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Tags
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
            )}
          </div>
        </div>

        {/* Internal Team Notes */}
        <div className="pt-4 border-t border-slate-100 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Internal Team Notes
            </h3>
            <span className="text-[10px] text-slate-400">Private to team</span>
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
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-8.5rem)] bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex relative">
      {/* COLUMN 1: Conversations List */}
      <div
        className={`w-full md:w-80 lg:w-[340px] border-r border-slate-200/80 flex-col shrink-0 bg-white ${
          mobileView === 'list' ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="p-4 border-b border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Live WhatsApp Inbox</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  socketConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {socketConnected ? 'Live' : 'Sync'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={loadConversations}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Refresh chats"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/dashboard/messages"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                title="Start new outbound chat"
              >
                <Plus className="w-3 h-3" /> New
              </Link>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search phone, name or text..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 text-[10px] font-bold overflow-x-auto pb-1">
            {(['ALL', 'UNREAD', 'ACTIVE_24H', 'RESOLVED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'ACTIVE_24H' ? '24h Open' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingList && conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading live chats...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <InboxIcon className="w-9 h-9 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-800">No Live Conversations Yet</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                As soon as a customer messages your connected WhatsApp Business number (or you dispatch a message), their chat appears here instantly in real time.
              </p>
              <Link
                href="/dashboard/messages"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" /> Start First Chat
              </Link>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    setMobileView('chat');
                  }}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {conv.contact.name.replace(/[^\w]/g, '').slice(0, 2).toUpperCase() || 'WA'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 block truncate">{conv.contact.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">{conv.contact.phone}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{conv.lastMessageAt}</span>
                  </div>

                  <p className="text-xs text-slate-600 truncate mt-2 leading-relaxed">{conv.lastMessagePreview}</p>

                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {conv.isWindowActive ? (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          24h Window Open
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Template Required
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
            })
          )}
        </div>
      </div>

      {/* COLUMN 2: Message Thread & Composer */}
      {activeConv ? (
        <div
          className={`flex-1 flex-col bg-[#ECE5DD] border-r border-slate-200/80 relative min-w-0 ${
            mobileView === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Chat Header */}
          <div className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                aria-label="Back to conversations list"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
                {activeConv.contact.name.replace(/[^\w]/g, '').slice(0, 2).toUpperCase() || 'WA'}
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 truncate">{activeConv.contact.name}</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
                  {activeConv.contact.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center">
                {activeConv.isWindowActive ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    24h Free-Reply Window Active
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-bold shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    24h Window Closed
                  </div>
                )}
              </div>

              <button
                onClick={handleToggleResolve}
                className="px-2.5 sm:px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                {activeConv.status === 'RESOLVED' ? 'Reopen' : 'Resolve'}
              </button>

              <button
                type="button"
                onClick={() => setShowMobileProfile(!showMobileProfile)}
                className="xl:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                title="Customer CRM Profile"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* WhatsApp Background Chat Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 wa-chat-canvas">
            <div className="mx-auto bg-amber-50/90 text-amber-900 border border-amber-200/80 rounded-xl px-3 py-1.5 text-[11px] text-center max-w-sm shadow-xs leading-relaxed flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Live Official Meta WhatsApp Cloud API Stream</span>
            </div>

            {loadingMessages && messages.length === 0 && (
              <div className="py-10 flex items-center justify-center gap-2 text-xs text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span>Loading conversation messages...</span>
              </div>
            )}

            {messagesError && (
              <div className="mx-auto max-w-md bg-rose-50 text-rose-800 border border-rose-200 rounded-xl px-4 py-2.5 text-xs flex items-center justify-between gap-3">
                <span>{messagesError}</span>
                <button
                  type="button"
                  onClick={() => loadConversationDetail(activeConv.id)}
                  className="font-bold underline shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {messages.map((m) => {
              const isOut = m.direction === 'OUTBOUND';
              return (
                <div key={m.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed ${
                      isOut
                        ? 'wa-bubble-out bg-[#E7FFDB] text-slate-900 rounded-tr-none border border-emerald-900/10'
                        : 'wa-bubble-in bg-white text-slate-900 rounded-tl-none border border-slate-200/80'
                    }`}
                  >
                    {m.type === 'TEMPLATE' && (
                      <div className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-600/10 px-2 py-0.5 rounded-md">
                        <span>Meta Template{m.templateName ? ` • ${m.templateName}` : ''}</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{m.body}</div>
                    {m.errorMessage && (
                      <div className="mt-1.5 text-[11px] text-rose-600 font-medium">
                        Delivery error: {m.errorMessage}
                      </div>
                    )}
                    <div className="mt-1.5 text-[10px] flex items-center justify-end gap-1 text-slate-400">
                      <span>{m.time}</span>
                      {isOut && renderStatusTicks(m.status)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {replyError && (
            <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <span>{replyError}</span>
              <Link href="/dashboard/messages" className="font-bold underline ml-2 shrink-0">
                Send Approved Template →
              </Link>
            </div>
          )}

          {/* Quick Reply Chips */}
          {activeConv.isWindowActive && (
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
          )}

          {/* Composer Bar */}
          <div className="p-3.5 bg-white border-t border-slate-200 shrink-0">
            {activeConv.isWindowActive ? (
              <form onSubmit={handleSendReply} className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a live WhatsApp reply..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Send</span>
                </button>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <span>
                  24-hour customer reply window is closed (opens automatically as soon as the customer texts you).
                </span>
                <Link
                  href="/dashboard/messages"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Re-engage with Template
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#ECE5DD]/50 p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <InboxIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900">CONVOZA Live WhatsApp Desk</h3>
          <p className="text-xs text-slate-600 max-w-md leading-relaxed">
            Connect your WhatsApp Business number and point your Meta App Webhook to Convoza. Every incoming customer message will pop up here live in real time so your team can reply instantly.
          </p>
        </div>
      )}

      {/* COLUMN 3: Contact Context & Internal CRM Notes */}
      {activeConv && (
        <div className="w-80 bg-white flex-col shrink-0 overflow-y-auto p-6 space-y-6 hidden xl:flex">
          {renderCRMContent()}
        </div>
      )}

      {/* Mobile / Tablet CRM Profile Slide-Over Drawer */}
      {showMobileProfile && activeConv && (
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

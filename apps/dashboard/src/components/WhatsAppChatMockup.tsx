import React from 'react';
import {
  ExternalLink,
  CornerDownLeft,
  PhoneCall,
  Image as ImageIcon,
  FileText,
  Video,
  CheckCheck,
  ShieldCheck,
  Phone,
  Video as VideoCallIcon,
  MoreVertical,
  ArrowLeft,
  Smile,
  Paperclip,
  Mic,
} from 'lucide-react';

export interface WhatsAppChatMockupProps {
  headerType?: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  headerText?: string;
  headerMediaUrl?: string;
  bodyText: string;
  footerText?: string;
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
  }>;
  variables?: Record<string, string>;
  time?: string;
  businessName?: string;
  verified?: boolean;
}

export const WhatsAppChatMockup: React.FC<WhatsAppChatMockupProps> = ({
  headerType = 'TEXT',
  headerText,
  headerMediaUrl,
  bodyText,
  footerText,
  buttons = [],
  variables = {},
  time = '10:14 AM',
  businessName = 'Emperor Smart Solutions',
  verified = true,
}) => {
  const renderText = (str?: string) => {
    if (!str) return '';
    return str.replace(/\{\{(\d+)\}\}/g, (match, p1) => {
      return variables[p1] !== undefined && variables[p1] !== '' ? variables[p1] : match;
    });
  };

  const initials =
    (businessName || 'Emperor Smart Solutions')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'ES';

  return (
    <div className="w-full max-w-[340px] mx-auto bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800 font-sans relative">
      {/* Phone Notch / Dynamic Island */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
      </div>

      {/* Screen Frame */}
      <div className="rounded-[2rem] overflow-hidden bg-[#ECE5DD] flex flex-col h-[520px] shadow-inner relative border border-slate-700/40">
        {/* WhatsApp Top App Bar */}
        <div className="bg-[#075E54] text-white pt-6 pb-2.5 px-3 flex items-center justify-between shadow-md shrink-0 z-10">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-emerald-200 cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-emerald-700 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
              {initials}
            </div>
            <div className="leading-tight truncate max-w-[130px]">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate">{businessName}</span>
                {verified && (
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </div>
              <span className="text-[10px] text-emerald-200 block truncate">Official Business Account</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-emerald-100">
            <VideoCallIcon className="w-3.5 h-3.5 opacity-80" />
            <Phone className="w-3.5 h-3.5 opacity-80" />
            <MoreVertical className="w-3.5 h-3.5 opacity-80" />
          </div>
        </div>

        {/* WhatsApp Chat Wallpaper Area */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-end space-y-2 wa-chat-canvas">
          {/* Encryption Notice */}
          <div className="mx-auto bg-amber-50/90 text-amber-900 border border-amber-200/80 rounded-lg px-2.5 py-1 text-[10px] text-center max-w-[240px] shadow-sm leading-tight flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Messages are end-to-end encrypted with Meta Cloud API.</span>
          </div>

          {/* WhatsApp Chat Message Bubble */}
          <div className="wa-bubble-out bg-white rounded-2xl rounded-tr-none shadow-md overflow-hidden text-slate-800 text-xs max-w-[92%] ml-auto border border-emerald-900/10">
            {/* Header Preview */}
            {headerType === 'IMAGE' && (
              <div className="h-32 bg-slate-200 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
                {headerMediaUrl ? (
                  <img src={headerMediaUrl} alt="Header" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[10px] font-medium text-slate-500">Image Header</span>
                  </>
                )}
              </div>
            )}

            {headerType === 'VIDEO' && (
              <div className="h-32 bg-slate-900 flex flex-col items-center justify-center text-white relative">
                <Video className="w-8 h-8 text-emerald-400 mb-1" />
                <span className="text-[10px] font-medium text-slate-300">Video Attachment</span>
              </div>
            )}

            {headerType === 'DOCUMENT' && (
              <div className="p-2.5 bg-slate-50 flex items-center gap-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[11px] font-bold text-slate-800 block truncate">Document_Attachment.pdf</span>
                  <span className="text-[9px] text-slate-400">PDF Document • 240 KB</span>
                </div>
              </div>
            )}

            {headerType === 'TEXT' && headerText && (
              <div className="p-3 pb-1 font-bold text-slate-900 text-xs leading-snug">
                {renderText(headerText)}
              </div>
            )}

            {/* Body Text */}
            <div className="p-3 text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap">
              {renderText(bodyText) || 'Enter body text...'}
            </div>

            {/* Footer Text */}
            {footerText && (
              <div className="px-3 pb-1 text-[9px] text-slate-400 font-medium">
                {renderText(footerText)}
              </div>
            )}

            {/* Timestamp & Double Blue Ticks */}
            <div className="px-3 pb-1.5 flex items-center justify-end gap-1 text-[9px] text-slate-400">
              <span>{time}</span>
              <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
            </div>

            {/* Interactive WhatsApp Buttons */}
            {buttons.length > 0 && (
              <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/70">
                {buttons.map((btn, idx) => (
                  <div
                    key={idx}
                    className="py-2 px-3 text-center text-[11px] font-bold text-[#00A884] flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {btn.type === 'URL' && <ExternalLink className="w-3 h-3" />}
                    {btn.type === 'QUICK_REPLY' && <CornerDownLeft className="w-3 h-3" />}
                    {btn.type === 'PHONE_NUMBER' && <PhoneCall className="w-3 h-3" />}
                    <span>{btn.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Bottom Input Bar Mockup */}
        <div className="bg-[#F0F2F5] px-2 py-2 flex items-center gap-1.5 border-t border-slate-300 shrink-0">
          <Smile className="w-4 h-4 text-slate-500 cursor-pointer" />
          <Paperclip className="w-4 h-4 text-slate-500 cursor-pointer" />
          <div className="flex-1 bg-white rounded-full px-3 py-1 text-[11px] text-slate-400 border border-slate-200 truncate">
            Type a message...
          </div>
          <div className="w-7 h-7 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-sm">
            <Mic className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

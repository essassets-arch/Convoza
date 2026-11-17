'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Loader2,
  KeyRound,
  Check,
  Copy,
  Radio,
  Sparkles,
} from 'lucide-react';
import { WhatsAppIcon } from '@convoza/ui';
import { apiFetch, getApiOrigin } from '../../../lib/api';

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export default function WhatsAppAccountsPage() {
  const [activeTab, setActiveTab] = useState<'connected' | 'connect-manual' | 'embedded-signup'>('connected');

  // Manual Form State
  const [name, setName] = useState('Emperor Smart Solutions Official');
  const [wabaId, setWabaId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedVerifyToken, setCopiedVerifyToken] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [esLaunching, setEsLaunching] = useState(false);
  const [esSession, setEsSession] = useState<{
    appId: string;
    version: string;
    configId: string;
    hostedEmbeddedSignupUrl?: string;
  } | null>(null);

  const [accounts, setAccounts] = useState<any[]>([]);

  const webhookUrl = `${getApiOrigin()}/api/v1/webhooks/meta/whatsapp`;
  const verifyToken = 'convoza_meta_verify_token_secure_2026';

  const loadAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const data = await apiFetch<any[]>('/whatsapp/accounts');
      if (Array.isArray(data)) {
        setAccounts(data);
      }
    } catch {
      // Unauthenticated or initial fallback
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
    apiFetch('/whatsapp/embedded-signup/session', { method: 'POST', body: '{}' })
      .then((sess) => setEsSession(sess))
      .catch(() => {});
  }, [loadAccounts]);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleCopyVerifyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    setCopiedVerifyToken(true);
    setTimeout(() => setCopiedVerifyToken(false), 2000);
  };

  const handleValidateManual = async () => {
    setIsValidating(true);
    setValidationResult(null);
    setMessage(null);
    setErrorMsg(null);

    try {
      const data = await apiFetch('/whatsapp/manual/validate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumberId: phoneNumberId.trim(), accessToken: accessToken.trim() }),
      });

      if (data?.isValid) {
        setValidationResult({
          success: true,
          details: data.data,
        });
      } else {
        setValidationResult({
          success: false,
          error: data?.error || 'Verification failed on Meta Graph API.',
        });
      }
    } catch (err: any) {
      setValidationResult({ success: false, error: err.message || 'API connection error' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleConnectManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setErrorMsg(null);

    try {
      await apiFetch('/whatsapp/manual/connect', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          wabaId: wabaId.trim(),
          phoneNumberId: phoneNumberId.trim(),
          accessToken: accessToken.trim(),
        }),
      });

      setMessage('WhatsApp Business Account connected, verified with Meta Graph API, and encrypted with AES-256-GCM!');
      setAccessToken('');
      setValidationResult(null);
      await loadAccounts();
      setActiveTab('connected');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect WhatsApp account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncAccount = async (accId: string) => {
    setSyncingId(accId);
    setMessage(null);
    setErrorMsg(null);
    try {
      await apiFetch(`/whatsapp/accounts/${accId}/sync`, { method: 'POST', body: '{}' });
      await loadAccounts();
      setMessage('Account quality ratings, display name, and messaging tiers synchronized live from Meta Graph API!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sync failed');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnectAccount = async (accId: string, accName: string) => {
    if (!window.confirm(`Disconnect "${accName}" from this workspace?`)) return;
    setErrorMsg(null);
    try {
      await apiFetch(`/whatsapp/accounts/${accId}`, { method: 'DELETE' });
      await loadAccounts();
      setMessage(`Disconnected "${accName}" cleanly.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to disconnect account');
    }
  };

  const loadFacebookSdk = (appId: string, version: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.FB) {
        window.FB.init({ appId, autoLogAppEvents: true, xfbml: true, version });
        resolve();
        return;
      }

      window.fbAsyncInit = function () {
        window.FB.init({
          appId,
          autoLogAppEvents: true,
          xfbml: true,
          version,
        });
        resolve();
      };

      const existing = document.getElementById('facebook-jssdk');
      if (existing) {
        setTimeout(() => (window.FB ? resolve() : reject(new Error('Facebook SDK failed to initialize'))), 1000);
        return;
      }

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Unable to load Facebook Login SDK. Check browser ad-blocker settings.'));
      document.body.appendChild(script);
    });
  };

  const handleLaunchEmbeddedSignup = async () => {
    setEsLaunching(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      const session =
        esSession ||
        (await apiFetch('/whatsapp/embedded-signup/session', {
          method: 'POST',
          body: '{}',
        }));

      // If Meta-Hosted Embedded Signup link is configured, open it directly
      if (session?.hostedEmbeddedSignupUrl) {
        window.open(session.hostedEmbeddedSignupUrl, '_blank', 'noopener,noreferrer');
        setMessage('Opened official Meta-Hosted Embedded Signup window. Once completed, click Sync to refresh your WABA.');
        setEsLaunching(false);
        return;
      }

      const appId = session?.appId || '4558736907726599';
      const version = session?.version || 'v20.0';
      await loadFacebookSdk(appId, version);

      let capturedWabaId: string | undefined;
      let capturedPhoneId: string | undefined;

      const messageListener = (event: MessageEvent) => {
        if (!event.origin.endsWith('facebook.com')) return;
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data?.type === 'WA_EMBEDDED_SIGNUP' && data?.data) {
            capturedWabaId = data.data.waba_id;
            capturedPhoneId = data.data.phone_number_id;
          }
        } catch {}
      };
      window.addEventListener('message', messageListener);

      const loginOptions: Record<string, any> = {
        extras: {
          feature: 'whatsapp_embedded_signup',
          sessionInfoVersion: 2,
        },
      };

      if (session?.configId) {
        loginOptions.config_id = session.configId;
        loginOptions.response_type = 'code';
        loginOptions.override_default_response_type = true;
      } else {
        loginOptions.scope = 'whatsapp_business_management,whatsapp_business_messaging';
      }

      window.FB.login((response: any) => {
        window.removeEventListener('message', messageListener);
        const code = response?.authResponse?.code;
        if (code) {
          apiFetch('/whatsapp/embedded-signup/callback', {
            method: 'POST',
            body: JSON.stringify({
              code,
              wabaId: capturedWabaId,
              phoneNumberId: capturedPhoneId,
            }),
          })
            .then(async () => {
              await loadAccounts();
              setMessage('WhatsApp Business Account onboarded via Meta Embedded Signup!');
              setActiveTab('connected');
            })
            .catch((err: any) => {
              setErrorMsg(err.message || 'Embedded Signup token exchange failed');
            })
            .finally(() => setEsLaunching(false));
        } else {
          setEsLaunching(false);
          setErrorMsg('Meta Embedded Signup dialog was closed before completing authorization.');
        }
      }, loginOptions);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not start Meta Embedded Signup');
      setEsLaunching(false);
    }
  };

  const totalPhones = accounts.reduce((acc, a) => acc + (a.phoneNumbers?.length || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">WhatsApp Phone Numbers</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Official WABA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect and manage official Meta WhatsApp Business Accounts (WABA), System User tokens, and webhook listeners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('embedded-signup')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Meta Embedded Signup
          </button>
          <button
            onClick={() => setActiveTab('connect-manual')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <KeyRound className="w-4 h-4" /> Manual Credentials
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Asset Health Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Registered Numbers</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalPhones} Active</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {accounts.length} Connected WABA(s)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quality Rating</div>
          <div className="mt-2 text-2xl font-black text-emerald-600 flex items-center gap-2">
            <span>{accounts[0]?.phoneNumbers?.[0]?.qualityRating || 'GREEN'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">LIVE</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Official Meta Cloud API v20.0</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Messaging Limit</div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {accounts[0]?.phoneNumbers?.[0]?.messagingLimitTier || 'TIER_1K'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Unique recipients / 24 hours</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Token Security</div>
          <div className="mt-2 text-2xl font-black text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" /> AES-256
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">GCM Authenticated Encryption</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('connected')}
          className={`pb-3.5 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'connected'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" /> Connected Numbers ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('embedded-signup')}
          className={`pb-3.5 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'embedded-signup'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" /> Meta Embedded Signup
        </button>
        <button
          onClick={() => setActiveTab('connect-manual')}
          className={`pb-3.5 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'connect-manual'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" /> Manual Meta Credentials
        </button>
      </div>

      {/* Tab 1: Connected Numbers List */}
      {activeTab === 'connected' && (
        <div className="space-y-6">
          {loadingAccounts ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading connected WhatsApp Business Accounts...</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
              <Smartphone className="w-10 h-10 text-emerald-600 mx-auto" />
              <div>
                <h3 className="text-base font-black text-slate-900">No WhatsApp Business Account Connected Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Connect your official Meta WABA using Embedded Signup or paste your WABA ID, Phone Number ID, and System User Access Token under Manual Credentials.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('connect-manual')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Connect with WABA Credentials
                </button>
                <button
                  onClick={() => setActiveTab('embedded-signup')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                >
                  Launch Embedded Signup
                </button>
              </div>
            </div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                      <WhatsAppIcon className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{acc.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {acc.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        WABA ID: <span className="font-semibold text-slate-700">{acc.wabaId}</span> • Onboarded via {acc.onboardingType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleSyncAccount(acc.id)}
                      disabled={syncingId === acc.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingId === acc.id ? 'animate-spin' : ''}`} />
                      <span>Sync with Meta</span>
                    </button>
                    <button
                      onClick={() => handleDisconnectAccount(acc.id, acc.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                      title="Disconnect WABA"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Phone Numbers Cards */}
                <div className="mt-6 space-y-4">
                  {(acc.phoneNumbers || []).map((pn: any) => (
                    <div
                      key={pn.id}
                      className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900">{pn.displayPhoneNumber}</span>
                            {pn.isDefault && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                                Primary Sender
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Verified Name: <span className="font-bold text-slate-900">{pn.verifiedName}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">Phone Number ID: {pn.phoneNumberId}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Quality Rating</span>
                          <span className="font-bold text-emerald-600 block mt-0.5">{pn.qualityRating}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">24h Tier</span>
                          <span className="font-bold text-slate-900 block mt-0.5">{pn.messagingLimitTier}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Meta Status</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {pn.codeVerificationStatus || 'VERIFIED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Webhook Configuration Diagnostics Box */}
          <div className="p-5 rounded-3xl bg-slate-900 text-slate-200 text-xs border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Meta Cloud API Inbound Webhook Endpoint</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                Subscribe to: messages, message_template_status_update, account_update
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                <span className="text-slate-500 shrink-0">Callback URL:</span>
                <span className="text-emerald-300 truncate flex-1">{webhookUrl}</span>
                <button
                  onClick={handleCopyWebhook}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                <span className="text-slate-500 shrink-0">Verify Token:</span>
                <span className="text-slate-300 truncate flex-1">{verifyToken}</span>
                <button
                  onClick={handleCopyVerifyToken}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                >
                  {copiedVerifyToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVerifyToken ? 'Copied' : 'Copy Token'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Meta Embedded Signup Wizard */}
      {activeTab === 'embedded-signup' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Official Meta Embedded Signup</h2>
              <p className="text-xs text-slate-500">
                Meta App ID: <span className="font-mono font-semibold text-slate-700">{esSession?.appId || '4558736907726599'}</span> • Independent Tech Provider Flow
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Onboard WhatsApp Business Accounts in under 2 minutes via official Facebook Login for Business. Customers select or create their Meta Business Portfolio, verify their phone number via OTP, and grant CONVOZA messaging & template management permissions.
          </p>

          <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Authenticate with Facebook Business</span>
                <span className="text-slate-500 text-[11px]">Select an existing Business Portfolio or register a new one.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Select or Create WhatsApp Business Account (WABA)</span>
                <span className="text-slate-500 text-[11px]">Set your verified WhatsApp display name and business category.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Verify Number & Exchange OAuth Code</span>
                <span className="text-slate-500 text-[11px]">CONVOZA exchanges the OAuth code server-side and encrypts the token with AES-256-GCM.</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchEmbeddedSignup}
            disabled={esLaunching}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {esLaunching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Meta Facebook Login...</span>
              </>
            ) : (
              <>
                <span>Launch Meta Embedded Signup</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 3: Manual WABA Connection Form */}
      {activeTab === 'connect-manual' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Manual Meta Cloud API Credentials</h2>
              <p className="text-xs text-slate-500">Connect your existing WABA ID, Phone Number ID, and System User Access Token</p>
            </div>
          </div>

          <form onSubmit={handleConnectManual} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Connection Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Emperor Smart Solutions Official"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                WhatsApp Business Account (WABA) ID
              </label>
              <input
                type="text"
                required
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="e.g. 109823746591029"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Phone Number ID
              </label>
              <input
                type="text"
                required
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 102938475610293"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                System User / Cloud API Access Token
              </label>
              <input
                type="password"
                required
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAG... (Encrypted at rest with AES-256-GCM)"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono shadow-xs"
              />
            </div>

            {/* Validation Feedback */}
            {validationResult && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
                  validationResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {validationResult.success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Valid Meta Credentials! Verified Name: <strong>{validationResult.details?.verified_name}</strong> ({validationResult.details?.display_phone_number})
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{validationResult.error}</span>
                  </>
                )}
              </div>
            )}

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleValidateManual}
                disabled={isValidating || !phoneNumberId || !accessToken}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Validate with Meta Graph API
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !wabaId || !phoneNumberId || !accessToken}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Connect & Encrypt WABA
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

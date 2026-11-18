'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Shield,
  Key,
  ArrowRight,
  Code2,
  Copy,
  Check,
  Send,
  Webhook,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  RefreshCw,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play
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

export default function ApiDocsPage() {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'node' | 'python' | 'php'>('curl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Playground State
  const [testEndpoint, setTestEndpoint] = useState<'send_template' | 'send_text' | 'contact_sync'>('send_template');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState<any>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulatedResponse(null);
    setTimeout(() => {
      setIsSimulating(false);
      if (testEndpoint === 'send_template') {
        setSimulatedResponse({
          status: 202,
          statusText: 'Accepted',
          latency: '42ms',
          body: {
            success: true,
            messageId: 'msg_wamid_HBgLMOTE5ODc2NTQwMDAxFAARABgUM0ExMjU2',
            outboxQueueId: 'obx_7f9a2e8c1b',
            status: 'QUEUED_FOR_DISPATCH',
            recipient: '+919876540001',
            template: 'order_confirmation_v2',
            metaRateLimitRemaining: '99,948 / 100,000',
            timestamp: new Date().toISOString()
          }
        });
      } else if (testEndpoint === 'send_text') {
        setSimulatedResponse({
          status: 200,
          statusText: 'OK',
          latency: '36ms',
          body: {
            success: true,
            messageId: 'msg_wamid_HBgLMOTE5ODc2NTQwMDAyFAARABgUM0ExMjU3',
            sessionWindowActive: true,
            windowExpiresInHours: 19.4,
            status: 'DELIVERED_TO_META',
            recipient: '+919876540002',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        setSimulatedResponse({
          status: 200,
          statusText: 'OK',
          latency: '29ms',
          body: {
            success: true,
            syncedContacts: 1,
            action: 'UPDATED',
            contactId: 'cnt_88f912e',
            tags: ['VIP', 'Shopify-Customer', 'Recent-Purchase'],
            timestamp: new Date().toISOString()
          }
        });
      }
    }, 650);
  };

  // Code snippets by language
  const authSnippets = {
    curl: `curl -X POST https://convoza.emperorsmartsolutions.com/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@emperorsmartsolutions.com",
    "password": "YourSecurePassword!"
  }'`,
    node: `import axios from 'axios';

const { data } = await axios.post('https://convoza.emperorsmartsolutions.com/api/v1/auth/login', {
  email: 'admin@emperorsmartsolutions.com',
  password: 'YourSecurePassword!'
});

console.log('JWT Bearer Token:', data.data.tokens.accessToken);`,
    python: `import requests

res = requests.post(
    "https://convoza.emperorsmartsolutions.com/api/v1/auth/login",
    json={
        "email": "admin@emperorsmartsolutions.com",
        "password": "YourSecurePassword!"
    }
)
token = res.json()["data"]["tokens"]["accessToken"]
print("Access Token:", token)`,
    php: `$client = new \\GuzzleHttp\\Client();

$res = $client->post('https://convoza.emperorsmartsolutions.com/api/v1/auth/login', [
    'json' => [
        'email' => 'admin@emperorsmartsolutions.com',
        'password' => 'YourSecurePassword!'
    ]
]);

$data = json_decode($res->getBody(), true);
$token = $data['data']['tokens']['accessToken'];`
  };

  const sendMsgSnippets = {
    curl: `# Authenticate with x-api-key: cvz_live_... OR Authorization: Bearer <JWT>
curl -X POST https://convoza.emperorsmartsolutions.com/api/v1/messages/send \\
  -H "x-api-key: cvz_live_9f8a7b6c5d4e3f2a1b0c" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumberId": "102938475610293",
    "recipientPhone": "+919876540001",
    "type": "TEMPLATE",
    "templateId": "tpl_order_confirmation",
    "templateParameters": {
      "1": "Sarah",
      "2": "ESS-4912",
      "3": "₹2,499"
    }
  }'`,
    node: `import axios from 'axios';

const response = await axios.post(
  'https://convoza.emperorsmartsolutions.com/api/v1/messages/send',
  {
    phoneNumberId: '102938475610293',
    recipientPhone: '+919876540001',
    type: 'TEMPLATE',
    templateId: 'tpl_order_confirmation',
    templateParameters: {
      1: 'Sarah',
      2: 'ESS-4912',
      3: '₹2,499'
    }
  },
  {
    headers: {
      'x-api-key': 'cvz_live_9f8a7b6c5d4e3f2a1b0c', // or Authorization: \`Bearer \${ACCESS_TOKEN}\`
    }
  }
);

console.log('Outbox Queue ID:', response.data.outboxQueueId);`,
    python: `import requests

headers = {
    "x-api-key": "cvz_live_9f8a7b6c5d4e3f2a1b0c",  # or "Authorization": f"Bearer {ACCESS_TOKEN}"
    "Content-Type": "application/json"
}

payload = {
    "phoneNumberId": "102938475610293",
    "recipientPhone": "+919876540001",
    "type": "TEMPLATE",
    "templateId": "tpl_order_confirmation",
    "templateParameters": {
        "1": "Sarah",
        "2": "ESS-4912",
        "3": "₹2,499"
    }
}

res = requests.post("https://convoza.emperorsmartsolutions.com/api/v1/messages/send", json=payload, headers=headers)
print("Queued message:", res.json())`,
    php: `$client = new \\GuzzleHttp\\Client();

$res = $client->post('https://convoza.emperorsmartsolutions.com/api/v1/messages/send', [
    'headers' => [
        'x-api-key' => 'cvz_live_9f8a7b6c5d4e3f2a1b0c', // or 'Authorization' => 'Bearer ' . $token
        'Content-Type' => 'application/json'
    ],
    'json' => [
        'phoneNumberId' => '102938475610293',
        'recipientPhone' => '+919876540001',
        'type' => 'TEMPLATE',
        'templateId' => 'tpl_order_confirmation',
        'templateParameters' => [
            '1' => 'Sarah',
            '2' => 'ESS-4912',
            '3' => '₹2,499'
        ]
    ]
]);`
  };

  const webhookSignatureSnippet = `// Node.js Express Webhook Signature Verification
import crypto from 'crypto';

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-convoza-signature'];
  const hmac = crypto
    .createHmac('sha256', process.env.CONVOZA_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== hmac) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;
  console.log(\`Received \${event} for \${data.recipientPhone}\`);
  res.status(200).send('OK');
});`;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-500 selection:text-white">
      {/* 1. HERO SECTION & API HEADLINE */}
      <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-24 overflow-hidden border-b border-slate-200/80 bg-white">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-emerald-200/40 via-teal-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-[13px] font-extrabold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>CONVOZA DEVELOPER PLATFORM • REST API & WEBHOOKS V1</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.14]">
            Official REST APIs & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#021812] via-[#075E54] to-[#128C7E] bg-clip-text text-transparent">
              Real-Time WhatsApp Webhooks
            </span>
          </h1>

          <p className="mt-5 max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Build bespoke automations, connect internal ERPs & CRMs, and dispatch high-throughput transactional WhatsApp messages through official Meta Cloud infrastructure.
          </p>

          {/* Quick Specs Bar */}
          <div className="mt-10 max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Base Endpoint URL</div>
                <div className="font-mono text-xs sm:text-sm text-emerald-400 font-semibold break-all">
                  https://convoza.emperorsmartsolutions.com/api/v1
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => handleCopy('https://convoza.emperorsmartsolutions.com/api/v1', 'base_url')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'base_url' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#25D366]" />
                    <span className="text-[#25D366]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <a
                href="https://convoza.emperorsmartsolutions.com/api/docs"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-emerald-400 hover:to-teal-600 text-slate-950 text-xs font-black rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
              >
                <span>Interactive Swagger UI</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Jump Anchors */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <span className="text-slate-400 font-bold mr-1">Jump to:</span>
            <a href="#auth" className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
              1. Authentication
            </a>
            <a href="#messages" className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
              2. Send WhatsApp Message
            </a>
            <a href="#playground" className="px-3 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-200 transition-colors">
              ⚡ Live API Tester
            </a>
            <a href="#webhooks" className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
              3. Webhook Events
            </a>
            <a href="#errors" className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
              4. Error Codes & SLAs
            </a>
          </div>
        </div>
      </section>

      {/* 2. CORE REST API ENDPOINTS SHOWCASE */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Language Switcher Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                RESTful Endpoint Specifications
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                All requests accept standard JSON payloads with Bearer Token authentication.
              </p>
            </div>

            {/* Language Selector Pills */}
            <div className="flex items-center p-1 bg-slate-200/80 rounded-xl shadow-2xs">
              {(['curl', 'node', 'python', 'php'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLang(lang)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    selectedLang === lang
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'node' ? 'Node.js' : lang}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 space-y-12">
            {/* ENDPOINT 1: AUTHENTICATION */}
            <ScrollReveal>
              <div id="auth" className="scroll-mt-24 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs uppercase tracking-wider">
                        POST
                      </span>
                      <code className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                        /api/v1/auth/login
                      </code>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                      Public Endpoint
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-emerald-600" />
                    <span>1. User & Service Account Authentication</span>
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    Exchange your registered CONVOZA credentials for a signed JWT Bearer Token (<code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Authorization: Bearer &lt;TOKEN&gt;</code>), or pass an organization API key directly via <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">x-api-key: cvz_live_...</code> for server-to-server ERPs and CRMs.
                  </p>
                </div>

                {/* Code Body & Response Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-slate-950 text-slate-200">
                  {/* Request Code */}
                  <div className="p-6">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span>Request ({selectedLang.toUpperCase()})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(authSnippets[selectedLang], 'auth_req')}
                        className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedKey === 'auth_req' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#25D366]" />
                            <span className="text-[#25D366]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto p-1">
                      {authSnippets[selectedLang]}
                    </pre>
                  </div>

                  {/* Response Sample */}
                  <div className="p-6 bg-slate-900/70">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-semibold">
                      <span className="flex items-center gap-2 text-slate-400">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>JSON Response</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-[#25D366] text-[11px] font-mono font-bold">
                        200 OK • 28ms
                      </span>
                    </div>
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto p-1">
{`{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.rf..."
    },
    "user": {
      "id": "usr_99f2e18",
      "email": "admin@emperorsmartsolutions.com",
      "organization": "Emperor Smart Solutions"
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ENDPOINT 2: SEND WHATSAPP MESSAGE */}
            <ScrollReveal>
              <div id="messages" className="scroll-mt-24 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs uppercase tracking-wider">
                        POST
                      </span>
                      <code className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                        /api/v1/messages/send
                      </code>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      x-api-key or Bearer JWT
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900 flex items-center gap-2">
                    <Send className="w-5 h-5 text-emerald-600" />
                    <span>2. Dispatch Meta Cloud Template & Dynamic Broadcast</span>
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    Dispatch an approved Meta Cloud message template with variable replacement (<code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">{"{{1}}"}</code>, <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">{"{{2}}"}</code>). Message is validated, rate-limited via token-bucket outbox worker, and submitted to Meta Cloud Graph API within milliseconds.
                  </p>
                </div>

                {/* Code Body & Response Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-slate-950 text-slate-200">
                  {/* Request Code */}
                  <div className="p-6">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span>Request ({selectedLang.toUpperCase()})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(sendMsgSnippets[selectedLang], 'send_req')}
                        className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedKey === 'send_req' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#25D366]" />
                            <span className="text-[#25D366]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto p-1">
                      {sendMsgSnippets[selectedLang]}
                    </pre>
                  </div>

                  {/* Response Sample */}
                  <div className="p-6 bg-slate-900/70">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-semibold">
                      <span className="flex items-center gap-2 text-slate-400">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>JSON Response</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[11px] font-mono font-bold">
                        202 ACCEPTED • 41ms
                      </span>
                    </div>
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto p-1">
{`{
  "success": true,
  "messageId": "msg_wamid_HBgLMOTE5ODc2NTQwMDAxFAARABgUM0ExMjU2",
  "outboxQueueId": "obx_7f9a2e8c1b",
  "status": "QUEUED_FOR_DISPATCH",
  "recipient": "+919876540001",
  "template": "tpl_order_confirmation",
  "metaQualityRating": "GREEN",
  "dispatchRate": "50 msg/sec",
  "timestamp": "2026-11-16T14:30:00Z"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. LIVE INTERACTIVE API TESTER / PLAYGROUND */}
      <section id="playground" className="scroll-mt-24 py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Play className="w-3.5 h-3.5 fill-emerald-300" />
                <span>IN-BROWSER API TEST CONSOLE</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">
                Simulate Live API Dispatch in Real-Time
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                Select an endpoint, inspect the request payload, and run a test simulation to preview response headers and sub-50ms dispatch latency.
              </p>
            </div>

            {/* Playground Box */}
            <div className="mt-10 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
              {/* Header Tab Bar */}
              <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 mr-1">Choose Test Endpoint:</span>
                  <button
                    type="button"
                    onClick={() => { setTestEndpoint('send_template'); setSimulatedResponse(null); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      testEndpoint === 'send_template'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    POST /messages/send (Template)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTestEndpoint('send_text'); setSimulatedResponse(null); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      testEndpoint === 'send_text'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    POST /messages/send-session (Live Chat)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTestEndpoint('contact_sync'); setSimulatedResponse(null); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      testEndpoint === 'contact_sync'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    POST /contacts/sync (CRM)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-emerald-400 hover:to-teal-600 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending to Outbox...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Test Endpoint Simulator</span>
                    </>
                  )}
                </button>
              </div>

              {/* Playground Body */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                {/* Request Payload View */}
                <div className="p-6">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs font-bold text-slate-400">
                    <span>Active Request Payload</span>
                    <span className="font-mono text-emerald-400">Content-Type: application/json</span>
                  </div>
                  <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto p-1">
                    {testEndpoint === 'send_template' && `{
  "phoneNumberId": "102938475610293",
  "recipientPhone": "+919876540001",
  "type": "TEMPLATE",
  "templateId": "order_confirmation_v2",
  "templateParameters": {
    "1": "Sarah",
    "2": "ESS-4912",
    "3": "₹2,499"
  }
}`}
                    {testEndpoint === 'send_text' && `{
  "phoneNumberId": "102938475610293",
  "recipientPhone": "+919876540002",
  "message": "Hi Raj, your returned parcel #RT-884 has been inspected and refunded to your source card."
}`}
                    {testEndpoint === 'contact_sync' && `{
  "phone": "+919876540003",
  "name": "Karan Mehra",
  "tags": ["VIP", "Shopify-Customer", "Recent-Purchase"],
  "customAttributes": {
    "lifetimeSpend": 42000,
    "lastOrderNumber": "ORD-9912"
  }
}`}
                  </pre>
                </div>

                {/* Live Output View */}
                <div className="p-6 bg-slate-900/50">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs font-bold">
                    <span className="text-slate-400">Simulation Response</span>
                    {simulatedResponse && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-[#25D366] font-mono text-[11px]">
                        {simulatedResponse.status} {simulatedResponse.statusText} • {simulatedResponse.latency}
                      </span>
                    )}
                  </div>

                  {simulatedResponse ? (
                    <pre className="text-xs font-mono text-[#25D366] leading-relaxed overflow-x-auto p-1">
                      {JSON.stringify(simulatedResponse.body, null, 2)}
                    </pre>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                      <Play className="w-8 h-8 text-slate-700 mb-2" />
                      <span>Click "Test Endpoint Simulator" above to trigger a live execution cycle.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. REAL-TIME WEBHOOK ARCHITECTURE & SIGNATURE VERIFICATION */}
      <section id="webhooks" className="scroll-mt-24 py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <Webhook className="w-3.5 h-3.5 text-emerald-600" />
                <span>EVENT TELEMETRY & WEBHOOKS</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Real-Time Delivery Receipts & Inbound Inquiries
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Subscribe your backend server to CONVOZA webhooks to listen for delivery events (<code className="text-emerald-700 font-mono text-xs">delivered</code>, <code className="text-emerald-700 font-mono text-xs">read</code>), customer replies, and quick button clicks.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Event Sample */}
              <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-lg border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold">
                  <span className="text-emerald-400 font-mono">Sample Inbound Message Event</span>
                  <span className="text-slate-400">POST /your-webhook</span>
                </div>
                <pre className="mt-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`{
  "event": "message.received",
  "timestamp": "2026-11-16T14:32:00Z",
  "data": {
    "messageId": "wamid.HBgLMOTE5ODc2NTQwMDAx",
    "senderPhone": "+919876540001",
    "senderName": "Sarah",
    "type": "TEXT",
    "text": "Can I get an update on delivery date?",
    "conversation": {
      "id": "cnv_48a912e",
      "windowExpiresAt": "2026-11-17T14:32:00Z",
      "isWindowOpen": true
    }
  }
}`}
                </pre>
              </div>

              {/* Signature Verification */}
              <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-lg border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold">
                  <span className="text-[#25D366] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                    <span>HMAC-SHA256 Signature Verification</span>
                  </span>
                  <span className="text-slate-400 font-mono">x-convoza-signature</span>
                </div>
                <pre className="mt-4 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                  {webhookSignatureSnippet}
                </pre>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. ERROR CODES & RATE LIMITS REFERENCE */}
      <section id="errors" className="scroll-mt-24 py-16 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>STATUS REFERENCE & CODES</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                HTTP Response Codes & Error Standards
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Predictable error payloads with human-readable error messages and resolution suggestions.
              </p>
            </div>

            <div className="mt-10 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="p-4 sm:px-6 bg-slate-50/90 font-bold text-slate-900 grid grid-cols-12">
                  <div className="col-span-3 sm:col-span-2 font-mono">Status Code</div>
                  <div className="col-span-4 sm:col-span-3">Status Title</div>
                  <div className="col-span-5 sm:col-span-7">Description & Resolution Action</div>
                </div>

                <div className="p-4 sm:px-6 grid grid-cols-12 items-center hover:bg-slate-50/50">
                  <div className="col-span-3 sm:col-span-2 font-mono font-bold text-emerald-600">200 OK</div>
                  <div className="col-span-4 sm:col-span-3 font-semibold text-slate-900">Synchronous Success</div>
                  <div className="col-span-5 sm:col-span-7 text-slate-600">The request was executed immediately and returned expected data.</div>
                </div>

                <div className="p-4 sm:px-6 grid grid-cols-12 items-center hover:bg-slate-50/50">
                  <div className="col-span-3 sm:col-span-2 font-mono font-bold text-blue-600">202 ACCEPTED</div>
                  <div className="col-span-4 sm:col-span-3 font-semibold text-slate-900">Queued in Outbox</div>
                  <div className="col-span-5 sm:col-span-7 text-slate-600">Message entered the rate-limited dispatch worker queue for delivery to Meta Graph API.</div>
                </div>

                <div className="p-4 sm:px-6 grid grid-cols-12 items-center hover:bg-slate-50/50">
                  <div className="col-span-3 sm:col-span-2 font-mono font-bold text-amber-600">400 BAD_REQUEST</div>
                  <div className="col-span-4 sm:col-span-3 font-semibold text-slate-900">Validation Failure</div>
                  <div className="col-span-5 sm:col-span-7 text-slate-600">Missing required parameters or phone number missing E.164 country code format (+91).</div>
                </div>

                <div className="p-4 sm:px-6 grid grid-cols-12 items-center hover:bg-slate-50/50">
                  <div className="col-span-3 sm:col-span-2 font-mono font-bold text-red-600">401 UNAUTHORIZED</div>
                  <div className="col-span-4 sm:col-span-3 font-semibold text-slate-900">Invalid Token</div>
                  <div className="col-span-5 sm:col-span-7 text-slate-600">Missing or expired JWT Bearer Token in Authorization header. Call <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/auth/login</code> to refresh.</div>
                </div>

                <div className="p-4 sm:px-6 grid grid-cols-12 items-center hover:bg-slate-50/50">
                  <div className="col-span-3 sm:col-span-2 font-mono font-bold text-purple-600">429 RATE_LIMITED</div>
                  <div className="col-span-4 sm:col-span-3 font-semibold text-slate-900">Throttle Triggered</div>
                  <div className="col-span-5 sm:col-span-7 text-slate-600">Outbox capacity reached. Check <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Retry-After</code> header and throttle client requests.</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. BOTTOM DEVELOPER COMMUNITY & SWAGGER CTA */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TEST THE FULL API SUITE</span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Explore All 35+ Endpoints in Swagger?
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
              Launch our interactive OpenAPI documentation directly against your local or staging CONVOZA cluster. Execute live requests, inspect schemas, and download models.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://convoza.emperorsmartsolutions.com/api/docs"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-emerald-400 hover:to-teal-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-100 transition-all"
              >
                <span>Open Interactive Swagger UI</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all"
              >
                Talk with Developer Support
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

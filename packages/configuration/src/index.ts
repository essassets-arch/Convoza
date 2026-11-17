import * as crypto from 'crypto';

export const APP_CONFIG = {
  NAME: 'CONVOZA',
  TAGLINE: 'Conversations. Connected.',
  DEFAULT_PORT: 4000,
  API_PREFIX: '/api/v1',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CUSTOMER_SERVICE_WINDOW_HOURS: 24,
  CUSTOMER_SERVICE_WINDOW_MS: 24 * 60 * 60 * 1000,
  E164_PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
};

export const META_CONFIG = {
  GRAPH_API_VERSION: process.env.META_GRAPH_API_VERSION || 'v20.0',
  GRAPH_API_BASE: `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || 'v20.0'}`,
  OAUTH_ACCESS_TOKEN_URL: `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || 'v20.0'}/oauth/access_token`,
  WEBHOOK_VERIFY_TOKEN: process.env.META_WEBHOOK_VERIFY_TOKEN || 'convoza_meta_verify_token_secure_2026',
  APP_SECRET: process.env.META_APP_SECRET || 'convoza_meta_app_secret_placeholder',
  APP_ID: process.env.META_APP_ID || '4558736907726599',
  CONFIG_ID: process.env.META_CONFIG_ID || '',
  HOSTED_ES_URL: process.env.META_HOSTED_ES_URL || '',
  SYSTEM_USER_ACCESS_TOKEN: process.env.META_SYSTEM_USER_ACCESS_TOKEN || '',
};

export const WORKER_CONFIG = {
  POLL_INTERVAL_MS: 1500,
  BATCH_SIZE: 50,
  MAX_RETRY_ATTEMPTS: 5,
  BASE_BACKOFF_MS: 2000,
  MAX_BACKOFF_MS: 60000,
  LOCK_TIMEOUT_SECONDS: 120,
};

// ==========================================
// Security & Cryptographic Utilities
// ==========================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY = crypto.scryptSync(process.env.CREDENTIALS_ENCRYPTION_KEY || 'convoza-super-secret-master-key-32b', 'salt', 32);

/**
 * Encrypt sensitive credentials (e.g., Meta access tokens) using AES-256-GCM
 */
export function encryptSecret(plainText: string, customKey?: Buffer): string {
  if (!plainText) return '';
  const key = customKey || DEFAULT_KEY;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt sensitive credentials using AES-256-GCM
 */
export function decryptSecret(cipherText: string, customKey?: Buffer): string {
  if (!cipherText || !cipherText.includes(':')) return cipherText;
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText;
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = customKey || DEFAULT_KEY;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed for secret:', err);
    return '';
  }
}

/**
 * Verify Meta Webhook X-Hub-Signature-256
 */
export function verifyMetaWebhookSignature(rawBody: string | Buffer, signatureHeader?: string, appSecret?: string): boolean {
  if (!signatureHeader) return false;
  const secret = appSecret || META_CONFIG.APP_SECRET;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

/**
 * Verify Razorpay Webhook Signature
 */
export function verifyRazorpaySignature(rawBody: string, signature: string, webhookSecret: string): boolean {
  if (!signature || !webhookSecret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Build an official Meta WhatsApp Cloud API v20.0 /messages payload.
 * Handles TEXT, media, UTILITY/MARKETING templates, and AUTHENTICATION (OTP Copy Code) templates.
 */
export function buildMetaMessagePayload(options: {
  recipientPhone: string;
  type: string;
  body?: string;
  mediaUrl?: string;
  templateName?: string;
  templateLanguage?: string;
  templateCategory?: string;
  templateComponents?: any[];
  templateParameters?: Record<string, any> | null;
}): Record<string, any> {
  const to = options.recipientPhone.replace(/[^\d]/g, '');
  const base: Record<string, any> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
  };

  if (options.type === 'TEMPLATE' && options.templateName) {
    const paramsMap = options.templateParameters || {};
    const orderedValues = Object.keys(paramsMap)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => String(paramsMap[k]));

    const sendComponents: any[] = [];
    const tplComponents = Array.isArray(options.templateComponents) ? options.templateComponents : [];
    const isAuth = (options.templateCategory || '').toUpperCase() === 'AUTHENTICATION';

    // 1. Header component parameters (text variable or media header)
    const headerDef = tplComponents.find((c) => (c.type || '').toUpperCase() === 'HEADER');
    if (headerDef && !isAuth) {
      const format = (headerDef.format || 'TEXT').toUpperCase();
      if (format === 'TEXT' && typeof headerDef.text === 'string' && headerDef.text.includes('{{')) {
        const headerVal = paramsMap['header_1'] || orderedValues[0] || 'Customer';
        sendComponents.push({
          type: 'header',
          parameters: [{ type: 'text', text: String(headerVal) }],
        });
      } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(format) && options.mediaUrl) {
        const mediaKey = format.toLowerCase();
        sendComponents.push({
          type: 'header',
          parameters: [{ type: mediaKey, [mediaKey]: { link: options.mediaUrl } }],
        });
      }
    }

    // 2. Body component parameters
    const bodyDef = tplComponents.find((c) => (c.type || '').toUpperCase() === 'BODY');
    const bodyVarMatches = typeof bodyDef?.text === 'string' ? bodyDef.text.match(/\{\{(\d+)\}\}/g) : null;
    const expectedBodyVarCount = isAuth
      ? Math.max(1, bodyVarMatches ? new Set(bodyVarMatches).size : 1)
      : bodyVarMatches
        ? new Set(bodyVarMatches).size
        : orderedValues.length;

    if (expectedBodyVarCount > 0 && orderedValues.length > 0) {
      const bodyParams = [];
      for (let i = 0; i < expectedBodyVarCount; i++) {
        const val = paramsMap[String(i + 1)] ?? orderedValues[i] ?? orderedValues[0] ?? '';
        bodyParams.push({ type: 'text', text: String(val) });
      }
      sendComponents.push({
        type: 'body',
        parameters: bodyParams,
      });
    }

    // 3. Button parameters (AUTHENTICATION Copy Code OTP buttons + dynamic URL {{1}} buttons)
    const buttonsDef = tplComponents.find((c) => (c.type || '').toUpperCase() === 'BUTTONS');
    const buttonsList: any[] = Array.isArray(buttonsDef?.buttons) ? buttonsDef.buttons : [];

    if (buttonsList.length > 0) {
      buttonsList.forEach((btn, idx) => {
        const btnType = (btn.type || '').toUpperCase();
        const hasDynamicUrl = btnType === 'URL' && typeof btn.url === 'string' && btn.url.includes('{{');
        const isOtpBtn = btnType === 'OTP' || (isAuth && idx === 0 && (btnType === 'URL' || btnType === 'OTP'));

        if (isOtpBtn || hasDynamicUrl) {
          const btnVal = paramsMap[`button_${idx}`] || paramsMap['1'] || orderedValues[0] || '';
          if (btnVal) {
            sendComponents.push({
              type: 'button',
              sub_type: 'url',
              index: String(idx),
              parameters: [{ type: 'text', text: String(btnVal) }],
            });
          }
        }
      });
    } else if (isAuth && orderedValues.length > 0) {
      // Fallback for AUTHENTICATION templates synced without explicit buttons metadata
      sendComponents.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: String(orderedValues[0]) }],
      });
    }

    base.type = 'template';
    base.template = {
      name: options.templateName,
      language: { code: options.templateLanguage || 'en_US' },
      ...(sendComponents.length > 0 ? { components: sendComponents } : {}),
    };
    return base;
  }

  if (['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes((options.type || '').toUpperCase()) && options.mediaUrl) {
    const mediaKey = options.type.toLowerCase();
    base.type = mediaKey;
    base[mediaKey] = {
      link: options.mediaUrl,
      ...(options.body && mediaKey !== 'audio' ? { caption: options.body } : {}),
    };
    return base;
  }

  base.type = 'text';
  base.text = { preview_url: false, body: options.body || '' };
  return base;
}



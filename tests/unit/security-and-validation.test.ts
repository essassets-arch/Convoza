import {
  encryptSecret,
  decryptSecret,
  verifyMetaWebhookSignature,
  buildMetaMessagePayload,
} from '../../packages/configuration/src';
import {
  normalizeE164,
  validateTemplateName,
  validateTemplateComponents,
  extractTemplateVariables,
  validateContactInput,
} from '../../packages/validation/src';

describe('CONVOZA Security & Cryptography Unit Tests', () => {
  it('should encrypt and decrypt Meta permanent access tokens using AES-256-GCM', () => {
    const rawSecret = 'EAAG_Meta_Super_Secret_Access_Token_1234567890';
    const cipherText = encryptSecret(rawSecret);

    expect(cipherText).toBeDefined();
    expect(cipherText).not.toEqual(rawSecret);
    expect(cipherText.split(':').length).toBe(3); // iv:authTag:encrypted

    const plainText = decryptSecret(cipherText);
    expect(plainText).toEqual(rawSecret);
  });

  it('should verify Meta Webhook X-Hub-Signature-256 with timing-safe HMAC comparison', () => {
    const rawBody = JSON.stringify({ object: 'whatsapp_business_account', test: true });
    const appSecret = 'convoza_secret_for_tests_123';

    const crypto = require('crypto');
    const validSig =
      'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

    const isValid = verifyMetaWebhookSignature(rawBody, validSig, appSecret);
    expect(isValid).toBe(true);

    const isInvalid = verifyMetaWebhookSignature(rawBody, 'sha256=invalid_digest', appSecret);
    expect(isInvalid).toBe(false);
  });
});

describe('CONVOZA WhatsApp Business Normalization & Validation', () => {
  it('should normalize international phone numbers into strict E.164 standard', () => {
    const testCases = [
      { input: '+91 98765 43210', expected: '+919876543210' },
      { input: '919876543210', expected: '+919876543210' },
      { input: '+1 (555) 234-5678', expected: '+15552345678' },
    ];

    for (const tc of testCases) {
      const res = normalizeE164(tc.input);
      expect(res.isValid).toBe(true);
      expect(res.normalized).toEqual(tc.expected);
    }

    const invalid = normalizeE164('invalid-phone');
    expect(invalid.isValid).toBe(false);
  });

  it('should validate template names according to Meta specifications (lowercase alphanumeric & underscore)', () => {
    expect(validateTemplateName('summer_flash_sale_v1').isValid).toBe(true);
    expect(validateTemplateName('summer-sale!').isValid).toBe(false);
    expect(validateTemplateName('SummerSale').isValid).toBe(false);
  });

  it('should extract template variable tokens accurately', () => {
    const text = 'Hi {{1}}, your order #{{2}} for total {{3}} has shipped!';
    const tokens = extractTemplateVariables(text);
    expect(tokens).toEqual(['{{1}}', '{{2}}', '{{3}}']);
  });

  it('should build Meta Cloud API v20.0 OTP AUTHENTICATION payload with body and copy-code button parameters', () => {
    const payload = buildMetaMessagePayload({
      recipientPhone: '+91 98765 43210',
      type: 'TEMPLATE',
      templateName: 'login_otp_verify',
      templateLanguage: 'en_US',
      templateCategory: 'AUTHENTICATION',
      templateComponents: [
        { type: 'BODY', text: '*{{1}}* is your verification code.' },
        { type: 'BUTTONS', buttons: [{ type: 'OTP', otp_type: 'COPY_CODE', text: 'Copy code' }] },
      ],
      templateParameters: { '1': '482913' },
    });

    expect(payload.to).toEqual('919876543210');
    expect(payload.type).toEqual('template');
    expect(payload.template.components).toEqual([
      {
        type: 'body',
        parameters: [{ type: 'text', text: '482913' }],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: '482913' }],
      },
    ]);
  });
});


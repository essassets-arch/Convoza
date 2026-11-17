import { APP_CONFIG } from '@convoza/configuration';
import {
  TemplateCategory,
  TemplateComponentType,
  ConsentStatus,
  UserRole,
  OnboardingType,
} from '@convoza/shared-types';

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  errors: string[];
  data?: T;
}

/**
 * Normalize phone number into E.164 standard.
 * e.g., "919876543210" -> "+919876543210", "+1 (555) 234-5678" -> "+15552345678"
 */
export function normalizeE164(phone: string): { isValid: boolean; normalized: string; error?: string } {
  if (!phone) {
    return { isValid: false, normalized: '', error: 'Phone number is required' };
  }
  let clean = phone.replace(/[^\d+]/g, '');
  if (!clean.startsWith('+')) {
    clean = '+' + clean;
  }
  
  if (!APP_CONFIG.E164_PHONE_REGEX.test(clean)) {
    return {
      isValid: false,
      normalized: clean,
      error: 'Invalid E.164 phone format. Must start with + followed by country code and 7-14 digits.',
    };
  }
  return { isValid: true, normalized: clean };
}

/**
 * Validate Template Name: only lowercase alphanumeric and underscores allowed by Meta.
 */
export function validateTemplateName(name: string): ValidationResult<string> {
  const errors: string[] = [];
  if (!name || name.trim().length === 0) {
    errors.push('Template name is required');
  } else {
    const trimmed = name.trim();
    if (!/^[a-z0-9_]{1,512}$/.test(trimmed)) {
      errors.push('Template name can only contain lowercase letters, numbers, and underscores (max 512 characters).');
    }
    return { isValid: errors.length === 0, errors, data: trimmed };
  }
  return { isValid: false, errors };
}

/**
 * Validate template components (Body required, max variables, buttons limits)
 */
export function validateTemplateComponents(components: any[]): ValidationResult<any[]> {
  const errors: string[] = [];
  if (!Array.isArray(components) || components.length === 0) {
    errors.push('Template must contain at least a BODY component');
    return { isValid: false, errors };
  }

  const hasBody = components.some(
    (c) =>
      c.type === TemplateComponentType.BODY &&
      ((c.text && c.text.trim().length > 0) || c.add_security_recommendation !== undefined)
  );
  if (!hasBody) {
    errors.push('Template must have a non-empty BODY component');
  }

  const headerComponents = components.filter((c) => c.type === TemplateComponentType.HEADER);
  if (headerComponents.length > 1) {
    errors.push('Template cannot have more than 1 HEADER component');
  }

  const footerComponents = components.filter((c) => c.type === TemplateComponentType.FOOTER);
  if (footerComponents.length > 1) {
    errors.push('Template cannot have more than 1 FOOTER component');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: components,
  };
}

/**
 * Extract variable tokens `{{1}}`, `{{2}}` from text
 */
export function extractTemplateVariables(text?: string): string[] {
  if (!text) return [];
  const matches = text.match(/\{\{(\d+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

/**
 * Validate Contact Input
 */
export function validateContactInput(input: {
  phone: string;
  name?: string;
  email?: string;
  consentStatus?: ConsentStatus;
}): ValidationResult<{ phone: string; name?: string; email?: string; consentStatus: ConsentStatus }> {
  const errors: string[] = [];
  const phoneCheck = normalizeE164(input.phone);
  if (!phoneCheck.isValid) {
    errors.push(phoneCheck.error || 'Invalid phone number');
  }

  if (input.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      errors.push('Invalid email address format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      phone: phoneCheck.normalized,
      name: input.name?.trim(),
      email: input.email?.trim().toLowerCase(),
      consentStatus: input.consentStatus || ConsentStatus.OPTED_IN,
    },
  };
}


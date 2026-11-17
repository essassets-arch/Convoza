// ==========================================
// CONVOZA - Shared TypeScript Definitions
// ==========================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_OWNER = 'ORG_OWNER',
  ORG_ADMIN = 'ORG_ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER'
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isSuspended: boolean;
  suspensionReason?: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// WhatsApp Account & Meta Integration
// ------------------------------------------

export enum WhatsAppAccountStatus {
  CONNECTED = 'CONNECTED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  DISCONNECTED = 'DISCONNECTED',
  RESTRICTED = 'RESTRICTED'
}

export enum QualityRating {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
  UNKNOWN = 'UNKNOWN'
}

export enum MessagingTier {
  TIER_50 = 'TIER_50',
  TIER_250 = 'TIER_250',
  TIER_1K = 'TIER_1K',
  TIER_10K = 'TIER_10K',
  TIER_100K = 'TIER_100K',
  TIER_UNLIMITED = 'TIER_UNLIMITED'
}

export enum OnboardingType {
  EMBEDDED_SIGNUP = 'EMBEDDED_SIGNUP',
  MANUAL = 'MANUAL'
}

export interface WhatsAppAccount {
  id: string;
  organizationId: string;
  wabaId: string;
  name: string;
  onboardingType: OnboardingType;
  status: WhatsAppAccountStatus;
  webhookSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
  phoneNumbers?: WhatsAppPhoneNumber[];
}

export interface WhatsAppPhoneNumber {
  id: string;
  whatsappAccountId: string;
  organizationId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: QualityRating;
  messagingLimitTier: MessagingTier;
  codeVerificationStatus: string;
  isDefault: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// WhatsApp Templates
// ------------------------------------------

export enum TemplateCategory {
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
  AUTHENTICATION = 'AUTHENTICATION'
}

export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAUSED = 'PAUSED',
  DISABLED = 'DISABLED'
}

export enum TemplateComponentType {
  HEADER = 'HEADER',
  BODY = 'BODY',
  FOOTER = 'FOOTER',
  BUTTONS = 'BUTTONS'
}

export enum HeaderFormat {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT'
}

export enum ButtonType {
  QUICK_REPLY = 'QUICK_REPLY',
  URL = 'URL',
  PHONE_NUMBER = 'PHONE_NUMBER',
  OTP = 'OTP'
}

export interface TemplateButton {
  type: ButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
  example?: string[];
}

export interface TemplateComponent {
  type: TemplateComponentType;
  format?: HeaderFormat;
  text?: string;
  example?: {
    header_text?: string[];
    body_text?: string[][];
    header_handle?: string[];
  };
  buttons?: TemplateButton[];
}

export interface WhatsAppTemplate {
  id: string;
  organizationId: string;
  whatsappAccountId: string;
  name: string;
  language: string;
  category: TemplateCategory;
  status: TemplateStatus;
  metaTemplateId?: string;
  rejectionReason?: string;
  components: TemplateComponent[];
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// Contacts & Audience
// ------------------------------------------

export enum ConsentStatus {
  OPTED_IN = 'OPTED_IN',
  OPTED_OUT = 'OPTED_OUT',
  PENDING = 'PENDING'
}

export enum ConsentSource {
  IMPORT = 'IMPORT',
  WEBSITE_FORM = 'WEBSITE_FORM',
  WHATSAPP_INBOUND = 'WHATSAPP_INBOUND',
  API = 'API',
  CHECKOUT = 'CHECKOUT'
}

export interface Contact {
  id: string;
  organizationId: string;
  phone: string;
  name?: string;
  email?: string;
  customFields?: Record<string, unknown>;
  consentStatus: ConsentStatus;
  consentSource?: ConsentSource;
  consentTimestamp?: string;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  organizationId: string;
  name: string;
  color?: string;
}

export interface ContactList {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// Messaging & 24h Customer Service Window
// ------------------------------------------

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  TEMPLATE = 'TEMPLATE',
  INTERACTIVE = 'INTERACTIVE'
}

export enum MessageStatus {
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface Message {
  id: string;
  organizationId: string;
  phoneNumberId: string;
  contactId: string;
  conversationId: string;
  direction: MessageDirection;
  type: MessageType;
  status: MessageStatus;
  wamid?: string;
  body?: string;
  mediaUrl?: string;
  mediaType?: string;
  templateId?: string;
  templateParameters?: Record<string, unknown>;
  errorMessage?: string;
  errorCode?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

// ------------------------------------------
// Shared Inbox & Conversations
// ------------------------------------------

export enum ConversationStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  SNOOZED = 'SNOOZED'
}

export interface Conversation {
  id: string;
  organizationId: string;
  phoneNumberId: string;
  contactId: string;
  contact?: Contact;
  status: ConversationStatus;
  assignedToUserId?: string;
  assignedUser?: UserProfile;
  unreadCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  customerWindowExpiresAt?: string;
  isWindowActive?: boolean;
  notes?: InternalNote[];
  createdAt: string;
  updatedAt: string;
}

export interface InternalNote {
  id: string;
  conversationId: string;
  userId: string;
  user?: UserProfile;
  content: string;
  createdAt: string;
}

// ------------------------------------------
// Campaigns
// ------------------------------------------

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum CampaignRecipientStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  EXCLUDED_NO_CONSENT = 'EXCLUDED_NO_CONSENT',
  EXCLUDED_OPT_OUT = 'EXCLUDED_OPT_OUT'
}

export interface Campaign {
  id: string;
  organizationId: string;
  phoneNumberId: string;
  templateId: string;
  name: string;
  status: CampaignStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  totalRecipients: number;
  queuedCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  repliedCount: number;
  variableMapping?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// Automations
// ------------------------------------------

export enum AutomationTrigger {
  INCOMING_MESSAGE = 'INCOMING_MESSAGE',
  KEYWORD_DETECTED = 'KEYWORD_DETECTED',
  NEW_CONTACT = 'NEW_CONTACT',
  CAMPAIGN_REPLY = 'CAMPAIGN_REPLY',
  CONVERSATION_ASSIGNED = 'CONVERSATION_ASSIGNED'
}

export enum AutomationActionType {
  SEND_TEMPLATE = 'SEND_TEMPLATE',
  SEND_TEXT_MESSAGE = 'SEND_TEXT_MESSAGE',
  ASSIGN_AGENT = 'ASSIGN_AGENT',
  ADD_TAG = 'ADD_TAG',
  RESOLVE_CONVERSATION = 'RESOLVE_CONVERSATION',
  SEND_INTERNAL_NOTIFICATION = 'SEND_INTERNAL_NOTIFICATION'
}

export interface AutomationCondition {
  field: string;
  operator: 'CONTAINS' | 'EQUALS' | 'STARTS_WITH' | 'HAS_TAG' | 'TIME_BETWEEN';
  value: string;
}

export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// Subscriptions & Billing
// ------------------------------------------

export enum BillingPlanTier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE'
}

export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIALING = 'TRIALING',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED'
}

export interface BillingPlan {
  id: string;
  tier: BillingPlanTier;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxWhatsAppAccounts: number;
  maxUsers: number;
  contactAllowance: number;
  campaignMonthlyLimit: number;
  hasApiAccess: boolean;
  hasSharedInbox: boolean;
  hasAutomations: boolean;
  hasAdvancedAnalytics: boolean;
  storageMbAllowance: number;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planId: string;
  plan?: BillingPlan;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  razorpaySubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  invoiceNumber: string;
  invoicePdfUrl?: string;
  paidAt?: string;
  createdAt: string;
}

// ------------------------------------------
// Outbox & Asynchronous Queue Jobs
// ------------------------------------------

export enum JobType {
  SEND_INDIVIDUAL_MESSAGE = 'SEND_INDIVIDUAL_MESSAGE',
  PROCESS_CAMPAIGN_BATCH = 'PROCESS_CAMPAIGN_BATCH',
  PROCESS_WEBHOOK_EVENT = 'PROCESS_WEBHOOK_EVENT',
  SYNC_TEMPLATES = 'SYNC_TEMPLATES',
  RECONCILE_STATUS = 'RECONCILE_STATUS'
}

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DEAD_LETTER = 'DEAD_LETTER'
}

export interface OutboxJob {
  id: string;
  organizationId: string;
  type: JobType;
  payload: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  idempotencyKey?: string;
  scheduledFor: string;
  lockedAt?: string;
  lockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// WebSockets & Real-Time Events
// ------------------------------------------

export enum SocketEvent {
  NEW_MESSAGE = 'message:new',
  MESSAGE_STATUS_UPDATE = 'message:status',
  CONVERSATION_UPDATED = 'conversation:update',
  AGENT_ASSIGNED = 'conversation:assigned',
  CAMPAIGN_PROGRESS = 'campaign:progress'
}

// ------------------------------------------
// API Envelope & Pagination
// ------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    timestamp: string;
  };
}

// ------------------------------------------
// Super Admin Platform Metrics
// ------------------------------------------

export interface SuperAdminDashboardStats {
  totalUsers: number;
  activeOrganizations: number;
  activeSubscriptions: number;
  connectedWhatsAppAccounts: number;
  connectedPhoneNumbers: number;
  totalMessagesSent: number;
  deliveredMessages: number;
  failedMessages: number;
  activeCampaigns: number;
  mrrInr: number;
  queueHealth: {
    pendingJobs: number;
    processingJobs: number;
    failedJobs: number;
    deadLetterJobs: number;
  };
}


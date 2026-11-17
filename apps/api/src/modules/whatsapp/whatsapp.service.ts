import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ManualConnectDto,
  ValidateManualCredentialsDto,
  EmbeddedSignupCallbackDto,
} from './dto/whatsapp.dto';
import { encryptSecret, decryptSecret, META_CONFIG } from '@convoza/configuration';
import {
  WhatsAppAccountStatus,
  QualityRating,
  MessagingTier,
  OnboardingType,
} from '@convoza/shared-types';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Validate Phone Number ID and Access Token against Meta Graph API
   */
  async validateMetaCredentials(dto: ValidateManualCredentialsDto) {
    try {
      const response = await axios.get(
        `${META_CONFIG.GRAPH_API_BASE}/${dto.phoneNumberId}`,
        {
          params: {
            fields: 'display_phone_number,verified_name,quality_rating,messaging_limit_tier,code_verification_status',
          },
          headers: {
            Authorization: `Bearer ${dto.accessToken}`,
          },
          timeout: 10000,
        }
      );

      return {
        isValid: true,
        data: response.data,
      };
    } catch (err: any) {
      this.logger.warn(`Meta validation failed: ${err.response?.data?.error?.message || err.message}`);
      return {
        isValid: false,
        error: err.response?.data?.error?.message || 'Failed to authenticate with Meta Graph API. Please verify Phone Number ID and Access Token.',
      };
    }
  }

  /**
   * Connect a WhatsApp account manually using WABA ID, Phone Number ID, and Access Token
   */
  async connectManualAccount(organizationId: string, dto: ManualConnectDto) {
    // 1. Verify credentials with Meta API
    const validation = await this.validateMetaCredentials({
      phoneNumberId: dto.phoneNumberId,
      accessToken: dto.accessToken,
    });

    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    const metaData = validation.data;

    // 2. Check for duplicate WABA or Phone Number ID
    const existingPhone = await this.prisma.phoneNumber.findUnique({
      where: { phoneNumberId: dto.phoneNumberId },
    });

    if (existingPhone && existingPhone.organizationId !== organizationId) {
      throw new ConflictException('This WhatsApp phone number is already registered to another organization');
    }

    // 3. Subscribe app to WABA webhooks on Meta (best-effort)
    let webhookSubscribed = true;
    try {
      await axios.post(
        `${META_CONFIG.GRAPH_API_BASE}/${dto.wabaId}/subscribed_apps`,
        {},
        {
          headers: { Authorization: `Bearer ${dto.accessToken}` },
          timeout: 8000,
        }
      );
    } catch (subErr: any) {
      this.logger.warn(
        `WABA webhook subscription warning (${dto.wabaId}): ${subErr.response?.data?.error?.message || subErr.message}`
      );
    }

    // 4. Encrypt the access token securely using AES-256-GCM
    const encryptedToken = encryptSecret(dto.accessToken);

    return this.prisma.$transaction(async (tx) => {
      // Upsert WhatsApp Account
      const account = await tx.whatsAppAccount.upsert({
        where: {
          organizationId_wabaId: {
            organizationId,
            wabaId: dto.wabaId,
          },
        },
        create: {
          organizationId,
          wabaId: dto.wabaId,
          name: dto.name.trim(),
          onboardingType: OnboardingType.MANUAL,
          status: WhatsAppAccountStatus.CONNECTED,
          webhookSubscribed: true,
          webhookSubscribedAt: new Date(),
        },
        update: {
          name: dto.name.trim(),
          status: WhatsAppAccountStatus.CONNECTED,
        },
      });

      // Save encrypted credentials
      await tx.integrationCredential.upsert({
        where: { whatsappAccountId: account.id },
        create: {
          whatsappAccountId: account.id,
          encryptedToken,
        },
        update: {
          encryptedToken,
        },
      });

      // Map Meta quality and tier
      const qualityRating = this.mapQualityRating(metaData.quality_rating);
      const messagingLimitTier = this.mapMessagingTier(metaData.messaging_limit_tier);

      // Create or update Phone Number record
      const phoneNumber = await tx.phoneNumber.upsert({
        where: { phoneNumberId: dto.phoneNumberId },
        create: {
          organizationId,
          whatsappAccountId: account.id,
          phoneNumberId: dto.phoneNumberId,
          displayPhoneNumber: metaData.display_phone_number || 'WhatsApp Business',
          verifiedName: metaData.verified_name || dto.name,
          qualityRating,
          messagingLimitTier,
          codeVerificationStatus: metaData.code_verification_status || 'VERIFIED',
          isDefault: true,
          lastSyncedAt: new Date(),
        },
        update: {
          displayPhoneNumber: metaData.display_phone_number || 'WhatsApp Business',
          verifiedName: metaData.verified_name || dto.name,
          qualityRating,
          messagingLimitTier,
          codeVerificationStatus: metaData.code_verification_status || 'VERIFIED',
          lastSyncedAt: new Date(),
        },
      });

      return {
        account: {
          id: account.id,
          wabaId: account.wabaId,
          name: account.name,
          status: account.status,
          webhookSubscribed: account.webhookSubscribed,
        },
        phoneNumber,
      };
    });
  }

  /**
   * Generate configuration for Meta Embedded Signup dialog
   */
  async getEmbeddedSignupSession(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return {
      appId: META_CONFIG.APP_ID,
      version: META_CONFIG.GRAPH_API_VERSION,
      configId: META_CONFIG.CONFIG_ID,
      hostedEmbeddedSignupUrl: META_CONFIG.HOSTED_ES_URL,
      state: `org_${organizationId}_${Date.now()}`,
      redirectUri: `${process.env.DASHBOARD_URL || 'https://convoza.emperorsmartsolutions.com'}/dashboard/whatsapp`,
      scope: 'whatsapp_business_management,whatsapp_business_messaging',
    };
  }

  /**
   * Handle server-side OAuth code exchange for Meta Embedded Signup
   */
  async handleEmbeddedSignupCallback(organizationId: string, dto: EmbeddedSignupCallbackDto) {
    try {
      // 1. Exchange code for access token via Graph API OAuth
      const tokenResponse = await axios.get(META_CONFIG.OAUTH_ACCESS_TOKEN_URL, {
        params: {
          client_id: META_CONFIG.APP_ID,
          client_secret: META_CONFIG.APP_SECRET,
          code: dto.code,
        },
        timeout: 10000,
      });

      const userAccessToken = tokenResponse.data.access_token;

      // 2. Resolve WABA and Phone Numbers if not provided directly
      let wabaId = dto.wabaId;
      let phoneNumberId = dto.phoneNumberId;

      if (!wabaId || !phoneNumberId) {
        // Query shared WABA accounts
        const debugTokenRes = await axios.get(`${META_CONFIG.GRAPH_API_BASE}/debug_token`, {
          params: {
            input_token: userAccessToken,
            access_token: `${META_CONFIG.APP_ID}|${META_CONFIG.APP_SECRET}`,
          },
        });
        const granularScopes = debugTokenRes.data.data.granular_scopes || [];
        const wabaScope = granularScopes.find((s: any) => s.scope === 'whatsapp_business_management');
        if (wabaScope && wabaScope.target_ids && wabaScope.target_ids.length > 0) {
          wabaId = wabaScope.target_ids[0];
        }
      }

      if (!wabaId) {
        throw new BadRequestException('Could not resolve WhatsApp Business Account from Embedded Signup');
      }

      // Query phone numbers under WABA
      const phoneRes = await axios.get(`${META_CONFIG.GRAPH_API_BASE}/${wabaId}/phone_numbers`, {
        headers: { Authorization: `Bearer ${userAccessToken}` },
      });

      const phoneList = phoneRes.data.data || [];
      if (phoneList.length === 0) {
        throw new BadRequestException('No WhatsApp phone numbers found under this WABA');
      }

      const primaryPhone = phoneNumberId
        ? phoneList.find((p: any) => p.id === phoneNumberId) || phoneList[0]
        : phoneList[0];

      // 3. Connect the account using resolved credentials
      return this.connectManualAccount(organizationId, {
        name: primaryPhone.verified_name || 'Meta Connected Account',
        wabaId,
        phoneNumberId: primaryPhone.id,
        accessToken: userAccessToken,
      });
    } catch (err: any) {
      this.logger.error(`Embedded Signup exchange failed: ${err.response?.data?.error?.message || err.message}`);
      throw new BadRequestException(
        `Meta onboarding exchange failed: ${err.response?.data?.error?.message || err.message}`
      );
    }
  }

  /**
   * Get all connected WhatsApp accounts and phone numbers for organization
   */
  async getAccounts(organizationId: string) {
    const accounts = await this.prisma.whatsAppAccount.findMany({
      where: { organizationId },
      include: {
        phoneNumbers: true,
        credentials: {
          select: {
            id: true,
            createdAt: true,
            tokenExpiresAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map((acc) => ({
      id: acc.id,
      wabaId: acc.wabaId,
      name: acc.name,
      status: acc.status,
      onboardingType: acc.onboardingType,
      webhookSubscribed: acc.webhookSubscribed,
      webhookSubscribedAt: acc.webhookSubscribedAt,
      createdAt: acc.createdAt,
      phoneNumbers: acc.phoneNumbers,
    }));
  }

  /**
   * Sync account status & phone numbers with Meta Cloud API
   */
  async syncAccount(organizationId: string, accountId: string) {
    const account = await this.prisma.whatsAppAccount.findFirst({
      where: { id: accountId, organizationId },
      include: {
        credentials: true,
        phoneNumbers: true,
      },
    });

    if (!account) {
      throw new NotFoundException('WhatsApp account not found');
    }

    if (!account.credentials) {
      throw new BadRequestException('No credentials stored for this account');
    }

    const decryptedToken = decryptSecret(account.credentials.encryptedToken);

    // Sync each phone number
    const updatedPhones = [];
    for (const phone of account.phoneNumbers) {
      try {
        const res = await axios.get(`${META_CONFIG.GRAPH_API_BASE}/${phone.phoneNumberId}`, {
          params: {
            fields: 'display_phone_number,verified_name,quality_rating,messaging_limit_tier,code_verification_status',
          },
          headers: { Authorization: `Bearer ${decryptedToken}` },
          timeout: 8000,
        });

        const data = res.data;
        const updated = await this.prisma.phoneNumber.update({
          where: { id: phone.id },
          data: {
            displayPhoneNumber: data.display_phone_number || phone.displayPhoneNumber,
            verifiedName: data.verified_name || phone.verifiedName,
            qualityRating: this.mapQualityRating(data.quality_rating),
            messagingLimitTier: this.mapMessagingTier(data.messaging_limit_tier),
            codeVerificationStatus: data.code_verification_status || phone.codeVerificationStatus,
            lastSyncedAt: new Date(),
          },
        });
        updatedPhones.push(updated);
      } catch (err: any) {
        this.logger.warn(`Failed to sync phone ${phone.phoneNumberId}: ${err.message}`);
        updatedPhones.push(phone);
      }
    }

    return {
      accountId: account.id,
      status: account.status,
      lastSyncedAt: new Date(),
      phoneNumbers: updatedPhones,
    };
  }

  /**
   * Disconnect WhatsApp account
   */
  async disconnectAccount(organizationId: string, accountId: string) {
    const account = await this.prisma.whatsAppAccount.findFirst({
      where: { id: accountId, organizationId },
    });

    if (!account) {
      throw new NotFoundException('WhatsApp account not found');
    }

    await this.prisma.whatsAppAccount.delete({
      where: { id: accountId },
    });

    return { success: true, message: 'WhatsApp account disconnected successfully' };
  }

  private mapQualityRating(rating?: string): QualityRating {
    switch (rating?.toUpperCase()) {
      case 'GREEN':
        return QualityRating.GREEN;
      case 'YELLOW':
        return QualityRating.YELLOW;
      case 'RED':
        return QualityRating.RED;
      default:
        return QualityRating.UNKNOWN;
    }
  }

  private mapMessagingTier(tier?: string): MessagingTier {
    switch (tier?.toUpperCase()) {
      case 'TIER_50':
        return MessagingTier.TIER_50;
      case 'TIER_250':
        return MessagingTier.TIER_250;
      case 'TIER_1K':
        return MessagingTier.TIER_1K;
      case 'TIER_10K':
        return MessagingTier.TIER_10K;
      case 'TIER_100K':
        return MessagingTier.TIER_100K;
      case 'TIER_UNLIMITED':
        return MessagingTier.TIER_UNLIMITED;
      default:
        return MessagingTier.TIER_1K;
    }
  }
}


import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { validateTemplateName, validateTemplateComponents } from '@convoza/validation';
import { decryptSecret, META_CONFIG } from '@convoza/configuration';
import { TemplateStatus, TemplateCategory } from '@convoza/shared-types';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTemplates(
    organizationId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      status?: string;
      whatsappAccountId?: string;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (query.whatsappAccountId) {
      where.whatsappAccountId = query.whatsappAccountId;
    }

    if (query.category) {
      where.category = query.category as TemplateCategory;
    }

    if (query.status) {
      where.status = query.status as TemplateStatus;
    }

    if (query.search) {
      where.name = { contains: query.search.toLowerCase() };
    }

    const [total, items] = await Promise.all([
      this.prisma.template.count({ where }),
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          whatsappAccount: {
            select: {
              id: true,
              name: true,
              wabaId: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTemplateById(organizationId: string, id: string) {
    const template = await this.prisma.template.findFirst({
      where: { id, organizationId },
      include: {
        whatsappAccount: {
          select: {
            id: true,
            name: true,
            wabaId: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async createTemplate(organizationId: string, dto: CreateTemplateDto) {
    // 1. Validate template name
    const nameValidation = validateTemplateName(dto.name);
    if (!nameValidation.isValid) {
      throw new BadRequestException(nameValidation.errors.join(', '));
    }

    // 2. Validate template components
    const componentsValidation = validateTemplateComponents(dto.components);
    if (!componentsValidation.isValid) {
      throw new BadRequestException(componentsValidation.errors.join(', '));
    }

    // 3. Verify WhatsApp account exists and belongs to organization (or pick active connected account)
    let account = dto.whatsappAccountId
      ? await this.prisma.whatsAppAccount.findFirst({
          where: { id: dto.whatsappAccountId, organizationId },
        })
      : null;

    if (!account) {
      account = await this.prisma.whatsAppAccount.findFirst({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!account) {
      throw new NotFoundException('No connected WhatsApp Business Account (WABA) found in this organization. Connect a WABA first.');
    }

    // 4. Check for duplicate template name in this language
    const existing = await this.prisma.template.findFirst({
      where: {
        organizationId,
        name: nameValidation.data!,
        language: dto.language || 'en_US',
      },
    });

    if (existing) {
      throw new ConflictException(
        `Template with name "${nameValidation.data}" and language "${dto.language}" already exists`
      );
    }

    const created = await this.prisma.template.create({
      data: {
        organizationId,
        whatsappAccountId: account.id,
        name: nameValidation.data!,
        language: dto.language || 'en_US',
        category: dto.category,
        status: TemplateStatus.DRAFT,
        components: dto.components as any,
      },
    });

    if (dto.submitImmediately) {
      const submitted = await this.submitToMeta(organizationId, created.id);
      return submitted.template;
    }

    return created;
  }

  async updateTemplate(organizationId: string, id: string, dto: UpdateTemplateDto) {
    const template = await this.prisma.template.findFirst({
      where: { id, organizationId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.status === TemplateStatus.APPROVED || template.status === TemplateStatus.PENDING) {
      throw new BadRequestException('Cannot edit a template that is already pending or approved by Meta');
    }

    if (dto.components) {
      const compValidation = validateTemplateComponents(dto.components);
      if (!compValidation.isValid) {
        throw new BadRequestException(compValidation.errors.join(', '));
      }
    }

    return this.prisma.template.update({
      where: { id },
      data: {
        ...(dto.category && { category: dto.category }),
        ...(dto.components && { components: dto.components as any }),
        status: TemplateStatus.DRAFT,
      },
    });
  }

  async deleteTemplate(organizationId: string, id: string) {
    const template = await this.prisma.template.findFirst({
      where: { id, organizationId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    await this.prisma.template.delete({
      where: { id },
    });

    return { success: true, message: 'Template deleted' };
  }

  /**
   * Submit template to Meta Cloud API for official approval
   */
  async submitToMeta(organizationId: string, id: string) {
    const template = await this.prisma.template.findFirst({
      where: { id, organizationId },
      include: {
        whatsappAccount: {
          include: { credentials: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (!template.whatsappAccount.credentials) {
      throw new BadRequestException(
        'WhatsApp account access token is missing. Please connect your Meta WABA credentials under WhatsApp Numbers first.'
      );
    }

    const decryptedToken = decryptSecret(template.whatsappAccount.credentials.encryptedToken);
    const metaComponents = this.buildMetaSubmissionComponents(
      template.category,
      (template.components as any[]) || []
    );

    try {
      // Format payload according to Meta WhatsApp Business API v20.0 specification
      const metaPayload = {
        name: template.name,
        category: template.category,
        language: template.language,
        components: metaComponents,
      };

      const res = await axios.post(
        `${META_CONFIG.GRAPH_API_BASE}/${template.whatsappAccount.wabaId}/message_templates`,
        metaPayload,
        {
          headers: {
            Authorization: `Bearer ${decryptedToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const metaTemplateId = res.data?.id;
      const metaStatus = res.data?.status || 'PENDING';

      const updated = await this.prisma.template.update({
        where: { id },
        data: {
          metaTemplateId,
          status: this.mapMetaStatus(metaStatus),
          rejectionReason: null,
        },
      });

      return {
        success: true,
        template: updated,
        metaResponse: res.data,
      };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.error_user_msg ||
        err.response?.data?.error?.message ||
        err.message;
      this.logger.error(`Meta template submission failed: ${errorMsg}`);

      // Keep template editable with diagnostic reason
      await this.prisma.template.update({
        where: { id },
        data: {
          status: TemplateStatus.REJECTED,
          rejectionReason: errorMsg,
        },
      });

      throw new BadRequestException(`Meta Graph API error: ${errorMsg}`);
    }
  }

  /**
   * Sync all templates under the WABA (or all connected WABAs) from Meta Cloud API
   */
  async syncTemplates(organizationId: string, whatsappAccountId?: string) {
    const accounts = whatsappAccountId
      ? await this.prisma.whatsAppAccount.findMany({
          where: { id: whatsappAccountId, organizationId },
          include: { credentials: true },
        })
      : await this.prisma.whatsAppAccount.findMany({
          where: { organizationId },
          include: { credentials: true },
        });

    const accountsWithCreds = accounts.filter((a) => a.credentials?.encryptedToken);
    if (accountsWithCreds.length === 0) {
      throw new BadRequestException(
        'No WhatsApp Business Account with live Meta credentials found. Connect your WABA in WhatsApp Numbers first.'
      );
    }

    const updatedList = [];

    for (const account of accountsWithCreds) {
      const decryptedToken = decryptSecret(account.credentials!.encryptedToken);

      try {
        const res = await axios.get(
          `${META_CONFIG.GRAPH_API_BASE}/${account.wabaId}/message_templates`,
          {
            headers: { Authorization: `Bearer ${decryptedToken}` },
            params: { limit: 100 },
            timeout: 15000,
          }
        );

        const metaTemplates = res.data?.data || [];

        for (const mt of metaTemplates) {
          const localStatus = this.mapMetaStatus(mt.status);
          const mappedCategory = this.mapMetaCategory(mt.category);

          const upserted = await this.prisma.template.upsert({
            where: {
              organizationId_name_language: {
                organizationId,
                name: mt.name,
                language: mt.language,
              },
            },
            create: {
              organizationId,
              whatsappAccountId: account.id,
              name: mt.name,
              language: mt.language,
              category: mappedCategory,
              status: localStatus,
              metaTemplateId: mt.id,
              components: mt.components || [],
              rejectionReason: mt.rejected_reason && mt.rejected_reason !== 'NONE' ? mt.rejected_reason : null,
            },
            update: {
              whatsappAccountId: account.id,
              category: mappedCategory,
              status: localStatus,
              metaTemplateId: mt.id,
              components: mt.components || [],
              rejectionReason: mt.rejected_reason && mt.rejected_reason !== 'NONE' ? mt.rejected_reason : null,
            },
          });
          updatedList.push(upserted);
        }
      } catch (err: any) {
        const msg = err.response?.data?.error?.message || err.message;
        throw new BadRequestException(`Failed to sync templates from Meta: ${msg}`);
      }
    }

    return {
      syncedCount: updatedList.length,
      templates: updatedList,
    };
  }

  /**
   * Ensure components conform to Meta Graph API v20.0 submission rules,
   * including AUTHENTICATION preset format and required `example` values for {{1}} variables.
   */
  private buildMetaSubmissionComponents(category: string, rawComponents: any[]): any[] {
    if (category === TemplateCategory.AUTHENTICATION) {
      return [
        {
          type: 'BODY',
          add_security_recommendation: true,
        },
        {
          type: 'FOOTER',
          code_expiration_minutes: 10,
        },
        {
          type: 'BUTTONS',
          buttons: [
            {
              type: 'OTP',
              otp_type: 'COPY_CODE',
              text: 'Copy code',
            },
          ],
        },
      ];
    }

    return rawComponents.map((comp) => {
      const type = (comp.type || '').toUpperCase();

      if (type === 'HEADER') {
        const format = (comp.format || 'TEXT').toUpperCase();
        if (format === 'TEXT' && typeof comp.text === 'string') {
          const vars = comp.text.match(/\{\{(\d+)\}\}/g);
          if (vars && vars.length > 0 && !comp.example?.header_text) {
            return {
              type: 'HEADER',
              format: 'TEXT',
              text: comp.text,
              example: { header_text: ['ORD-1024'] },
            };
          }
          return { type: 'HEADER', format: 'TEXT', text: comp.text, ...(comp.example ? { example: comp.example } : {}) };
        }
        return comp;
      }

      if (type === 'BODY' && typeof comp.text === 'string') {
        const vars = Array.from(new Set(comp.text.match(/\{\{(\d+)\}\}/g) || []));
        if (vars.length > 0 && !comp.example?.body_text) {
          const sampleRow = vars.map((_, idx) => (idx === 0 ? 'Alex' : `VAL${idx + 1}`));
          return {
            type: 'BODY',
            text: comp.text,
            example: { body_text: [sampleRow] },
          };
        }
        return { type: 'BODY', text: comp.text, ...(comp.example ? { example: comp.example } : {}) };
      }

      if (type === 'FOOTER' && typeof comp.text === 'string') {
        return { type: 'FOOTER', text: comp.text };
      }

      if (type === 'BUTTONS' && Array.isArray(comp.buttons)) {
        const formattedButtons = comp.buttons.map((b: any) => {
          const bType = (b.type || '').toUpperCase();
          if (bType === 'URL' && typeof b.url === 'string') {
            if (b.url.includes('{{') && !b.example) {
              return {
                type: 'URL',
                text: b.text,
                url: b.url,
                example: [b.url.replace(/\{\{\d+\}\}/g, 'track123')],
              };
            }
            return { type: 'URL', text: b.text, url: b.url, ...(b.example ? { example: b.example } : {}) };
          }
          if (bType === 'PHONE_NUMBER') {
            return { type: 'PHONE_NUMBER', text: b.text, phone_number: b.phoneNumber || b.phone_number };
          }
          return { type: 'QUICK_REPLY', text: b.text };
        });
        return { type: 'BUTTONS', buttons: formattedButtons };
      }

      return comp;
    });
  }

  private mapMetaStatus(status?: string): TemplateStatus {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return TemplateStatus.APPROVED;
      case 'REJECTED':
        return TemplateStatus.REJECTED;
      case 'PENDING':
        return TemplateStatus.PENDING;
      case 'PAUSED':
        return TemplateStatus.PAUSED;
      case 'DISABLED':
        return TemplateStatus.DISABLED;
      default:
        return TemplateStatus.PENDING;
    }
  }

  private mapMetaCategory(category?: string): TemplateCategory {
    switch (category?.toUpperCase()) {
      case 'UTILITY':
        return TemplateCategory.UTILITY;
      case 'AUTHENTICATION':
        return TemplateCategory.AUTHENTICATION;
      case 'MARKETING':
      default:
        return TemplateCategory.MARKETING;
    }
  }
}


import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, InviteMemberDto } from './dto/organization.dto';
import { UserRole, BillingPlanTier, SubscriptionStatus } from '@convoza/shared-types';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserOrganizations(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId, isActive: true },
      include: {
        organization: {
          include: {
            subscription: {
              include: { plan: true },
            },
            phoneNumbers: {
              select: {
                id: true,
                displayPhoneNumber: true,
                verifiedName: true,
                qualityRating: true,
                messagingLimitTier: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      membershipId: m.id,
      role: m.role,
      organization: m.organization,
    }));
  }

  async createOrganization(userId: string, dto: CreateOrganizationDto) {
    const baseSlug =
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'org';
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const slug = `${baseSlug}-${randomSuffix}`;

    const starterPlan = await this.prisma.plan.findFirst({
      where: { tier: BillingPlanTier.STARTER },
    });

    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.name.trim(),
          slug,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId,
          organizationId: organization.id,
          role: UserRole.ORG_OWNER,
        },
      });

      const currentPeriodEnd = new Date();
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 14);

      if (starterPlan) {
        await tx.subscription.create({
          data: {
            organizationId: organization.id,
            planId: starterPlan.id,
            status: SubscriptionStatus.TRIALING,
            currentPeriodEnd,
          },
        });
      }

      return { organization, membership };
    });
  }

  async getOrganization(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: {
          include: { plan: true },
        },
        phoneNumbers: true,
        whatsAppAccounts: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async updateOrganization(organizationId: string, dto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl || null }),
        ...(dto.supportEmail !== undefined && { supportEmail: dto.supportEmail?.trim() || null }),
        ...(dto.timezone && { timezone: dto.timezone.trim() }),
        ...(dto.gstin !== undefined && { gstin: dto.gstin?.trim() || null }),
        ...(dto.billingAddress !== undefined && { billingAddress: dto.billingAddress?.trim() || null }),
      },
    });
  }

  async getMembers(organizationId: string) {
    const members = await this.prisma.membership.findMany({
      where: { organizationId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const invitations = await this.prisma.invitation.findMany({
      where: {
        organizationId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        createdAt: m.createdAt,
        user: m.user,
      })),
      invitations,
    };
  }

  async inviteMember(organizationId: string, dto: InviteMemberDto) {
    const sub = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });
    const maxUsers = sub?.plan?.maxUsers || 5;
    const currentMemberCount = await this.prisma.membership.count({
      where: { organizationId, isActive: true },
    });
    if (currentMemberCount >= maxUsers) {
      throw new BadRequestException(
        `Team seat limit reached (${currentMemberCount}/${maxUsers}). Please upgrade your plan to invite more agents.`
      );
    }

    const emailNorm = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailNorm },
    });

    if (existingUser) {
      const existingMember = await this.prisma.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember && existingMember.isActive) {
        throw new ConflictException('User is already an active member of this organization');
      }

      // If user already has a Convoza account, attach membership directly!
      const attached = await this.prisma.membership.upsert({
        where: {
          organizationId_userId: {
            organizationId,
            userId: existingUser.id,
          },
        },
        create: {
          organizationId,
          userId: existingUser.id,
          role: dto.role,
          isActive: true,
        },
        update: {
          role: dto.role,
          isActive: true,
        },
      });
      return { addedDirectly: true, membership: attached };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.invitation.create({
      data: {
        organizationId,
        email: emailNorm,
        role: dto.role,
        token,
        expiresAt,
      },
    });
  }

  async revokeInvitation(organizationId: string, invitationId: string) {
    const inv = await this.prisma.invitation.findFirst({
      where: { id: invitationId, organizationId },
    });
    if (!inv) {
      throw new NotFoundException('Invitation not found');
    }
    await this.prisma.invitation.delete({ where: { id: invitationId } });
    return { success: true };
  }

  async updateMemberRole(organizationId: string, memberId: string, role: UserRole) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: memberId },
    });
    if (!membership || membership.organizationId !== organizationId) {
      throw new NotFoundException('Member not found');
    }
    if (membership.role === UserRole.ORG_OWNER) {
      throw new ForbiddenException('Cannot downgrade the organization owner');
    }
    return this.prisma.membership.update({
      where: { id: memberId },
      data: { role },
    });
  }

  async removeMember(organizationId: string, memberId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.organizationId !== organizationId) {
      throw new NotFoundException('Member not found');
    }

    if (membership.role === UserRole.ORG_OWNER) {
      throw new ForbiddenException('Cannot remove the organization owner');
    }

    return this.prisma.membership.delete({
      where: { id: memberId },
    });
  }
}

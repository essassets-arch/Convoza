import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { UserRole, BillingPlanTier, SubscriptionStatus } from '@convoza/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Create unique slug for organization
    const baseSlug = dto.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'org';
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const slug = `${baseSlug}-${randomSuffix}`;

    // Find default starter plan
    let starterPlan = await this.prisma.plan.findFirst({
      where: { tier: BillingPlanTier.STARTER },
    });

    if (!starterPlan) {
      // Create default starter plan if not seeded yet
      starterPlan = await this.prisma.plan.create({
        data: {
          tier: BillingPlanTier.STARTER,
          name: 'Starter Plan',
          description: 'Essential WhatsApp automation for growing teams',
          priceMonthly: 1999, // INR 1,999
          priceYearly: 19990,
          maxWhatsAppAccounts: 1,
          maxUsers: 3,
          contactAllowance: 2500,
          campaignMonthlyLimit: 5000,
          hasApiAccess: true,
          hasSharedInbox: true,
          hasAutomations: true,
          hasAdvancedAnalytics: false,
        },
      });
    }

    // Execute atomic transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          name: dto.name.trim(),
          phone: dto.phone,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName.trim(),
          slug,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: UserRole.ORG_OWNER,
        },
      });

      // Assign trial subscription for 14 days
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 14);

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planId: starterPlan!.id,
          status: SubscriptionStatus.TRIALING,
          currentPeriodEnd,
        },
      });

      return { user, organization, membership };
    });

    const tokens = await this.generateTokens(result.user.id, result.user.email);
    await this.storeSession(result.user.id, tokens.refreshToken, ipAddress, userAgent);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        phone: result.user.phone,
        isSuperAdmin: result.user.isSuperAdmin,
      },
      organization: result.organization,
      tokens,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        memberships: {
          where: { isActive: true },
          include: { organization: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeSession(user.id, tokens.refreshToken, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isSuperAdmin: user.isSuperAdmin,
      },
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
        isSuspended: m.organization.isSuspended,
      })),
      tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto, ipAddress?: string, userAgent?: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: dto.refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      throw new UnauthorizedException('Session expired or invalid refresh token');
    }

    if (!session.user.isActive) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    // Token rotation: generate new token pair
    const tokens = await this.generateTokens(session.user.id, session.user.email);

    // Update existing session with new refresh token and extended expiry
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: newExpiresAt,
        ipAddress: ipAddress || session.ipAddress,
        userAgent: userAgent || session.userAgent,
      },
    });

    return tokens;
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      await this.prisma.session.deleteMany({
        where: { refreshToken },
      });
    }
    return { loggedOut: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        isSuperAdmin: true,
        twoFactorEnabled: true,
        createdAt: true,
        memberships: {
          where: { isActive: true },
          include: {
            organization: {
              include: {
                subscription: {
                  include: {
                    plan: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-convoza-jwt-access-token-key-2026',
      expiresIn: (process.env.JWT_EXPIRATION || '7d') as any,
    });

    const refreshToken = crypto.randomBytes(40).toString('hex');

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 mins in seconds
    };
  }

  private async storeSession(userId: string, refreshToken: string, ipAddress?: string, userAgent?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }
}


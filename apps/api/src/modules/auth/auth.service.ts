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
import { RegisterDto, LoginDto, RefreshTokenDto, UpdateProfileDto } from './dto/auth.dto';
import { UserRole, BillingPlanTier, SubscriptionStatus } from '@convoza/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  private hashRefreshToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const emailNorm = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: emailNorm },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const baseSlug =
      dto.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'org';
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const slug = `${baseSlug}-${randomSuffix}`;

    let starterPlan = await this.prisma.plan.findFirst({
      where: { tier: BillingPlanTier.STARTER },
    });

    if (!starterPlan) {
      starterPlan = await this.prisma.plan.create({
        data: {
          tier: BillingPlanTier.STARTER,
          name: 'Starter Plan',
          description: 'Essential official WhatsApp Cloud API automation for growing teams',
          priceMonthly: 1999,
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

    const now = new Date();
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailNorm,
          passwordHash,
          name: dto.name.trim(),
          phone: dto.phone,
          lastLoginAt: now,
          lastLoginIp: ipAddress,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName.trim(),
          slug,
          supportEmail: emailNorm,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: UserRole.ORG_OWNER,
        },
      });

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

    const rawRefresh = crypto.randomBytes(40).toString('hex');
    const session = await this.storeSession(result.user.id, rawRefresh, ipAddress, userAgent);
    const tokens = await this.generateTokens(result.user.id, result.user.email, session.id, rawRefresh);

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

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    const rawRefresh = crypto.randomBytes(40).toString('hex');
    const session = await this.storeSession(user.id, rawRefresh, ipAddress, userAgent);
    const tokens = await this.generateTokens(user.id, user.email, session.id, rawRefresh);

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
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const hashed = this.hashRefreshToken(dto.refreshToken);
    let session = await this.prisma.session.findUnique({
      where: { refreshToken: hashed },
      include: { user: true },
    });

    // Backwards-compatible fallback for sessions created prior to SHA-256 hashing
    if (!session) {
      session = await this.prisma.session.findUnique({
        where: { refreshToken: dto.refreshToken },
        include: { user: true },
      });
    }

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      throw new UnauthorizedException('Session expired or invalid refresh token');
    }

    if (!session.user.isActive) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    const newRawRefresh = crypto.randomBytes(40).toString('hex');
    const tokens = await this.generateTokens(session.user.id, session.user.email, session.id, newRawRefresh);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: this.hashRefreshToken(newRawRefresh),
        expiresAt: newExpiresAt,
        ipAddress: ipAddress || session.ipAddress,
        userAgent: userAgent || session.userAgent,
      },
    });

    return tokens;
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      const hashed = this.hashRefreshToken(refreshToken);
      await this.prisma.session.deleteMany({
        where: {
          OR: [{ refreshToken: hashed }, { refreshToken }],
        },
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
        lastLoginAt: true,
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

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};

    if (dto.name && dto.name.trim()) {
      updateData.name = dto.name.trim();
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone?.trim() || null;
    }
    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const newEmail = dto.email.toLowerCase().trim();
      const taken = await this.prisma.user.findUnique({ where: { email: newEmail } });
      if (taken) {
        throw new ConflictException('That email address is already in use');
      }
      updateData.email = newEmail;
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required to set a new password');
      }
      const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      const salt = await bcrypt.genSalt(12);
      updateData.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isSuperAdmin: true,
      },
    });
  }

  private async generateTokens(userId: string, email: string, sessionId: string, rawRefreshToken: string) {
    const payload = { sub: userId, email, sid: sessionId };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev-only-convoza-jwt-secret-not-for-prod',
      expiresIn: (process.env.JWT_EXPIRATION || '12h') as any,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 43200,
    };
  }

  private async storeSession(userId: string, rawRefreshToken: string, ipAddress?: string, userAgent?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.session.create({
      data: {
        userId,
        refreshToken: this.hashRefreshToken(rawRefreshToken),
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }
}

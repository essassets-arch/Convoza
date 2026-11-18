import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-only-convoza-jwt-secret-not-for-prod',
    });
  }

  async validate(payload: { sub: string; email: string; sid?: string }) {
    if (payload.sid) {
      const session = await this.prisma.session.findUnique({
        where: { id: payload.sid },
        select: { id: true, expiresAt: true },
      });
      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session has been revoked or expired');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        isSuperAdmin: true,
        twoFactorEnabled: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is invalid or deactivated');
    }

    return user;
  }
}

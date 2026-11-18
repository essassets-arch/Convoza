import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@convoza/shared-types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = (request.headers['authorization'] as string) || '';
    const apiKeyHeader = (request.headers['x-api-key'] as string) || '';

    let rawApiKey = '';
    if (apiKeyHeader.startsWith('cvz_')) {
      rawApiKey = apiKeyHeader.trim();
    } else if (authHeader.startsWith('Bearer cvz_')) {
      rawApiKey = authHeader.slice(7).trim();
    }

    if (rawApiKey) {
      const hashedSecret = crypto.createHash('sha256').update(rawApiKey).digest('hex');
      const apiKeyRecord = await this.prisma.apiKey.findFirst({
        where: { hashedSecret, isActive: true },
        include: { organization: true },
      });

      if (!apiKeyRecord) {
        throw new UnauthorizedException('Invalid or revoked API key');
      }

      if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('API key has expired');
      }

      if (apiKeyRecord.organization.isSuspended) {
        throw new ForbiddenException(
          `Organization is suspended: ${apiKeyRecord.organization.suspensionReason || 'Contact support'}`
        );
      }

      // Async non-blocking lastUsedAt update
      this.prisma.apiKey
        .update({ where: { id: apiKeyRecord.id }, data: { lastUsedAt: new Date() } })
        .catch(() => {});

      request.isApiKeyAuth = true;
      request.organization = apiKeyRecord.organization;
      request.membership = {
        role: UserRole.ORG_ADMIN,
        organizationId: apiKeyRecord.organizationId,
      };
      request.user = {
        id: `apikey:${apiKeyRecord.id}`,
        email: `api-key@${apiKeyRecord.organization.slug}`,
        name: `API Key (${apiKeyRecord.name})`,
        isSuperAdmin: false,
        isActive: true,
      };
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication token is invalid or expired');
    }
    return user;
  }
}

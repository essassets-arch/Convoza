import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // API Key auth already resolved & validated organization
    if (request.isApiKeyAuth && request.organization) {
      const routePath = request.route?.path || request.originalUrl || '';
      if (routePath.includes('organizations') && request.params?.id && request.params.id !== request.organization.id) {
        throw new ForbiddenException('API key cannot access a different organization');
      }
      return true;
    }

    // Prevent cross-tenant IDOR on /organizations/:id/* routes by pinning requestedOrgId to params.id
    const isOrgParamRoute =
      (request.baseUrl?.includes('/organizations') || request.originalUrl?.includes('/api/v1/organizations/')) &&
      Boolean(request.params?.id);

    const requestedOrgId = isOrgParamRoute
      ? request.params.id
      : request.headers['x-organization-id'] ||
        request.query.organizationId ||
        request.body?.organizationId;

    // Look up memberships for this user
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (requestedOrgId) {
      const match = memberships.find((m) => m.organizationId === requestedOrgId);
      if (match) {
        if (match.organization.isSuspended && !user.isSuperAdmin) {
          throw new ForbiddenException(
            `Organization is suspended: ${match.organization.suspensionReason || 'Contact support'}`
          );
        }
        request.organization = match.organization;
        request.membership = match;
        return true;
      }

      if (user.isSuperAdmin) {
        const org = await this.prisma.organization.findUnique({
          where: { id: requestedOrgId },
        });
        if (org) {
          request.organization = org;
          request.membership = { role: 'SUPER_ADMIN', organizationId: org.id };
          return true;
        }
      }

      throw new ForbiddenException('Access denied: You do not have access to the requested organization');
    }

    // No explicit org requested: use first active membership, or Super Admin fallback
    if (memberships.length > 0) {
      const activeMembership = memberships[0];
      if (activeMembership.organization.isSuspended && !user.isSuperAdmin) {
        throw new ForbiddenException(
          `Organization is suspended: ${activeMembership.organization.suspensionReason || 'Contact support'}`
        );
      }
      request.organization = activeMembership.organization;
      request.membership = activeMembership;
      return true;
    }

    if (user.isSuperAdmin) {
      const fallbackOrg = await this.prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });
      if (fallbackOrg) {
        request.organization = fallbackOrg;
        request.membership = { role: 'SUPER_ADMIN', organizationId: fallbackOrg.id };
        return true;
      }
    }

    throw new ForbiddenException('User is not associated with any active organization');
  }
}

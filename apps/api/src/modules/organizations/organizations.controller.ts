import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
} from './dto/organization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, CurrentOrg, Roles } from '../../common/decorators';
import { UserRole } from '@convoza/shared-types';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all organizations accessible by current user' })
  async getUserOrganizations(@CurrentUser() user: any) {
    return this.orgsService.getUserOrganizations(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  async createOrganization(@CurrentUser() user: any, @Body() dto: CreateOrganizationDto) {
    return this.orgsService.createOrganization(user.id, dto);
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get details for a specific organization' })
  async getOrganization(@CurrentOrg() org: any) {
    return this.orgsService.getOrganization(org.id);
  }

  @Patch(':id')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.ORG_ADMIN, UserRole.ORG_OWNER)
  @ApiOperation({ summary: 'Update organization profile, GSTIN, or branding' })
  async updateOrganization(@CurrentOrg() org: any, @Body() dto: UpdateOrganizationDto) {
    return this.orgsService.updateOrganization(org.id, dto);
  }

  @Get(':id/members')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'List team members and pending invitations' })
  async getMembers(@CurrentOrg() org: any) {
    return this.orgsService.getMembers(org.id);
  }

  @Post(':id/invitations')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.ORG_ADMIN, UserRole.ORG_OWNER)
  @ApiOperation({ summary: 'Invite a new team member to this organization' })
  async inviteMember(@CurrentOrg() org: any, @Body() dto: InviteMemberDto) {
    return this.orgsService.inviteMember(org.id, dto);
  }

  @Delete(':id/invitations/:invitationId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.ORG_ADMIN, UserRole.ORG_OWNER)
  @ApiOperation({ summary: 'Revoke a pending team invitation' })
  async revokeInvitation(@CurrentOrg() org: any, @Param('invitationId') invitationId: string) {
    return this.orgsService.revokeInvitation(org.id, invitationId);
  }

  @Patch(':id/members/:memberId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.ORG_ADMIN, UserRole.ORG_OWNER)
  @ApiOperation({ summary: 'Update a team member role' })
  async updateMemberRole(
    @CurrentOrg() org: any,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto
  ) {
    return this.orgsService.updateMemberRole(org.id, memberId, dto.role);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.ORG_ADMIN, UserRole.ORG_OWNER)
  @ApiOperation({ summary: 'Remove a team member from this organization' })
  async removeMember(@CurrentOrg() org: any, @Param('memberId') memberId: string) {
    return this.orgsService.removeMember(org.id, memberId);
  }
}

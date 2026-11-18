import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  SuspendOrganizationDto,
  UpdateOrgBillingAdminDto,
  AdminWalletAdjustmentDto,
  AdminUpdateUserDto,
  AdminUpdatePlanDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Super Admin Operations')
@Controller('admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform-wide executive KPIs, MRR, Meta cost vs margin, templates, and telemetry' })
  async getDashboard() {
    return this.adminService.getPlatformDashboard();
  }

  @Get('organizations')
  @ApiOperation({ summary: 'List and search all registered organizations with real owner, wallet, cost, and template stats' })
  async getOrganizations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.adminService.getOrganizations({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      search,
    });
  }

  @Get('organizations/:id')
  @ApiOperation({ summary: 'Full tenant drill-down: WABAs, templates, members, wallet ledger, and 30d Meta cost' })
  async getOrganizationDetail(@Param('id') id: string) {
    return this.adminService.getOrganizationDetail(id);
  }

  @Patch('organizations/:id/suspend')
  @ApiOperation({ summary: 'Suspend an organization across API, workers, and webhooks' })
  async suspendOrg(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SuspendOrganizationDto
  ) {
    return this.adminService.suspendOrganization(id, dto, user.id);
  }

  @Patch('organizations/:id/restore')
  @ApiOperation({ summary: 'Restore a suspended organization to active status' })
  async restoreOrg(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.restoreOrganization(id, user.id);
  }

  @Patch('organizations/:id/billing')
  @ApiOperation({ summary: 'Update tenant billing mode, subscription plan/expiry, or custom per-message rates' })
  async updateOrgBilling(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrgBillingAdminDto
  ) {
    return this.adminService.updateOrganizationBilling(id, dto, user.id);
  }

  @Post('organizations/:id/wallet')
  @ApiOperation({ summary: 'Credit or debit a tenant prepaid messaging wallet' })
  async adjustOrgWallet(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: AdminWalletAdjustmentDto
  ) {
    return this.adminService.adjustOrganizationWallet(id, dto, user.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all platform users with active session counts and login telemetry' })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.adminService.getUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      search,
    });
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user status, Super Admin role, or reset password' })
  async updateUser(
    @CurrentUser() admin: any,
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto
  ) {
    return this.adminService.updateUser(id, dto, admin.id);
  }

  @Delete('users/:id/sessions')
  @ApiOperation({ summary: 'Force-logout user by revoking all active sessions immediately' })
  async revokeUserSessions(@CurrentUser() admin: any, @Param('id') id: string) {
    return this.adminService.revokeUserSessions(id, admin.id);
  }

  @Get('whatsapp')
  @ApiOperation({ summary: 'Global inventory of all connected WABAs and phone numbers across tenants' })
  async getGlobalWhatsApp() {
    return this.adminService.getGlobalWhatsAppAssets();
  }

  @Get('templates')
  @ApiOperation({ summary: 'Cross-tenant WhatsApp template inventory filterable by status and category' })
  async getGlobalTemplates(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string
  ) {
    return this.adminService.getGlobalTemplates({ status, category, search });
  }

  @Get('billing/overview')
  @ApiOperation({ summary: 'Plans, global Meta wholesale vs selling rate card, gateway config, payments, and wallet ledger' })
  async getBillingOverview() {
    return this.adminService.getBillingOverview();
  }

  @Patch('billing/plans/:id')
  @ApiOperation({ summary: 'Update SaaS plan pricing or feature quotas' })
  async updatePlan(
    @CurrentUser() admin: any,
    @Param('id') id: string,
    @Body() dto: AdminUpdatePlanDto
  ) {
    return this.adminService.updatePlan(id, dto, admin.id);
  }

  @Patch('system/settings')
  @ApiOperation({ summary: 'Update platform settings, rate cards, and Razorpay credentials' })
  async updateSystemSettings(@CurrentUser() admin: any, @Body() body: Record<string, string>) {
    return this.adminService.updateSystemSettings(body, admin.id);
  }

  @Get('system/health')
  @ApiOperation({ summary: 'Live OS/Node/Postgres resource telemetry, outbox queue jobs, and contact inquiries' })
  async getSystemHealth(@Query('jobStatus') jobStatus?: string) {
    return this.adminService.getSystemHealth(jobStatus);
  }

  @Post('system/jobs/:id/retry')
  @ApiOperation({ summary: 'Re-queue a FAILED or DEAD_LETTER outbox job' })
  async retryJob(@CurrentUser() admin: any, @Param('id') id: string) {
    return this.adminService.retryOutboxJob(id, admin.id);
  }

  @Post('system/jobs/recover-locks')
  @ApiOperation({ summary: 'Release stale PROCESSING jobs locked for over 2 minutes' })
  async recoverLocks(@CurrentUser() admin: any) {
    return this.adminService.recoverStaleOutboxLocks(admin.id);
  }

  @Delete('system/jobs/:id')
  @ApiOperation({ summary: 'Purge an outbox job' })
  async deleteJob(@CurrentUser() admin: any, @Param('id') id: string) {
    return this.adminService.deleteOutboxJob(id, admin.id);
  }

  @Patch('system/inquiries/:id')
  @ApiOperation({ summary: 'Update public website contact inquiry status' })
  async updateInquiry(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateContactInquiry(id, body?.status || 'RESOLVED');
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Platform security audit logs' })
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.adminService.getAuditLogs({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      search,
    });
  }
}

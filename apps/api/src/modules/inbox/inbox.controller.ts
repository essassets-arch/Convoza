import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InboxService } from './inbox.service';
import {
  AssignConversationDto,
  ResolveConversationDto,
  AddInternalNoteDto,
  InboxReplyDto,
} from './dto/inbox.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentOrg, CurrentUser } from '../../common/decorators';

@ApiTags('Shared WhatsApp Inbox')
@Controller('inbox')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List inbox conversations with filters, tags, and status' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getConversations(
    @CurrentOrg() org: any,
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.inboxService.getConversations(org.id, {
      status,
      assignedTo,
      unreadOnly: unreadOnly === 'true',
      search,
      currentUserId: user.id,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
    });
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get full conversation context, 24h window status, notes and details' })
  async getConversation(@CurrentOrg() org: any, @Param('id') id: string) {
    return this.inboxService.getConversationById(org.id, id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation message timeline with status receipts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMessages(
    @CurrentOrg() org: any,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.inboxService.getConversationMessages(
      org.id,
      id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 100
    );
  }

  @Post('conversations/:id/reply')
  @ApiOperation({ summary: 'Send reply within 24h customer window or approved template' })
  async reply(
    @CurrentOrg() org: any,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: InboxReplyDto
  ) {
    return this.inboxService.replyToConversation(org.id, id, user.id, dto);
  }

  @Post('conversations/:id/assign')
  @ApiOperation({ summary: 'Assign or reassign conversation to an agent' })
  async assign(
    @CurrentOrg() org: any,
    @Param('id') id: string,
    @Body() dto: AssignConversationDto
  ) {
    return this.inboxService.assignConversation(org.id, id, dto);
  }

  @Post('conversations/:id/resolve')
  @ApiOperation({ summary: 'Mark conversation as resolved or reopened' })
  async resolve(
    @CurrentOrg() org: any,
    @Param('id') id: string,
    @Body() dto: ResolveConversationDto
  ) {
    return this.inboxService.resolveConversation(org.id, id, dto);
  }

  @Post('conversations/:id/notes')
  @ApiOperation({ summary: 'Add internal team note to conversation' })
  async addNote(
    @CurrentOrg() org: any,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: AddInternalNoteDto
  ) {
    return this.inboxService.addInternalNote(org.id, id, user.id, dto);
  }
}


import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentOrg } from '../../common/decorators';

@ApiTags('WhatsApp Message Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List templates with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getTemplates(
    @CurrentOrg() org: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('whatsappAccountId') whatsappAccountId?: string
  ) {
    return this.templatesService.getTemplates(org.id, {
      page,
      limit,
      search,
      category,
      status,
      whatsappAccountId,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new WhatsApp message template draft' })
  async createTemplate(@CurrentOrg() org: any, @Body() dto: CreateTemplateDto) {
    return this.templatesService.createTemplate(org.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific template' })
  async getTemplate(@CurrentOrg() org: any, @Param('id') id: string) {
    return this.templatesService.getTemplateById(org.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft or rejected template' })
  async updateTemplate(
    @CurrentOrg() org: any,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto
  ) {
    return this.templatesService.updateTemplate(org.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a local draft template' })
  async deleteTemplate(@CurrentOrg() org: any, @Param('id') id: string) {
    return this.templatesService.deleteTemplate(org.id, id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit template to Meta for official review and approval' })
  async submitToMeta(@CurrentOrg() org: any, @Param('id') id: string) {
    return this.templatesService.submitToMeta(org.id, id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Synchronize templates with Meta Cloud API' })
  async syncTemplates(
    @CurrentOrg() org: any,
    @Body('whatsappAccountId') whatsappAccountId?: string
  ) {
    return this.templatesService.syncTemplates(org.id, whatsappAccountId);
  }
}


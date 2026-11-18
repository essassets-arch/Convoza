import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { META_CONFIG } from '@convoza/configuration';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('Platform Health & Public Endpoints')
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness and readiness check for Docker and Nginx load balancers' })
  check() {
    return {
      status: 'healthy',
      service: 'convoza-api',
      metaGraphApiVersion: META_CONFIG.GRAPH_API_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('public/contact-inquiries')
  @ApiOperation({ summary: 'Submit a public sales or support inquiry from the marketing website' })
  async createContactInquiry(@Body() body: any) {
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const message = String(body?.message || '').trim();

    if (!name || !email || !message) {
      throw new BadRequestException('Name, email, and message are required');
    }

    const inquiry = await this.prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone: body?.phone ? String(body.phone).trim() : null,
        company: body?.company ? String(body.company).trim() : null,
        topic: body?.topic ? String(body.topic).trim() : 'General Inquiry',
        message,
      },
    });

    return {
      id: inquiry.id,
      received: true,
    };
  }
}

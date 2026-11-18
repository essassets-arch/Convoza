import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  UnauthorizedException,
  Res,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { WebhooksService } from './webhooks.service';
import { META_CONFIG, verifyMetaWebhookSignature, verifyRazorpaySignature } from '@convoza/configuration';

@ApiTags('Webhooks Ingestion')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get('meta/whatsapp')
  @ApiOperation({ summary: 'Meta WhatsApp Webhook Verification Challenge endpoint' })
  verifyMetaWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response
  ) {
    const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || META_CONFIG.WEBHOOK_VERIFY_TOKEN;
    if (mode === 'subscribe' && token === expectedToken) {
      return res.status(HttpStatus.OK).send(challenge);
    }
    throw new ForbiddenException('Meta webhook challenge verification failed: token mismatch');
  }

  @Post('meta/whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive live WhatsApp status receipts and incoming messages' })
  async handleMetaWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
    @Headers('x-hub-signature-256') signature?: string
  ) {
    const appSecret = (process.env.META_APP_SECRET || '').trim();
    if (appSecret && !appSecret.includes('placeholder') && req.rawBody) {
      const valid = verifyMetaWebhookSignature(req.rawBody, signature, appSecret);
      if (!valid) {
        throw new UnauthorizedException('Invalid X-Hub-Signature-256 Meta webhook signature');
      }
    }
    return this.webhooksService.processMetaWebhook(payload);
  }

  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Razorpay payment and subscription webhooks' })
  async handleRazorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature?: string
  ) {
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
    if (webhookSecret && req.rawBody) {
      const valid = verifyRazorpaySignature(req.rawBody.toString('utf8'), signature || '', webhookSecret);
      if (!valid) {
        throw new UnauthorizedException('Invalid X-Razorpay-Signature');
      }
    }
    return this.webhooksService.processRazorpayWebhook(payload);
  }
}

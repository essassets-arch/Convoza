import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BillingModule } from './modules/billing/billing.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AdminModule } from './modules/admin/admin.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    WhatsAppModule,
    TemplatesModule,
    ContactsModule,
    MessagesModule,
    CampaignsModule,
    InboxModule,
    AutomationsModule,
    AnalyticsModule,
    BillingModule,
    WebhooksModule,
    AdminModule,
    ApiKeysModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}


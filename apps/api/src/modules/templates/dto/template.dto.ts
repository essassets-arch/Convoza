import { IsNotEmpty, IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateCategory, TemplateComponent } from '@convoza/shared-types';

export class CreateTemplateDto {
  @ApiPropertyOptional({ example: 'whatsapp_account_uuid' })
  @IsString()
  @IsOptional()
  whatsappAccountId?: string;

  @ApiPropertyOptional({ description: 'Automatically submit to Meta Graph API right after creation' })
  @IsOptional()
  submitImmediately?: boolean;

  @ApiProperty({ example: 'seasonal_sale_announcement' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'en_US', default: 'en_US' })
  @IsString()
  @IsOptional()
  language: string = 'en_US';

  @ApiProperty({ enum: TemplateCategory, default: TemplateCategory.MARKETING })
  @IsEnum(TemplateCategory)
  category!: TemplateCategory;

  @ApiProperty({
    description: 'Components array containing HEADER, BODY, FOOTER, BUTTONS',
    example: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Exclusive Offer for {{1}}',
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, get 30% off on your next purchase using code {{2}}. Valid until Sunday!',
      },
      {
        type: 'FOOTER',
        text: 'Reply STOP to unsubscribe',
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Shop Now',
            url: 'https://convoza.io/shop?ref={{1}}',
          },
          {
            type: 'QUICK_REPLY',
            text: 'Talk to an Agent',
          },
        ],
      },
    ],
  })
  @IsArray()
  components!: TemplateComponent[];
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ enum: TemplateCategory })
  @IsOptional()
  @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  components?: TemplateComponent[];
}


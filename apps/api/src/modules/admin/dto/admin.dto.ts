import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuspendOrganizationDto {
  @ApiProperty({ example: 'Violation of WhatsApp acceptable use policy' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class UpdateOrgBillingAdminDto {
  @ApiPropertyOptional({ enum: ['DIRECT_META', 'PREPAID_WALLET'] })
  @IsOptional()
  @IsString()
  billingMode?: 'DIRECT_META' | 'PREPAID_WALLET';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subscriptionStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPeriodEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rateMarketingPaise?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rateUtilityPaise?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rateAuthPaise?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rateServicePaise?: number | null;
}

export class AdminWalletAdjustmentDto {
  @ApiProperty({ enum: ['CREDIT', 'DEBIT'] })
  @IsEnum(['CREDIT', 'DEBIT'])
  type!: 'CREDIT' | 'DEBIT';

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(1)
  amountInr!: number;

  @ApiProperty({ example: 'Manual UPI bank transfer top-up' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class AdminUpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  newPassword?: string;
}

export class AdminUpdatePlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceMonthly?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceYearly?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxWhatsAppAccounts?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  contactAllowance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  campaignMonthlyLimit?: number;
}

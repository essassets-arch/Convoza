import { IsNotEmpty, IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@convoza/shared-types';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Emperor Smart Solutions' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Emperor Smart Solutions' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'support@emperorsmartsolutions.com' })
  @IsOptional()
  @IsString()
  supportEmail?: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: '24AAAAA0000A1Z5' })
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billingAddress?: string;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'agent@emperorsmartsolutions.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.AGENT })
  @IsEnum(UserRole)
  role!: UserRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;
}

import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'founder@emperorsmartsolutions.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Karan' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Emperor Smart Solutions' })
  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @ApiPropertyOptional({ example: '+918306767847' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'founder@emperorsmartsolutions.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  password!: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  twoFactorCode?: string;
}

export class RefreshTokenDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

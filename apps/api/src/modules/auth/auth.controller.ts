import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractIp(req: Request): string {
    const forwarded = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    return forwarded || (req.headers['x-real-ip'] as string) || req.ip || req.socket.remoteAddress || 'unknown';
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and organization' })
  @ApiResponse({ status: 201, description: 'User and organization successfully created' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, this.extractIp(req), req.headers['user-agent']);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiResponse({ status: 200, description: 'Authentication successful, tokens issued' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, this.extractIp(req), req.headers['user-agent']);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and retrieve new access token' })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshToken(dto, this.extractIp(req), req.headers['user-agent']);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke session' })
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto?.refreshToken || '');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile and memberships' })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile or password' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }
}

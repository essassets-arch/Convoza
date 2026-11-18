import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, HttpStatus } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
const helmet = require('helmet');
const compression = require('compression');
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { APP_CONFIG } from '@convoza/configuration';

async function bootstrap() {
  const logger = new Logger('CONVOZA-Bootstrap');

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
      throw new Error('FATAL: JWT_SECRET must be set to a strong secret in production.');
    }
    if (!process.env.CREDENTIALS_ENCRYPTION_KEY || process.env.CREDENTIALS_ENCRYPTION_KEY.length < 16) {
      throw new Error('FATAL: CREDENTIALS_ENCRYPTION_KEY must be set in production.');
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Trust reverse proxy (Host Nginx + Docker Nginx) for real client IPs
  app.set('trust proxy', 2);

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  // Sliding-window in-memory IP Rate Limiter (Brute-force & DDoS guard; webhooks exempt)
  const ipBuckets = new Map<string, { count: number; resetAt: number }>();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of ipBuckets.entries()) {
      if (v.resetAt <= now) ipBuckets.delete(k);
    }
  }, 60_000).unref();

  app.use((req: any, res: any, next: any) => {
    const path = req.originalUrl || req.url || '';
    if (path.startsWith('/api/v1/webhooks') || path.startsWith('/api/v1/health')) {
      return next();
    }
    const forwarded = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const clientIp = forwarded || req.headers['x-real-ip'] || req.ip || 'unknown';
    const isAuthOrPublic =
      path.startsWith('/api/v1/auth/login') ||
      path.startsWith('/api/v1/auth/register') ||
      path.startsWith('/api/v1/public/');

    const bucketKey = `${isAuthOrPublic ? 'strict' : 'std'}:${clientIp}`;
    const maxReq = isAuthOrPublic ? 20 : 300;
    const windowMs = 60_000;
    const now = Date.now();

    const entry = ipBuckets.get(bucketKey);
    if (!entry || entry.resetAt <= now) {
      ipBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > maxReq) {
      return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded. Please wait a minute before retrying.',
        },
      });
    }
    return next();
  });

  // Compression for high performance responses
  app.use(compression());

  // Strict CORS Configuration
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ||
    'https://convoza.emperorsmartsolutions.com,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:4000'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CONVOZA CORS policy'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe (explicit conversion only — preserves nested JSON objects/arrays intact)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );

  // Global Filters & Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('CONVOZA API — Emperor Smart Solutions')
    .setDescription(
      'Official WhatsApp Business Cloud API v20.0 SaaS REST Engine by Emperor Smart Solutions.'
    )
    .setVersion('2.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'ApiKeyAuth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'CONVOZA API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || APP_CONFIG.DEFAULT_PORT;
  await app.listen(port, '0.0.0.0');

  logger.log(`=======================================================`);
  logger.log(` CONVOZA Backend API Server running on port ${port}`);
  logger.log(` REST Endpoints Prefix: http://localhost:${port}/api/v1`);
  logger.log(` Swagger Documentation: http://localhost:${port}/api/docs`);
  logger.log(`=======================================================`);
}

bootstrap();

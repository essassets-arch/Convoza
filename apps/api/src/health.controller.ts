import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { META_CONFIG } from '@convoza/configuration';

@ApiTags('Platform Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness and readiness check for Docker and Nginx load balancers' })
  check() {
    return {
      status: 'healthy',
      service: 'convoza-api',
      metaGraphApiVersion: META_CONFIG.GRAPH_API_VERSION,
      timestamp: new Date().toISOString(),
    };
  }
}

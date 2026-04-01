import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogStreamEntry, LogStreamService } from './log-stream.service';

@ApiTags('Logs')
@Controller('logs')
@SkipThrottle()
export class LogsController {
  constructor(private readonly logStreamService: LogStreamService) {}

  @Get('recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent application/API logs (Admin)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max items (1-500)' })
  @ApiResponse({ status: 200, description: 'Recent logs list' })
  getRecent(@Query('limit') limit?: string): LogStreamEntry[] {
    const parsed = limit ? parseInt(limit, 10) : 100;
    return this.logStreamService.getRecent(Number.isNaN(parsed) ? 100 : parsed);
  }
}

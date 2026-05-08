import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LogsController } from './logs.controller';
import { LogStreamService } from './log-stream.service';

@Module({
  imports: [AuthModule],
  controllers: [LogsController],
  providers: [LogStreamService],
  exports: [LogStreamService],
})
export class LogsModule {}

import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogStreamService } from './log-stream.service';

@Module({
  controllers: [LogsController],
  providers: [LogStreamService],
  exports: [LogStreamService],
})
export class LogsModule {}

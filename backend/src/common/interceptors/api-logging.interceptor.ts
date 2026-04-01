import { Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LogStreamService } from '../../logs/log-stream.service';

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiLoggingInterceptor.name);

  constructor(private readonly logStreamService: LogStreamService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const method = req?.method || 'UNKNOWN';
    const url = req?.originalUrl || req?.url || 'UNKNOWN_URL';
    const ip = req?.ip || req?.socket?.remoteAddress || 'unknown';
    const start = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    this.logger.log(
      `[REQ:${requestId}] ${method} ${url} ip=${ip} query=${this.stringifySafe(req?.query)} body=${this.stringifySafe(req?.body)}`,
    );
    this.logStreamService.add({
      level: 'log',
      scope: 'api-request',
      message: `${method} ${url}`,
      meta: {
        requestId,
        ip,
        query: req?.query ?? null,
        body: req?.body ?? null,
      },
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const statusCode = res?.statusCode || 200;
        this.logger.log(
          `[RES:${requestId}] ${method} ${url} status=${statusCode} duration=${duration}ms`,
        );
        this.logStreamService.add({
          level: 'log',
          scope: 'api-response',
          message: `${method} ${url}`,
          meta: {
            requestId,
            statusCode,
            duration,
          },
        });
      }),
      catchError(error => {
        const duration = Date.now() - start;
        const statusCode = error?.status || res?.statusCode || 500;
        const message = error?.message || 'Unhandled error';

        this.logger.error(
          `[ERR:${requestId}] ${method} ${url} status=${statusCode} duration=${duration}ms message=${message}`,
          error?.stack,
        );
        this.logStreamService.add({
          level: 'error',
          scope: 'api-error',
          message: `${method} ${url}: ${message}`,
          meta: {
            requestId,
            statusCode,
            duration,
          },
        });

        return throwError(() => error);
      }),
    );
  }

  private stringifySafe(value: unknown): string {
    if (value === null || value === undefined) {
      return '-';
    }

    try {
      const text = JSON.stringify(value);
      return text.length > 700 ? `${text.slice(0, 700)}...` : text;
    } catch {
      return '[unserializable]';
    }
  }
}

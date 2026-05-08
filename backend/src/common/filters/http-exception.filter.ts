import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: boolean;
  error: {
    statusCode: number;
    message: string;
    details: string | string[] | null;
    path: string;
    timestamp: string;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private isSuspiciousProbePath(url: string): boolean {
    const normalized = url.toLowerCase();
    return (
      normalized.includes('/.env') ||
      normalized.includes('/.git') ||
      normalized.includes('/wp-admin') ||
      normalized.includes('/phpmyadmin') ||
      normalized.includes('/config')
    );
  }

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
    let details: string | string[] | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;

        // Handle validation errors with detailed messages
        if (responseObj.errors && Array.isArray(responseObj.errors)) {
          details = responseObj.errors;
          message = 'Dữ liệu không hợp lệ';
        } else if (Array.isArray(responseObj.message)) {
          details = responseObj.message;
          message = 'Dữ liệu không hợp lệ';
        }
      }
    }

    // Vietnamese error messages based on status code
    const vietnameseMessages: Record<number, string> = {
      400: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
      401: 'Bạn cần đăng nhập để thực hiện thao tác này.',
      403: 'Bạn không có quyền thực hiện thao tác này.',
      404: 'Không tìm thấy tài nguyên yêu cầu.',
      409: message, // Keep original conflict message
      429: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
      500: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
    };

    if (status !== 409 && vietnameseMessages[status]) {
      message = vietnameseMessages[status];
    }

    const errorMessage = exception.message || 'Unexpected error';

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${errorMessage}`,
        exception.stack,
      );
    } else if (status === 404 && this.isSuspiciousProbePath(request.url)) {
      // Common bot scans (e.g. /.env) are expected on public servers; keep logs low-noise.
      this.logger.warn(`Blocked probe request: ${request.method} ${request.url} (${status})`);
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${status} - ${errorMessage}`);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        statusCode: status,
        message,
        details,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorResponse);
  }
}

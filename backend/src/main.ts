import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ValidationError } from './common/exceptions/validation.exception';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ApiLoggingInterceptor } from './common/interceptors/api-logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
        },
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix('api');

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: errors => {
        const messages = errors.map(error => {
          const constraints = error.constraints || {};
          return Object.values(constraints).join(', ');
        });
        return new ValidationError(messages);
      },
    }),
  );

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(app.get(ApiLoggingInterceptor), new TransformInterceptor());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('NHÀ THUỐC ADK API')
    .setDescription('API documentation for ADK Pharmacy Landing Page')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`API Docs: http://localhost:${port}/api/docs`);
}
bootstrap();

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
  const configuredOrigins = [
    process.env.FRONTEND_URL || 'https://www.sieuthithuocadk.com',
    process.env.FRONTEND_URLS,
  ]
    .filter(Boolean)
    .flatMap(value => (value as string).split(','))
    .map(origin => origin.trim())
    .filter(Boolean);

  const allowedOrigins = Array.from(new Set(configuredOrigins));

  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server and same-origin requests that do not include Origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Type', 'Content-Length'],
    maxAge: 86400,
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

  const port = Number(process.env.PORT) || 9999;
  await app.listen(port);
  logger.log(`Server running on https://www.sieuthithuocadk.com (internal port ${port})`);
  logger.log('API Docs: https://www.sieuthithuocadk.com/api/docs');
}
bootstrap();

import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

const logger = new Logger('RedisModule');

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        const port = configService.get<number>('REDIS_PORT') || 6379;
        const password = configService.get<string>('REDIS_PASSWORD');
        const disableRedis = configService.get<string>('DISABLE_REDIS') === 'true';

        // If Redis is explicitly disabled, use in-memory cache
        if (disableRedis) {
          logger.log('Redis disabled by configuration. Using in-memory cache.');
          return {
            ttl: 300000, // 5 minutes default TTL
            max: 100, // Maximum number of items in cache
          };
        }

        try {
          // Try to connect to Redis
          const storeConfig: Record<string, unknown> = {
            socket: {
              host,
              port,
              connectTimeout: 5000, // 5 second timeout
            },
            ttl: 300000, // 5 minutes default TTL
          };

          // Add password if provided
          if (password) {
            storeConfig.password = password;
          }

          const store = await redisStore(storeConfig);

          logger.log(`Redis connected successfully at ${host}:${port}`);
          return { store };
        } catch (error) {
          // Fallback to in-memory cache if Redis is unavailable
          logger.warn(
            `Redis connection failed at ${host}:${port}. Using in-memory cache as fallback.`,
          );
          logger.warn(`Error: ${(error as Error)?.message || 'Unknown error'}`);
          logger.warn('To disable this warning, set DISABLE_REDIS=true in .env');

          // Return in-memory cache configuration
          return {
            ttl: 300000, // 5 minutes default TTL
            max: 100, // Maximum number of items in cache
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}

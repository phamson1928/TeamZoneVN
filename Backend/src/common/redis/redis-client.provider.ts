import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: (config: ConfigService) => {
    return new Redis({
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: config.get<number>('REDIS_PORT', 6379),
      password: config.get<string>('REDIS_PASSWORD', ''),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });
  },
  inject: [ConfigService],
};

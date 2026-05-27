import { Global, Module } from '@nestjs/common';
import { RedisClientProvider, REDIS_CLIENT } from './redis-client.provider';
import { LeaderboardRedisService } from './leaderboard.service';
import { RedisThrottlerStorage } from './redis-throttler-storage';

@Global()
@Module({
  providers: [
    RedisClientProvider,
    LeaderboardRedisService,
    RedisThrottlerStorage,
  ],
  exports: [REDIS_CLIENT, LeaderboardRedisService, RedisThrottlerStorage],
})
export class RedisModule {}

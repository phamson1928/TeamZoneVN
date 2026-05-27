import { Inject, Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis-client.provider';

export interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

/**
 * Redis-backed ThrottlerStorage cho distributed rate limiting.
 *
 * Mỗi request được đếm bằng INCR với TTL.
 * Nếu vượt quá limit, client bị block trong blockDuration ms.
 * Dùng prefix "throttler:" để tránh xung đột keys.
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const storageKey = `throttler:${throttlerName}:${key}`;
    const blockedKey = `throttler:${throttlerName}:blocked:${key}`;

    // 1. Kiểm tra xem có đang bị block không
    const blockedTtl = await this.redis.pttl(blockedKey);
    if (blockedTtl > 0) {
      return {
        totalHits: limit + 1,
        timeToExpire: Math.ceil(blockedTtl / 1000),
        isBlocked: true,
        timeToBlockExpire: Math.ceil(blockedTtl / 1000),
      };
    }

    // 2. Increment counter (atomic)
    const current = await this.redis.incr(storageKey);

    // 3. Set expiry khi là hit đầu tiên
    if (current === 1) {
      await this.redis.pexpire(storageKey, ttl);
    }

    // 4. Lấy TTL còn lại
    let timeToExpire = 0;
    const remainingPttl = await this.redis.pttl(storageKey);
    if (remainingPttl > 0) {
      timeToExpire = Math.ceil(remainingPttl / 1000);
    }

    // 5. Block nếu vượt quá limit
    if (current > limit && blockDuration > 0) {
      await this.redis.set(blockedKey, '1');
      await this.redis.pexpire(blockedKey, blockDuration);
      return {
        totalHits: current,
        timeToExpire,
        isBlocked: true,
        timeToBlockExpire: Math.ceil(blockDuration / 1000),
      };
    }

    return {
      totalHits: current,
      timeToExpire,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }
}

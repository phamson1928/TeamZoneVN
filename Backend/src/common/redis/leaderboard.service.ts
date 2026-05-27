import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis-client.provider';

@Injectable()
export class LeaderboardRedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async addScore(userId: string, score: number): Promise<void> {
    await this.redis.zadd('lb:all', score, userId);
  }

  async removeMember(userId: string): Promise<void> {
    await this.redis.zrem('lb:all', userId);
  }

  async getTop(limit = 50): Promise<{ userId: string; score: number }[]> {
    const raw = await this.redis.zrevrange(
      'lb:all',
      0,
      limit - 1,
      'WITHSCORES',
    );
    const result: { userId: string; score: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      result.push({ userId: raw[i], score: Number(raw[i + 1]) });
    }
    return result;
  }
}

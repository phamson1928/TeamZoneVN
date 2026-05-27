import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

/**
 * DatabaseKeepaliveService — Giữ Supabase database không bị pause.
 *
 * Supabase free tier tự động pause database sau 7 ngày không hoạt động.
 * Cronjob này chạy một query đơn giản (SELECT 1) mỗi 3 ngày
 * để database luôn ở trạng thái active.
 */
@Injectable()
export class DatabaseKeepaliveService {
  private readonly logger = new Logger(DatabaseKeepaliveService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Chạy vào 12:00 trưa, mỗi 3 ngày một lần.
   * Query đơn giản nhất có thể — không ảnh hưởng dữ liệu.
   */
  @Cron('0 12 */3 * *', { name: 'supabase-keepalive' })
  async keepalive() {
    this.logger.log('[Keepalive] Pinging Supabase database...');

    try {
      const result = await this.prisma.$queryRawUnsafe<[{ '?column?': number }]>(
        'SELECT 1',
      );
      this.logger.log(
        `[Keepalive] Ping successful — result: ${result[0]['?column?']}`,
      );
    } catch (error) {
      this.logger.error('[Keepalive] Ping failed:', error);
    }
  }
}

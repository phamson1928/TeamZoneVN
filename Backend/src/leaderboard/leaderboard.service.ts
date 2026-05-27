import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { Prisma } from '@prisma/client';
import { LeaderboardRedisService } from '../common/redis/leaderboard.service';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leaderboardRedis: LeaderboardRedisService,
  ) {}

  async likeUser(likerId: string, userId: string) {
    if (likerId === userId) {
      throw new ConflictException('Bạn không thể like chính mình');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) throw new NotFoundException('User không tồn tại');

    const existingLike = await this.prisma.userLike.findUnique({
      where: { userId_likerId: { userId, likerId } },
    });
    if (existingLike)
      throw new ConflictException('Bạn đã like người dùng này rồi');

    await this.prisma.userLike.create({
      data: { userId, likerId },
    });

    const likeCount = await this.prisma.userLike.count({ where: { userId } });
    await this.leaderboardRedis.addScore(userId, likeCount);
    return { message: 'Đã like thành công', likeCount };
  }

  async unlikeUser(likerId: string, userId: string) {
    const existingLike = await this.prisma.userLike.findUnique({
      where: { userId_likerId: { userId, likerId } },
    });
    if (!existingLike)
      throw new NotFoundException('Bạn chưa like người dùng này');

    await this.prisma.userLike.delete({
      where: { userId_likerId: { userId, likerId } },
    });

    const likeCount = await this.prisma.userLike.count({ where: { userId } });
    if (likeCount > 0) {
      await this.leaderboardRedis.addScore(userId, likeCount);
    } else {
      await this.leaderboardRedis.removeMember(userId);
    }
    return { message: 'Đã bỏ like thành công', likeCount };
  }

  async getLeaderboard(query: LeaderboardQueryDto) {
    const { period = 'all', gameId } = query;

    // period=all, không filter gameId → dùng Redis Sorted Sets
    if (period === 'all' && !gameId) {
      const entries = await this.leaderboardRedis.getTop();
      if (entries.length === 0) {
        return { period: 'all', gameId: null, data: [] };
      }

      const userIds = entries.map((e) => e.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds }, status: 'ACTIVE' },
        select: { id: true, username: true, avatarUrl: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      return {
        period: 'all',
        gameId: null,
        data: entries
          .filter((e) => userMap.has(e.userId))
          .map((e, i) => ({
            rank: i + 1,
            userId: e.userId,
            username: userMap.get(e.userId)!.username,
            avatarUrl: userMap.get(e.userId)!.avatarUrl,
            likeCount: e.score,
          })),
      };
    }

    // Fallback: query SQL cho period=week/month hoặc có gameId filter
    return this.queryLeaderboardFromDb(period, gameId);
  }

  private async queryLeaderboardFromDb(
    period: string,
    gameId?: string,
  ) {
    let dateFilter: Date | undefined;
    if (period === 'week') {
      dateFilter = new Date();
      dateFilter.setUTCDate(dateFilter.getUTCDate() - 7);
    } else if (period === 'month') {
      dateFilter = new Date();
      dateFilter.setUTCMonth(dateFilter.getUTCMonth() - 1);
    }

    const whereClause = dateFilter
      ? Prisma.sql`WHERE ul."createdAt" >= ${dateFilter}`
      : Prisma.empty;

    const rawLikes: { userId: string; likeCount: bigint }[] = await this.prisma
      .$queryRaw`
        SELECT ul."userId", COUNT(*) AS "likeCount"
        FROM "UserLike" ul
        ${whereClause}
        GROUP BY ul."userId"
        ORDER BY "likeCount" DESC
        LIMIT 50
      `;

    let filteredUserIds = rawLikes.map((r) => r.userId);
    if (gameId) {
      const gameProfiles = await this.prisma.userGameProfile.findMany({
        where: { gameId, userId: { in: filteredUserIds } },
        select: { userId: true },
      });
      const gameUserIds = new Set(gameProfiles.map((p) => p.userId));
      filteredUserIds = filteredUserIds.filter((id) => gameUserIds.has(id));
    }

    const likeMap = new Map(
      rawLikes.map((r) => [r.userId, Number(r.likeCount)]),
    );

    const users = await this.prisma.user.findMany({
      where: { id: { in: filteredUserIds }, status: 'ACTIVE' },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        gameProfiles: gameId
          ? {
              where: { gameId },
              select: { game: { select: { id: true, name: true } } },
            }
          : false,
      },
    });

    const ranked = users
      .map((u) => ({
        rank: 0,
        userId: u.id,
        username: u.username,
        avatarUrl: u.avatarUrl,
        likeCount: likeMap.get(u.id) ?? 0,
        gameProfile:
          gameId && u.gameProfiles ? (u.gameProfiles[0] ?? null) : undefined,
      }))
      .sort((a, b) => b.likeCount - a.likeCount)
      .map((u, idx) => ({ ...u, rank: idx + 1 }));

    return {
      period,
      gameId: gameId ?? null,
      data: ranked,
    };
  }

  async getUserLikeCount(userId: string, requesterId?: string) {
    const [likeCount, isLikedByMe] = await Promise.all([
      this.prisma.userLike.count({ where: { userId } }),
      requesterId
        ? this.prisma.userLike.findUnique({
            where: { userId_likerId: { userId, likerId: requesterId } },
          })
        : Promise.resolve(null),
    ]);

    return {
      likeCount,
      isLikedByMe: !!isLikedByMe,
    };
  }
}

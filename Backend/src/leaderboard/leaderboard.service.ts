import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeaderboardService {
    constructor(private readonly prisma: PrismaService) { }

    async likeUser(likerId: string, userId: string) {
        if (likerId === userId) {
            throw new ConflictException('Bạn không thể like chính mình');
        }

        const targetUser = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) throw new NotFoundException('User không tồn tại');

        const existingLike = await this.prisma.userLike.findUnique({
            where: { userId_likerId: { userId, likerId } },
        });
        if (existingLike) throw new ConflictException('Bạn đã like người dùng này rồi');

        await this.prisma.userLike.create({
            data: { userId, likerId },
        });

        const likeCount = await this.prisma.userLike.count({ where: { userId } });
        return { message: 'Đã like thành công', likeCount };
    }

    async unlikeUser(likerId: string, userId: string) {
        const existingLike = await this.prisma.userLike.findUnique({
            where: { userId_likerId: { userId, likerId } },
        });
        if (!existingLike) throw new NotFoundException('Bạn chưa like người dùng này');

        await this.prisma.userLike.delete({
            where: { userId_likerId: { userId, likerId } },
        });

        const likeCount = await this.prisma.userLike.count({ where: { userId } });
        return { message: 'Đã bỏ like thành công', likeCount };
    }

    async getLeaderboard(query: LeaderboardQueryDto) {
        const { period = 'all', gameId } = query;

        // Xác định mốc thời gian
        let dateFilter: Date | undefined;
        if (period === 'week') {
            dateFilter = new Date();
            dateFilter.setUTCDate(dateFilter.getUTCDate() - 7);
        } else if (period === 'month') {
            dateFilter = new Date();
            dateFilter.setUTCMonth(dateFilter.getUTCMonth() - 1);
        }

        const whereCreatedAt = dateFilter ? { gte: dateFilter } : undefined;

        const whereClause = dateFilter
            ? Prisma.sql`WHERE ul."createdAt" >= ${dateFilter}`
            : Prisma.empty;

        // Lấy top 50 users theo số like trong period
        const rawLikes: { userId: string; likeCount: bigint }[] =
            await this.prisma.$queryRaw`
        SELECT ul."userId", COUNT(*) AS "likeCount"
        FROM "UserLike" ul
        ${whereClause}
        GROUP BY ul."userId"
        ORDER BY "likeCount" DESC
        LIMIT 50
      `;

        // Nếu có filter game: lọc thêm theo game profile
        let filteredUserIds = rawLikes.map((r) => r.userId);
        if (gameId) {
            const gameProfiles = await this.prisma.userGameProfile.findMany({
                where: { gameId, userId: { in: filteredUserIds } },
                select: { userId: true },
            });
            const gameUserIds = new Set(gameProfiles.map((p) => p.userId));
            filteredUserIds = filteredUserIds.filter((id) => gameUserIds.has(id));
        }

        const likeMap = new Map(rawLikes.map((r) => [r.userId, Number(r.likeCount)]));

        // Lấy thông tin users
        const users = await this.prisma.user.findMany({
            where: { id: { in: filteredUserIds }, status: 'ACTIVE' },
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                gameProfiles: gameId
                    ? { where: { gameId }, select: { rankLevel: true, game: { select: { id: true, name: true } } } }
                    : false,
            },
        });

        // Sắp xếp lại theo like count
        const ranked = users
            .map((u) => ({
                rank: 0,
                userId: u.id,
                username: u.username,
                avatarUrl: u.avatarUrl,
                likeCount: likeMap.get(u.id) ?? 0,
                gameProfile: gameId && u.gameProfiles ? u.gameProfiles[0] ?? null : undefined,
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

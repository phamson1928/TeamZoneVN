import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardPeriod } from './dto/dashboard-query.dto.js';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private getPeriodStartDate(period: DashboardPeriod): Date {
        const days = period === DashboardPeriod.THIRTY_DAYS ? 30 : 7;
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - days);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }

    private buildDateSkeleton(
        periodStart: Date,
        days: number,
    ): { date: string; count: number }[] {
        const skeleton: { date: string; count: number }[] = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(periodStart);
            d.setUTCDate(d.getUTCDate() + i);
            skeleton.push({ date: d.toISOString().slice(0, 10), count: 0 });
        }
        return skeleton;
    }

    // ─── Stats ─────────────────────────────────────────────────────────────────

    async getStats() {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setUTCHours(0, 0, 0, 0);

        const weekStart = new Date(now);
        weekStart.setUTCDate(weekStart.getUTCDate() - 7);
        weekStart.setUTCHours(0, 0, 0, 0);

        const [
            totalUsers, activeUsers, bannedUsers,
            totalZones, openZones, closedZones,
            totalGroups, activeGroups, dissolvedGroups,
            openReports, resolvedReports,
            newUsersToday, newUsersThisWeek,
            activeUsersToday, activeUsersThisWeek,
            totalFriendships,
            totalUserLikes,
            currentQueueSize,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
            this.prisma.user.count({ where: { status: 'BANNED' } }),
            this.prisma.zone.count(),
            this.prisma.zone.count({ where: { status: 'OPEN' } }),
            this.prisma.zone.count({ where: { status: 'CLOSED' } }),
            this.prisma.group.count(),
            this.prisma.group.count({ where: { isActive: true } }),
            this.prisma.group.count({ where: { isActive: false } }),
            this.prisma.report.count({ where: { status: 'OPEN' } }),
            this.prisma.report.count({ where: { status: 'RESOLVED' } }),
            this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
            this.prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
            this.prisma.userProfile.count({ where: { lastActiveAt: { gte: todayStart } } }),
            this.prisma.userProfile.count({ where: { lastActiveAt: { gte: weekStart } } }),
            // Phase 9.6
            this.prisma.friendship.count({ where: { status: 'ACCEPTED' } }),
            this.prisma.userLike.count(),
            this.prisma.quickMatchQueue.count(),
        ]);

        return {
            users: { total: totalUsers, active: activeUsers, banned: bannedUsers },
            zones: { total: totalZones, open: openZones, closed: closedZones, full: totalZones - openZones - closedZones },
            groups: { total: totalGroups, active: activeGroups, dissolved: dissolvedGroups },
            reports: { open: openReports, resolved: resolvedReports, total: openReports + resolvedReports },
            growth: { newUsersToday, newUsersThisWeek, activeUsersToday, activeUsersThisWeek },
            social: { totalFriendships, totalUserLikes, currentQueueSize },
        };
    }

    // ─── Charts (Phase 8) ──────────────────────────────────────────────────────

    async getUserGrowthChart(period: DashboardPeriod) {
        const days = period === DashboardPeriod.THIRTY_DAYS ? 30 : 7;
        const periodStart = this.getPeriodStartDate(period);

        const rows: { day: string; count: bigint }[] = await this.prisma.$queryRaw`
      SELECT
        TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
        COUNT(*) AS count
      FROM "User"
      WHERE "createdAt" >= ${periodStart}
      GROUP BY day
      ORDER BY day ASC
    `;

        const skeleton = this.buildDateSkeleton(periodStart, days);
        const rowMap = new Map(rows.map((r) => [r.day, Number(r.count)]));
        const data = skeleton.map((s) => ({ date: s.date, count: rowMap.get(s.date) ?? 0 }));

        return { period, label: 'Đăng ký user mới theo ngày', data };
    }

    async getZonesByGameChart() {
        const rows: { gameId: string; gameName: string; count: bigint }[] =
            await this.prisma.$queryRaw`
        SELECT
          g.id          AS "gameId",
          g.name        AS "gameName",
          COUNT(z.id)   AS count
        FROM "Game" g
        LEFT JOIN "Zone" z ON z."gameId" = g.id AND z.status != 'CLOSED'
        WHERE g."isActive" = true
        GROUP BY g.id, g.name
        ORDER BY count DESC
      `;

        return {
            label: 'Phân bố Zones theo Game (không tính CLOSED)',
            data: rows.map((r) => ({ gameId: r.gameId, gameName: r.gameName, count: Number(r.count) })),
        };
    }

    async getActivityByHourChart(period: DashboardPeriod) {
        const periodStart = this.getPeriodStartDate(period);

        const rows: { hour: number; count: bigint }[] = await this.prisma.$queryRaw`
        SELECT
          EXTRACT(HOUR FROM "createdAt" AT TIME ZONE 'UTC')::int AS hour,
          COUNT(*) AS count
        FROM "Message"
        WHERE "createdAt" >= ${periodStart}
        GROUP BY hour
        ORDER BY hour ASC
      `;

        const hourMap = new Map(rows.map((r) => [r.hour, Number(r.count)]));
        const data = Array.from({ length: 24 }, (_, h) => ({
            hour: h,
            label: `${String(h).padStart(2, '0')}:00`,
            count: hourMap.get(h) ?? 0,
        }));

        return { period, label: 'Hoạt động chat theo giờ (UTC)', data };
    }

    // ─── Charts (Phase 9.6 — Social & Quick Match) ─────────────────────────────

    async getSocialEngagementChart(period: DashboardPeriod) {
        const days = period === DashboardPeriod.THIRTY_DAYS ? 30 : 7;
        const periodStart = this.getPeriodStartDate(period);

        const [likeRows, friendRows] = await Promise.all([
            this.prisma.$queryRaw<{ day: string; count: bigint }[]>`
        SELECT TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, COUNT(*) AS count
        FROM "UserLike"
        WHERE "createdAt" >= ${periodStart}
        GROUP BY day ORDER BY day ASC
      `,
            this.prisma.$queryRaw<{ day: string; count: bigint }[]>`
        SELECT TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, COUNT(*) AS count
        FROM "Friendship"
        WHERE status = 'ACCEPTED' AND "createdAt" >= ${periodStart}
        GROUP BY day ORDER BY day ASC
      `,
        ]);

        const skeleton = this.buildDateSkeleton(periodStart, days);
        const likeMap = new Map(likeRows.map((r) => [r.day, Number(r.count)]));
        const friendMap = new Map(friendRows.map((r) => [r.day, Number(r.count)]));

        const data = skeleton.map((s) => ({
            date: s.date,
            likes: likeMap.get(s.date) ?? 0,
            friendships: friendMap.get(s.date) ?? 0,
        }));

        return { period, label: 'Xu hướng tương tác xã hội (Likes & Friendships)', data };
    }

    async getQuickMatchChart(period: DashboardPeriod) {
        const periodStart = this.getPeriodStartDate(period);

        const [matchedByGame, currentQueueByGame] = await Promise.all([
            this.prisma.$queryRaw<{ gameId: string; gameName: string; count: bigint }[]>`
        SELECT g.id AS "gameId", g.name AS "gameName", COUNT(z.id) AS count
        FROM "Zone" z
        JOIN "Game" g ON g.id = z."gameId"
        WHERE z.title LIKE '[Quick Match]%' AND z."createdAt" >= ${periodStart}
        GROUP BY g.id, g.name
        ORDER BY count DESC
      `,
            this.prisma.$queryRaw<{ gameId: string; gameName: string; count: bigint }[]>`
        SELECT g.id AS "gameId", g.name AS "gameName", COUNT(q.id) AS count
        FROM "QuickMatchQueue" q
        JOIN "Game" g ON g.id = q."gameId"
        GROUP BY g.id, g.name
        ORDER BY count DESC
      `,
        ]);

        return {
            period,
            label: 'Thống kê Quick Match',
            matchedByGame: matchedByGame.map((r) => ({
                gameId: r.gameId,
                gameName: r.gameName,
                successCount: Number(r.count),
            })),
            currentQueue: currentQueueByGame.map((r) => ({
                gameId: r.gameId,
                gameName: r.gameName,
                waiting: Number(r.count),
            })),
        };
    }

    async getLeaderboardTop() {
        const rows = await this.prisma.$queryRaw<{ userId: string; likeCount: bigint }[]>`
        SELECT ul."userId", COUNT(*) AS "likeCount"
        FROM "UserLike" ul
        GROUP BY ul."userId"
        ORDER BY "likeCount" DESC
        LIMIT 10
      `;

        if (rows.length === 0) return { label: 'Top 10 Users theo số Like', data: [] };

        const userIds = rows.map((r) => r.userId);
        const likeMap = new Map(rows.map((r) => [r.userId, Number(r.likeCount)]));

        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, avatarUrl: true },
        });

        const ranked = users
            .map((u) => ({ userId: u.id, username: u.username, avatarUrl: u.avatarUrl, likeCount: likeMap.get(u.id) ?? 0 }))
            .sort((a, b) => b.likeCount - a.likeCount)
            .map((u, idx) => ({ rank: idx + 1, ...u }));

        return { label: 'Top 10 Users theo số Like', data: ranked };
    }

    // ─── Charts (Phase 10.0 — Testing & Optimization) ──────────────────────────

    async getReportsChart(period: DashboardPeriod) {
        const days = period === DashboardPeriod.THIRTY_DAYS ? 30 : 7;
        const periodStart = this.getPeriodStartDate(period);

        const rows = await this.prisma.$queryRaw<{ day: string; count: bigint }[]>`
            SELECT TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, COUNT(*) AS count
            FROM "Report"
            WHERE "createdAt" >= ${periodStart}
            GROUP BY day ORDER BY day ASC
        `;

        const skeleton = this.buildDateSkeleton(periodStart, days);
        const rowMap = new Map(rows.map((r) => [r.day, Number(r.count)]));
        const data = skeleton.map((s) => ({ date: s.date, count: rowMap.get(s.date) ?? 0 }));

        return { period, label: 'Xu hướng báo cáo (Reports) theo ngày', data };
    }

    async getEngagementChart(period: DashboardPeriod) {
        const days = period === DashboardPeriod.THIRTY_DAYS ? 30 : 7;
        const periodStart = this.getPeriodStartDate(period);

        const [zoneRows, groupRows] = await Promise.all([
            this.prisma.$queryRaw<{ day: string; count: bigint }[]>`
                SELECT TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, COUNT(*) AS count
                FROM "Zone"
                WHERE "createdAt" >= ${periodStart}
                GROUP BY day ORDER BY day ASC
            `,
            this.prisma.$queryRaw<{ day: string; count: bigint }[]>`
                SELECT TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, COUNT(*) AS count
                FROM "Group"
                WHERE "createdAt" >= ${periodStart}
                GROUP BY day ORDER BY day ASC
            `,
        ]);

        const skeleton = this.buildDateSkeleton(periodStart, days);
        const zoneMap = new Map(zoneRows.map((r) => [r.day, Number(r.count)]));
        const groupMap = new Map(groupRows.map((r) => [r.day, Number(r.count)]));

        const data = skeleton.map((s) => ({
            date: s.date,
            zones: zoneMap.get(s.date) ?? 0,
            groups: groupMap.get(s.date) ?? 0,
        }));

        return { period, label: 'Engagement: Zones & Groups mới theo ngày', data };
    }

    async getTopGamesChart() {
        const rows = await this.prisma.$queryRaw<{ gameId: string; name: string; zoneCount: bigint; userCount: bigint }[]>`
            SELECT 
                g.id AS "gameId", 
                g.name, 
                COUNT(DISTINCT z.id) AS "zoneCount",
                COUNT(DISTINCT gp.id) AS "userCount"
            FROM "Game" g
            LEFT JOIN "Zone" z ON z."gameId" = g.id
            LEFT JOIN "UserGameProfile" gp ON gp."gameId" = g.id
            WHERE g."isActive" = true
            GROUP BY g.id, g.name
            ORDER BY "zoneCount" DESC, "userCount" DESC
            LIMIT 10
        `;

        return {
            label: 'Top 10 Games phổ biến nhất',
            data: rows.map(r => ({
                gameId: r.gameId,
                name: r.name,
                zones: Number(r.zoneCount),
                activeUsers: Number(r.userCount)
            }))
        };
    }

    async getModerationChart() {
        const [statusCounts, severityCounts] = await Promise.all([
            this.prisma.report.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.report.groupBy({
                by: ['severity'],
                _count: true,
            })
        ]);

        return {
            label: 'Thống kê xử lý vi phạm (Moderation)',
            statusDistribution: statusCounts.map(r => ({ status: r.status, count: r._count })),
            severityDistribution: severityCounts.map(r => ({ severity: r.severity, count: r._count }))
        };
    }
}

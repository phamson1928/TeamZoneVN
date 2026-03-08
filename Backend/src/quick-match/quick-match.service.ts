import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { GroupsService } from 'src/groups/groups.service';
import { JoinQuickMatchDto } from './dto/join-quick-match.dto';
import { NotificationType, RankLevel } from '@prisma/client';

// Thứ tự rank để check tương thích (±1 bậc)
const RANK_ORDER: RankLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO'];

@Injectable()
export class QuickMatchService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notifications: NotificationsService,
        private readonly groupsService: GroupsService,
    ) { }

    async joinQueue(userId: string, dto: JoinQuickMatchDto) {
        const { gameId, rankLevel, requiredPlayers } = dto;

        // Kiểm tra game tồn tại
        const game = await this.prisma.game.findUnique({ where: { id: gameId } });
        if (!game) throw new NotFoundException('Game không tồn tại');

        // Upsert: nếu đã trong hàng đợi thì cập nhật, không thì tạo mới
        const entry = await this.prisma.quickMatchQueue.upsert({
            where: { userId },
            create: { userId, gameId, rankLevel, requiredPlayers },
            update: { gameId, rankLevel, requiredPlayers, createdAt: new Date() },
        });

        // Thử ghép ngay
        await this.tryMatch(userId, gameId, rankLevel, requiredPlayers);

        return { message: 'Đã vào hàng đợi Quick Match', entry };
    }

    async leaveQueue(userId: string) {
        const entry = await this.prisma.quickMatchQueue.findUnique({
            where: { userId },
        });
        if (!entry) throw new NotFoundException('Bạn không có trong hàng đợi');

        await this.prisma.quickMatchQueue.delete({ where: { userId } });
        return { message: 'Đã rời hàng đợi Quick Match' };
    }

    async getQueueStatus(userId: string) {
        const entry = await this.prisma.quickMatchQueue.findUnique({
            where: { userId },
            include: {
                game: { select: { id: true, name: true, iconUrl: true } },
            },
        });
        if (!entry) return { inQueue: false };
        return { inQueue: true, entry };
    }

    private async tryMatch(
        currentUserId: string,
        gameId: string,
        rankLevel: RankLevel,
        requiredPlayers: number,
    ) {
        const rankIndex = RANK_ORDER.indexOf(rankLevel);

        // Lấy các rank tương thích (±1 bậc)
        const compatibleRanks = RANK_ORDER.filter((_, idx) =>
            Math.abs(idx - rankIndex) <= 1,
        );

        // Tìm users trong queue cùng game, rank tương thích, cùng requiredPlayers
        const candidates = await this.prisma.quickMatchQueue.findMany({
            where: {
                gameId,
                rankLevel: { in: compatibleRanks },
                requiredPlayers,
                userId: { not: currentUserId },
            },
            orderBy: { createdAt: 'asc' }, // FIFO: người chờ lâu nhất ưu tiên
            take: requiredPlayers - 1,
        });

        // Chưa đủ người
        if (candidates.length < requiredPlayers - 1) return null;

        const allUserIds = [currentUserId, ...candidates.map((c) => c.userId)];
        const allQueueIds = [currentUserId, ...candidates.map((c) => c.userId)];

        // Tạo Zone + Group tự động trong transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Tạo Zone mới cho Quick Match
            const zone = await tx.zone.create({
                data: {
                    gameId,
                    ownerId: currentUserId,
                    title: `[Quick Match] ${(await tx.game.findUnique({ where: { id: gameId } }))?.name} - ${new Date().toLocaleTimeString('vi-VN')}`,
                    description: 'Zone được tạo tự động bởi Quick Match',
                    minRankLevel: compatibleRanks[0],
                    maxRankLevel: compatibleRanks[compatibleRanks.length - 1],
                    requiredPlayers,
                    autoApprove: true,
                    status: 'OPEN',
                },
            });

            // Tạo join requests APPROVED cho tất cả members
            await tx.zoneJoinRequest.createMany({
                data: allUserIds.map((uid) => ({
                    userId: uid,
                    zoneId: zone.id,
                    status: 'APPROVED',
                })),
            });

            // Xóa khỏi hàng đợi
            await tx.quickMatchQueue.deleteMany({
                where: { userId: { in: allQueueIds } },
            });

            return { zoneId: zone.id };
        });

        // Trigger tạo group
        const group = await this.groupsService.createGroupFromZone(result.zoneId);

        // Gửi notification cho tất cả
        await this.notifications.createMany(allUserIds, {
            type: NotificationType.QUICK_MATCH_FOUND,
            title: 'Đã tìm được đội!',
            data: {
                zoneId: result.zoneId,
                groupId: group?.id,
                gameId,
                playerCount: requiredPlayers,
            },
        });

        return result;
    }
}

import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { ReportQueryDto } from './dto/report-query.dto.js';
import { ReportStatus, ReportTargetType, NotificationType, ModerationAction } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class ReportsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
        private readonly usersService: UsersService,
    ) { }

    /**
     * Tạo report mới (User)
     * - Validate target tồn tại theo targetType
     * - Không cho phép tự report chính mình (targetType=USER)
     */
    async create(reporterId: string, createReportDto: CreateReportDto) {
        const { targetType, targetId, reason, severity } = createReportDto;

        // Không được tự report chính mình
        if (targetType === ReportTargetType.USER && targetId === reporterId) {
            throw new BadRequestException('Không thể báo cáo chính mình');
        }

        // Validate target tồn tại theo targetType
        await this.validateTargetExists(targetType, targetId);

        const report = await this.prisma.report.create({
            data: {
                reporterId,
                targetType,
                targetId,
                reason,
                severity,
            },
            include: {
                reporter: {
                    select: { id: true, username: true, avatarUrl: true },
                },
            },
        });

        return report;
    }

    /**
     * Danh sách reports (Admin)
     * - Pagination, filter status / targetType
     * - Sắp xếp mới nhất trước
     */
    async findAll(query: ReportQueryDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const where: {
            status?: ReportStatus;
            targetType?: ReportTargetType;
        } = {};

        if (query.status) where.status = query.status;
        if (query.targetType) where.targetType = query.targetType;

        const [items, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    reporter: {
                        select: { id: true, username: true, avatarUrl: true },
                    },
                    resolvedBy: {
                        select: { id: true, username: true },
                    },
                },
            }),
            this.prisma.report.count({ where }),
        ]);

        const processedItems = await Promise.all(items.map(async (item) => {
            let targetUser: any = null;
            if (item.targetType === ReportTargetType.USER) {
                targetUser = await this.prisma.user.findUnique({
                    where: { id: item.targetId },
                    select: { id: true, username: true, avatarUrl: true, warnCount: true }
                });
            } else if (item.targetType === ReportTargetType.ZONE) {
                const zone = await this.prisma.zone.findUnique({ 
                    where: { id: item.targetId }, 
                    select: { owner: { select: { id: true, username: true, avatarUrl: true, warnCount: true } } } 
                });
                if (zone?.owner) targetUser = zone.owner;
            } else if (item.targetType === ReportTargetType.GROUP) {
                const group = await this.prisma.group.findUnique({ 
                    where: { id: item.targetId }, 
                    select: { leader: { select: { id: true, username: true, avatarUrl: true, warnCount: true } } } 
                });
                if (group?.leader) targetUser = group.leader;
            }
            return {
                ...item,
                targetUser
            };
        }));

        return {
            items: processedItems,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        };
    }

    /**
     * Chi tiết 1 report (Admin)
     */
    async findOne(id: string) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: {
                reporter: {
                    select: { id: true, username: true, avatarUrl: true },
                },
                resolvedBy: {
                    select: { id: true, username: true },
                },
            },
        });

        if (!report) {
            throw new NotFoundException('Report không tồn tại');
        }

        let targetUser: any = null;
        if (report.targetType === ReportTargetType.USER) {
            targetUser = await this.prisma.user.findUnique({
                where: { id: report.targetId },
                select: { id: true, username: true, avatarUrl: true, warnCount: true }
            });
        } else if (report.targetType === ReportTargetType.ZONE) {
            const zone = await this.prisma.zone.findUnique({ 
                where: { id: report.targetId }, 
                select: { owner: { select: { id: true, username: true, avatarUrl: true, warnCount: true } } } 
            });
            if (zone?.owner) targetUser = zone.owner;
        } else if (report.targetType === ReportTargetType.GROUP) {
            const group = await this.prisma.group.findUnique({ 
                where: { id: report.targetId }, 
                select: { leader: { select: { id: true, username: true, avatarUrl: true, warnCount: true } } } 
            });
            if (group?.leader) targetUser = group.leader;
        }

        return { ...report, targetUser };
    }

    /**
     * Resolve report (Admin)
     * - Chỉ OPEN → RESOLVED
     * - Lưu ModerationAction và ghi chú
     * - Tạo ModerationLog để lưu lịch sử xử lý
     * - Thực hiện các hành động tự động (Warn/Ban)
     * - Gửi thông báo real-time tới reporter và target
     */
    async resolve(adminId: string, id: string, dto: UpdateReportDto) {
        const report = await this.prisma.report.findUnique({ where: { id } });

        if (!report) {
            throw new NotFoundException('Report không tồn tại');
        }

        if (report.status === ReportStatus.RESOLVED) {
            throw new BadRequestException('Report đã được xử lý');
        }

        // Xác định ID người dùng chịu trách nhiệm (nếu report Zone/Group thì tìm chủ phòng)
        let targetUserId = report.targetId;
        if (report.targetType === ReportTargetType.ZONE) {
            const zone = await this.prisma.zone.findUnique({ where: { id: report.targetId }, select: { ownerId: true } });
            if (!zone) throw new NotFoundException('Zone không tồn tại hoặc đã bị xóa');
            targetUserId = zone.ownerId;
        } else if (report.targetType === ReportTargetType.GROUP) {
            const group = await this.prisma.group.findUnique({ where: { id: report.targetId }, select: { leaderId: true } });
            if (!group) throw new NotFoundException('Group không tồn tại hoặc đã bị xóa');
            targetUserId = group.leaderId;
        }

        const responsibleUser = await this.prisma.user.findUnique({ where: { id: targetUserId }});
        if (!responsibleUser) {
            throw new NotFoundException('Người dùng chịu trách nhiệm không tồn tại');
        }

        // 1. Cập nhật trạng thái Report
        const resolved = await this.prisma.report.update({
            where: { id },
            data: {
                status: ReportStatus.RESOLVED,
                action: dto.action,
                resolvedAt: new Date(),
                resolvedById: adminId,
                resolutionNote: dto.resolutionNote,
            },
            include: {
                reporter: {
                    select: { id: true, username: true, avatarUrl: true },
                },
                resolvedBy: {
                    select: { id: true, username: true },
                },
            },
        });

        // 2. Tạo ModerationLog ghi lại lịch sử
        await this.prisma.moderationLog.create({
            data: {
                adminId,
                targetUserId: targetUserId,
                reportId: id,
                action: dto.action || ModerationAction.DISMISSED,
                reason: dto.resolutionNote || 'Resolved by admin',
            },
        });

        // 3. Thực hiện hành động theo loại xử lý
        if (dto.action === ModerationAction.WARNED) {
            // Lấy thông tin user để xem số lần vi phạm
            const user = await this.prisma.user.findUnique({
                where: { id: targetUserId },
                select: { warnCount: true },
            });

            const newWarnCount = (user?.warnCount || 0) + 1;
            let tempBanDays = 0;
            let isPermanent = false;

            // Logic leo thang tự động
            if (newWarnCount === 2) tempBanDays = 1;
            else if (newWarnCount === 3) tempBanDays = 7;
            else if (newWarnCount === 4) tempBanDays = 30;
            else if (newWarnCount >= 5) isPermanent = true;

            const updateData: any = { warnCount: newWarnCount };
            
            if (isPermanent) {
                updateData.status = 'BANNED';
            } else if (tempBanDays > 0) {
                const untill = new Date();
                untill.setDate(untill.getDate() + tempBanDays);
                updateData.tempBannedUntil = untill;
            }

            await this.prisma.user.update({
                where: { id: targetUserId },
                data: updateData,
            });

            // Ghi thêm log nếu có auto-ban
            if (tempBanDays > 0 || isPermanent) {
                await this.prisma.moderationLog.create({
                    data: {
                        adminId,
                        targetUserId: targetUserId,
                        action: isPermanent ? ModerationAction.BANNED : ModerationAction.TEMP_BANNED,
                        reason: `Hệ thống tự động xử lý do đạt ${newWarnCount} lần cảnh cáo.`,
                        tempBanDays: tempBanDays > 0 ? tempBanDays : undefined,
                    },
                });
            }

            await this.notificationsService.create(targetUserId, {
                type: NotificationType.ACCOUNT_WARNED,
                title: isPermanent 
                    ? 'Tài khoản đã bị khóa vĩnh viễn' 
                    : tempBanDays > 0 
                    ? `Tài khoản bị khóa tạm thời ${tempBanDays} ngày` 
                    : 'Cảnh cáo vi phạm nội dung',
                data: {
                    reason: report.reason,
                    warnCount: newWarnCount,
                    tempBanDays,
                    isPermanent,
                    note: dto.resolutionNote,
                },
            });
        } else if (dto.action === ModerationAction.BANNED) {
            // Ban thủ công bởi Admin
            await this.usersService.banUser(targetUserId, adminId);
            
            await this.notificationsService.create(targetUserId, {
                type: NotificationType.ACCOUNT_BANNED,
                title: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên',
                data: {
                    reason: report.reason,
                    note: dto.resolutionNote,
                },
            });
        }

        // 4. 🔔 Gửi thông báo real-time đến người tố cáo
        await this.notificationsService.create(report.reporterId, {
            type: NotificationType.REPORT_RESOLVED,
            title: `Báo cáo của bạn đã được xử lý`,
            data: {
                reportId: id,
                reason: report.reason,
                action: dto.action,
                resolutionNote: dto.resolutionNote,
            },
        });

        return resolved;
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private async validateTargetExists(
        targetType: ReportTargetType,
        targetId: string,
    ): Promise<void> {
        let exists = false;

        if (targetType === ReportTargetType.USER) {
            const user = await this.prisma.user.findUnique({
                where: { id: targetId },
                select: { id: true },
            });
            exists = !!user;
        } else if (targetType === ReportTargetType.ZONE) {
            const zone = await this.prisma.zone.findUnique({
                where: { id: targetId },
                select: { id: true },
            });
            exists = !!zone;
        } else if (targetType === ReportTargetType.GROUP) {
            const group = await this.prisma.group.findUnique({
                where: { id: targetId },
                select: { id: true },
            });
            exists = !!group;
        }

        if (!exists) {
            const labels: Record<ReportTargetType, string> = {
                [ReportTargetType.USER]: 'User',
                [ReportTargetType.ZONE]: 'Zone',
                [ReportTargetType.GROUP]: 'Group',
            };
            throw new NotFoundException(`${labels[targetType]} không tồn tại`);
        }
    }
}

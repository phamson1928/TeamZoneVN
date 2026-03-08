import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { ReportQueryDto } from './dto/report-query.dto.js';
import { ReportStatus, ReportTargetType } from '@prisma/client';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

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

        return {
            items,
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

        return report;
    }

    /**
     * Resolve report (Admin)
     * - Chỉ OPEN → RESOLVED
     * - Ghi resolvedAt, resolvedById, resolutionNote
     */
    async resolve(adminId: string, id: string, dto: UpdateReportDto) {
        const report = await this.prisma.report.findUnique({ where: { id } });

        if (!report) {
            throw new NotFoundException('Report không tồn tại');
        }

        if (report.status === ReportStatus.RESOLVED) {
            throw new BadRequestException('Report đã được xử lý');
        }

        return this.prisma.report.update({
            where: { id },
            data: {
                status: ReportStatus.RESOLVED,
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

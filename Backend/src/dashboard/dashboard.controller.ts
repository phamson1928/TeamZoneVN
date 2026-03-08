import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { DashboardQueryDto, DashboardPeriod } from './dto/dashboard-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@ApiTags('Dashboard (Admin)')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    // ─── Stats ─────────────────────────────────────────────────────────────────

    @Get('stats')
    @ApiOperation({
        summary: '[Admin] Tổng quan dashboard — users, zones, groups, reports, growth',
    })
    @ApiResponse({
        status: 200,
        description: 'Trả về các số liệu tổng quan cho admin dashboard',
        schema: {
            example: {
                users: { total: 1200, active: 1150, banned: 50 },
                zones: { total: 340, open: 200, closed: 120, full: 20 },
                groups: { total: 180, active: 120, dissolved: 60 },
                reports: { open: 15, resolved: 85, total: 100 },
                growth: {
                    newUsersToday: 12,
                    newUsersThisWeek: 75,
                    activeUsersToday: 230,
                    activeUsersThisWeek: 850,
                },
            },
        },
    })
    getStats() {
        return this.dashboardService.getStats();
    }

    // ─── Charts ────────────────────────────────────────────────────────────────

    @Get('charts/users')
    @ApiOperation({
        summary: '[Admin] Chart tăng trưởng users theo ngày',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: DashboardPeriod,
        description: '7d = 7 ngày gần nhất, 30d = 30 ngày gần nhất',
    })
    @ApiResponse({
        status: 200,
        description: 'Mảng dữ liệu (date, count) để vẽ line/bar chart tăng trưởng user',
        schema: {
            example: {
                period: '7d',
                label: 'Đăng ký user mới theo ngày',
                data: [
                    { date: '2026-03-01', count: 10 },
                    { date: '2026-03-02', count: 8 },
                ],
            },
        },
    })
    getUserGrowthChart(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getUserGrowthChart(
            query.period ?? DashboardPeriod.SEVEN_DAYS,
        );
    }

    @Get('charts/zones')
    @ApiOperation({
        summary: '[Admin] Chart phân bố zones theo game',
    })
    @ApiResponse({
        status: 200,
        description: 'Mảng (gameId, gameName, count) để vẽ pie/bar chart phân bố zone theo game',
        schema: {
            example: {
                label: 'Phân bố Zones theo Game (không tính CLOSED)',
                data: [
                    { gameId: 'uuid-1', gameName: 'Liên Quân', count: 45 },
                    { gameId: 'uuid-2', gameName: 'PUBG', count: 30 },
                ],
            },
        },
    })
    getZonesByGameChart() {
        return this.dashboardService.getZonesByGameChart();
    }

    @Get('charts/activity')
    @ApiOperation({
        summary: '[Admin] Chart hoạt động theo giờ (peak hours)',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: DashboardPeriod,
        description: 'Period để xét dữ liệu messages: 7d hoặc 30d',
    })
    @ApiResponse({
        status: 200,
        description: 'Mảng 24 phần tử (hour 0-23, count) để vẽ bar chart peak hours',
        schema: {
            example: {
                period: '7d',
                label: 'Hoạt động chat theo giờ (UTC)',
                data: [
                    { hour: 0, label: '00:00', count: 12 },
                    { hour: 20, label: '20:00', count: 340 },
                ],
            },
        },
    })
    getActivityByHourChart(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getActivityByHourChart(
            query.period ?? DashboardPeriod.SEVEN_DAYS,
        );
    }

    // ─── Charts (Phase 9.6) ────────────────────────────────────────────────────

    @Get('charts/social-engagement')
    @ApiOperation({ summary: '[Admin] Chart xu hướng tương tác xã hội (Likes & Friendships theo ngày)' })
    @ApiQuery({ name: 'period', required: false, enum: DashboardPeriod })
    getSocialEngagementChart(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getSocialEngagementChart(
            query.period ?? DashboardPeriod.SEVEN_DAYS,
        );
    }

    @Get('charts/quick-match')
    @ApiOperation({ summary: '[Admin] Chart thống kê Quick Match (ghép thành công theo game)' })
    @ApiQuery({ name: 'period', required: false, enum: DashboardPeriod })
    getQuickMatchChart(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getQuickMatchChart(
            query.period ?? DashboardPeriod.SEVEN_DAYS,
        );
    }

    @Get('charts/leaderboard-top')
    @ApiOperation({ summary: '[Admin] Top 10 users theo số like (widget)' })
    getLeaderboardTop() {
        return this.dashboardService.getLeaderboardTop();
    }

    // ─── Charts (Phase 10.0) ───────────────────────────────────────────────────

    @Get('charts/reports')
    @ApiOperation({ summary: '[Admin] Chart xu hướng báo cáo (Reports theo ngày)' })
    @ApiQuery({ name: 'period', required: false, enum: DashboardPeriod })
    getReportsChart(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getReportsChart(
            query.period ?? DashboardPeriod.SEVEN_DAYS,
        );
    }

    @Get('charts/engagement')
    @ApiOperation({ summary: '[Admin] Chart mức độ tương tác (Zones & Groups mới)' })
    @ApiQuery({ name: 'period', required: false, enum: DashboardPeriod })
    getEngagementChart(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getEngagementChart(
            query.period ?? DashboardPeriod.SEVEN_DAYS,
        );
    }

    @Get('charts/top-games')
    @ApiOperation({ summary: '[Admin] Chart top 10 games phổ biến nhất' })
    getTopGamesChart() {
        return this.dashboardService.getTopGamesChart();
    }

    @Get('charts/moderation')
    @ApiOperation({ summary: '[Admin] Chart thống kê xử lý vi phạm (Moderation)' })
    getModerationChart() {
        return this.dashboardService.getModerationChart();
    }
}

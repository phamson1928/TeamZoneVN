import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { ReportQueryDto } from './dto/report-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  // ─── Admin Routes (trước :id để tránh conflict) ───────────────────────────

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '[Admin] Danh sách tất cả reports (pagination + filter)' })
  @ApiResponse({ status: 200, description: 'Danh sách reports' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['OPEN', 'RESOLVED'],
    description: 'Lọc theo trạng thái',
  })
  @ApiQuery({
    name: 'targetType',
    required: false,
    enum: ['USER', 'ZONE', 'GROUP'],
    description: 'Lọc theo loại đối tượng',
  })
  findAll(@Query() query: ReportQueryDto) {
    return this.reportsService.findAll(query);
  }

  // ─── User Routes ──────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Tạo report mới (User)' })
  @ApiResponse({ status: 201, description: 'Report đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Không thể báo cáo chính mình' })
  @ApiResponse({ status: 404, description: 'Đối tượng báo cáo không tồn tại' })
  create(
    @CurrentUser('sub') userId: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.reportsService.create(userId, createReportDto);
  }

  // ─── Admin Routes with :id ────────────────────────────────────────────────

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '[Admin] Chi tiết 1 report' })
  @ApiParam({ name: 'id', description: 'Report ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Chi tiết report' })
  @ApiResponse({ status: 404, description: 'Report không tồn tại' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '[Admin] Resolve report (OPEN → RESOLVED)' })
  @ApiParam({ name: 'id', description: 'Report ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Report đã được resolve' })
  @ApiResponse({ status: 400, description: 'Report đã được xử lý rồi' })
  @ApiResponse({ status: 404, description: 'Report không tồn tại' })
  resolve(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.resolve(adminId, id, updateReportDto);
  }
}

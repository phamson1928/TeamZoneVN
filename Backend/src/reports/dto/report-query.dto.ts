import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    Max,
    Min,
} from 'class-validator';
import { ReportStatus, ReportTargetType } from '@prisma/client';

export class ReportQueryDto {
    @ApiPropertyOptional({
        description: 'Trang (bắt đầu từ 1)',
        default: 1,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Số lượng mỗi trang',
        default: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Lọc theo trạng thái report',
        enum: ReportStatus,
        example: ReportStatus.OPEN,
    })
    @IsOptional()
    @IsEnum(ReportStatus)
    status?: ReportStatus;

    @ApiPropertyOptional({
        description: 'Lọc theo loại đối tượng bị report',
        enum: ReportTargetType,
        example: ReportTargetType.USER,
    })
    @IsOptional()
    @IsEnum(ReportTargetType)
    targetType?: ReportTargetType;
}

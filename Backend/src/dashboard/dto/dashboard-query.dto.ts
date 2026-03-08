import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DashboardPeriod {
    SEVEN_DAYS = '7d',
    THIRTY_DAYS = '30d',
}

export class DashboardQueryDto {
    @ApiPropertyOptional({
        enum: DashboardPeriod,
        default: DashboardPeriod.SEVEN_DAYS,
        description: 'Khoảng thời gian: 7d = 7 ngày, 30d = 30 ngày',
    })
    @IsOptional()
    @IsEnum(DashboardPeriod)
    period?: DashboardPeriod = DashboardPeriod.SEVEN_DAYS;
}

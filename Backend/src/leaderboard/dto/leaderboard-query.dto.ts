import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LeaderboardQueryDto {
    @ApiPropertyOptional({ description: 'Period: week | month | all', enum: ['week', 'month', 'all'], default: 'all' })
    @IsOptional()
    @IsString()
    period?: 'week' | 'month' | 'all' = 'all';

    @ApiPropertyOptional({ description: 'Lọc theo game ID' })
    @IsOptional()
    @IsString()
    gameId?: string;
}

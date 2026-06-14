import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    description: 'Khoảng thời gian: week (tuần) | month (tháng) | all (tất cả)',
    enum: ['week', 'month', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsString()
  period?: 'week' | 'month' | 'all' = 'all';

  @ApiPropertyOptional({ description: 'Lọc theo game ID' })
  @IsOptional()
  @IsString()
  gameId?: string;
}

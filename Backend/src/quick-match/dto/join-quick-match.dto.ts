import { ApiProperty } from '@nestjs/swagger';
import { RankLevel } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class JoinQuickMatchDto {
    @ApiProperty({ description: 'ID của game muốn ghép' })
    @IsString()
    @IsNotEmpty()
    gameId: string;

    @ApiProperty({ enum: RankLevel, description: 'Rank level của người dùng' })
    @IsEnum(RankLevel)
    @IsNotEmpty()
    rankLevel: RankLevel;

    @ApiProperty({ description: 'Số người chơi cần thiết (2-10)', minimum: 2, maximum: 10 })
    @IsInt()
    @Min(2)
    @Max(10)
    requiredPlayers: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateReportDto {
    @ApiPropertyOptional({
        description: 'Ghi chú khi resolve report (tối đa 500 ký tự)',
        maxLength: 500,
        example: 'Đã kiểm tra và ban user vi phạm. Case resolved.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
    resolutionNote?: string;
}

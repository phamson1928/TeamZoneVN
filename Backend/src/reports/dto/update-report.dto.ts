import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ModerationAction } from '@prisma/client';

export class UpdateReportDto {
  @ApiPropertyOptional({
    description: 'Hành động xử lý báo cáo',
    enum: ModerationAction,
    example: ModerationAction.WARNED,
  })
  @IsOptional()
  @IsEnum(ModerationAction, { message: 'Hành động xử lý không hợp lệ' })
  action?: ModerationAction;

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

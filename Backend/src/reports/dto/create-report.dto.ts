import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, MaxLength, MinLength, IsOptional } from 'class-validator';
import { ReportTargetType, ReportSeverity } from '@prisma/client';

export class CreateReportDto {
    @ApiProperty({
        description: 'Loại đối tượng bị báo cáo',
        enum: ReportTargetType,
        example: ReportTargetType.USER,
    })
    @IsEnum(ReportTargetType)
    targetType: ReportTargetType;

    @ApiProperty({
        description: 'ID của đối tượng bị báo cáo (UUID)',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    @IsUUID()
    targetId: string;

    @ApiProperty({
        description: 'Lý do báo cáo (10-500 ký tự)',
        minLength: 10,
        maxLength: 500,
        example: 'Người dùng này có hành vi spam và toxic trong chat nhóm.',
    })
    @IsString()
    @MinLength(10, { message: 'Lý do báo cáo phải có ít nhất 10 ký tự' })
    @MaxLength(500, { message: 'Lý do báo cáo không được vượt quá 500 ký tự' })
    reason: string;

    @ApiProperty({
        description: 'Mức độ nghiêm trọng của vi phạm',
        enum: ReportSeverity,
        example: ReportSeverity.MEDIUM,
        required: false,
    })
    @IsOptional()
    @IsEnum(ReportSeverity)
    severity?: ReportSeverity = ReportSeverity.MEDIUM;
}

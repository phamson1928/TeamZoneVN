import { ApiProperty } from '@nestjs/swagger';
import { ZoneInviteStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class HandleZoneInviteDto {
    @ApiProperty({ enum: ZoneInviteStatus, description: 'ACCEPTED hoặc DECLINED' })
    @IsEnum(ZoneInviteStatus)
    @IsNotEmpty()
    status: ZoneInviteStatus;
}

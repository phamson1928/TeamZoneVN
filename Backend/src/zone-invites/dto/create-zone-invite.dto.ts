import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateZoneInviteDto {
    @ApiProperty({ description: 'ID của người bạn bè được mời' })
    @IsString()
    @IsNotEmpty()
    inviteeId: string;
}

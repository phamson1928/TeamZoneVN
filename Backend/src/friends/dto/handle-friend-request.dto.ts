import { FriendStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class HandleFriendRequestDto {
    @ApiProperty({ enum: FriendStatus, description: "ACCEPTED or REJECTED" })
    @IsEnum(FriendStatus)
    @IsNotEmpty()
    status: FriendStatus;
}

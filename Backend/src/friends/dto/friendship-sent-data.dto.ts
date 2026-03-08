import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class FriendshipSentDataDto {
    @ApiProperty({ description: "ID of the user to send friend request to" })
    @IsString()
    @IsNotEmpty()
    receiverId: string;
}
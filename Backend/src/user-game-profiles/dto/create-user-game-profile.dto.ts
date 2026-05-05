import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUserGameProfileDto {
  @ApiProperty({ example: 'game-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  gameId!: string;
}

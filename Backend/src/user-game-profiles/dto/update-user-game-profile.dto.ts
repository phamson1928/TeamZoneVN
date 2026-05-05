import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

// UpdateUserGameProfileDto: không còn trường nào để cập nhật ngoài gameId
// Giữ file lại để không break import, nhưng thực tế endpoint update có thể bị loại bỏ
export class UpdateUserGameProfileDto {
  @ApiProperty({ example: 'game-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  gameId!: string;
}

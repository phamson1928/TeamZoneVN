import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'I love playing FPS games!',
    description: 'Giới thiệu người dùng',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Giới thiệu không được vượt quá 500 ký tự' })
  bio?: string;

  @ApiProperty({ example: 'Cạnh tranh', description: 'Phong cách chơi' })
  @IsOptional()
  @MaxLength(50, { message: 'Phong cách chơi không được vượt quá 50 ký tự' })
  playStyle?: string;

  @ApiProperty({ example: 'GMT+7', description: 'Múi giờ' })
  @IsOptional()
  @MaxLength(50, { message: 'Múi giờ không được vượt quá 50 ký tự' })
  timezone?: string;

  @ApiProperty({
    example: 'Discord: username#1234',
    description: 'Thông tin liên lạc',
  })
  @IsOptional()
  @MaxLength(500, {
    message: 'Thông tin liên lạc không được vượt quá 500 ký tự',
  })
  contactInfo?: string;
}

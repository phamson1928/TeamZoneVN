import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123def456...',
    description: 'Token đặt lại mật khẩu nhận từ email',
  })
  @IsString()
  token!: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Mật khẩu mới (min 6 ký tự)',
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
  newPassword!: string;
}

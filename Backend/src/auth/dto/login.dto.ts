import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email người dùng',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Mật khẩu',
  })
  @IsString()
  @MinLength(1, { message: 'Mật khẩu không được để trống' })
  password!: string;
}

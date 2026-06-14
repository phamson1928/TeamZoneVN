import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email người dùng',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty({
    example: 'gamer123',
    description: 'Tên đăng nhập (3-30 ký tự, chữ và số)',
  })
  @IsString()
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @MaxLength(30, { message: 'Tên đăng nhập không được vượt quá 30 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới',
  })
  username!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
  password!: string;
}

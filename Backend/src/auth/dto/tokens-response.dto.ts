import { ApiProperty } from '@nestjs/swagger';

export class TokensResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Mã truy cập JWT',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Mã làm mới JWT',
  })
  refreshToken!: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID người dùng',
  })
  userId!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email người dùng',
  })
  email!: string;

  @ApiProperty({
    example: 'gamer123',
    description: 'Tên đăng nhập',
  })
  username!: string;

  @ApiProperty({ type: TokensResponseDto })
  tokens!: TokensResponseDto;
}

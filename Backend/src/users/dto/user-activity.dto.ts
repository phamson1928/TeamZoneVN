import { ApiProperty } from '@nestjs/swagger';

export class UserActivityDto {
  @ApiProperty({ example: 'LOGIN', description: 'Loại hoạt động' })
  type!: string;

  @ApiProperty({
    example: 'Người dùng đã đăng nhập hệ thống',
    description: 'Mô tả hoạt động',
  })
  description!: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Thời gian hoạt động',
  })
  createdAt!: Date;

  @ApiProperty({ description: 'ID đối tượng liên quan', required: false })
  relatedId?: string;

  @ApiProperty({ description: 'Loại đối tượng liên quan', required: false })
  relatedType?: string;
}

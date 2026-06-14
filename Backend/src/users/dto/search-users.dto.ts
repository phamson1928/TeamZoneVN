import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SearchUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo email hoặc tên đăng nhập' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo vai trò',
    enum: ['ADMIN', 'USER'],
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'USER'])
  role?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái',
    enum: ['ACTIVE', 'BANNED'],
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'BANNED'])
  status?: string;
}

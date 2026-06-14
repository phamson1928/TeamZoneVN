import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Số trang (bắt đầu từ 1)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng mục mỗi trang',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 10);
  }

  get take(): number {
    return this.limit ?? 10;
  }
}

export class PaginationMetaDto {
  @ApiPropertyOptional({ description: 'Số trang hiện tại' })
  page!: number;

  @ApiPropertyOptional({ description: 'Số lượng mục mỗi trang' })
  limit!: number;

  @ApiPropertyOptional({ description: 'Tổng số mục' })
  total!: number;

  @ApiPropertyOptional({ description: 'Tổng số trang' })
  totalPages!: number;

  @ApiPropertyOptional({ description: 'Có trang tiếp theo không' })
  hasNextPage!: boolean;

  @ApiPropertyOptional({ description: 'Có trang trước không' })
  hasPreviousPage!: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

export class PaginatedResponseDto<T> {
  data!: T[];
  meta!: PaginationMetaDto;

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data;
    this.meta = new PaginationMetaDto(page, limit, total);
  }
}

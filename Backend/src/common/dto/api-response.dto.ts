import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Trạng thái phản hồi', example: true })
  success!: boolean;

  @ApiPropertyOptional({ description: 'Dữ liệu phản hồi' })
  data?: T;

  @ApiPropertyOptional({ description: 'Thông báo phản hồi' })
  message?: string;

  @ApiPropertyOptional({ description: 'Mã lỗi cho các phản hồi lỗi' })
  errorCode?: string;

  @ApiPropertyOptional({ description: 'Thời gian phản hồi' })
  timestamp?: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto({
      success: true,
      data,
      message,
    });
  }

  static error<T>(message: string, errorCode?: string): ApiResponseDto<T> {
    return new ApiResponseDto({
      success: false,
      message,
      errorCode,
    });
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Kiểm tra trạng thái API' })
  @ApiResponse({ status: 200, description: 'API đang hoạt động' })
  getHello(): { status: string; message: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Kiểm tra trạng thái chi tiết' })
  @ApiResponse({ status: 200, description: 'Chi tiết trạng thái API' })
  getHealth(): { status: string; message: string; timestamp: string } {
    return this.appService.getHealth();
  }
}

import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Blocks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post(':id')
  @ApiOperation({ summary: 'Chặn người dùng' })
  @ApiParam({ name: 'id', description: 'ID người dùng cần chặn/bỏ chặn' })
  @ApiResponse({ status: 200, description: 'Chặn người dùng thành công' })
  block(
    @Request() req: { user: { sub: string } },
    @Param('id') blockedId: string,
  ) {
    const blockerId: string = req.user.sub;
    return this.blocksService.blockUser(blockerId, blockedId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Bỏ chặn người dùng' })
  @ApiParam({ name: 'id', description: 'ID người dùng cần chặn/bỏ chặn' })
  @ApiResponse({ status: 200, description: 'Bỏ chặn người dùng thành công' })
  unblock(
    @Request() req: { user: { sub: string } },
    @Param('id') blockedId: string,
  ) {
    const blockerId: string = req.user.sub;
    return this.blocksService.unblockUser(blockerId, blockedId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách người dùng đã chặn' })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng đã chặn' })
  getBlocks(@Request() req: { user: { sub: string } }) {
    const blockerId: string = req.user.sub;
    return this.blocksService.getMyBlockedUsers(blockerId);
  }
}

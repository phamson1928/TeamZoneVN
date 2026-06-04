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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post(':id')
  @ApiOperation({ summary: 'Block a user' })
  block(
    @Request() req: { user: { sub: string } },
    @Param('id') blockedId: string,
  ) {
    const blockerId: string = req.user.sub;
    return this.blocksService.blockUser(blockerId, blockedId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Unblock a user' })
  unblock(
    @Request() req: { user: { sub: string } },
    @Param('id') blockedId: string,
  ) {
    const blockerId: string = req.user.sub;
    return this.blocksService.unblockUser(blockerId, blockedId);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of blocked users' })
  getBlocks(@Request() req: { user: { sub: string } }) {
    const blockerId: string = req.user.sub;
    return this.blocksService.getMyBlockedUsers(blockerId);
  }
}

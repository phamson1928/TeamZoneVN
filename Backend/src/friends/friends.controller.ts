import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Friends')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) { }

  @Post('request/:userId')
  @ApiOperation({ summary: 'Gửi lời mời kết bạn' })
  sendRequest(
    @CurrentUser('sub') senderId: string,
    @Param('userId') receiverId: string,
  ) {
    return this.friendsService.sendRequest(senderId, receiverId);
  }

  @Patch('request/:id')
  @ApiOperation({ summary: 'Chấp nhận lời mời kết bạn' })
  acceptRequest(
    @CurrentUser('sub') userId: string,
    @Param('id') friendshipId: string,
  ) {
    return this.friendsService.acceptRequest(userId, friendshipId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách bạn bè (pagination)' })
  getFriends(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.friendsService.getFriends(userId, Number(page) || 1, Number(limit) || 20);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Lời mời đang chờ (incoming)' })
  getPendingRequests(@CurrentUser('sub') userId: string) {
    return this.friendsService.getPendingRequests(userId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Hủy kết bạn / Hủy lời mời' })
  removeFriendship(
    @CurrentUser('sub') userId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.friendsService.removeFriendship(userId, targetUserId);
  }
}

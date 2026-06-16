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
  ApiParam,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Friends')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request/:userId')
  @ApiOperation({ summary: 'Gửi lời mời kết bạn' })
  @ApiParam({ name: 'userId', description: 'ID người dùng muốn kết bạn' })
  @ApiResponse({ status: 200, description: 'Đã gửi lời mời kết bạn' })
  sendRequest(
    @CurrentUser('sub') senderId: string,
    @Param('userId') receiverId: string,
  ) {
    return this.friendsService.sendRequest(senderId, receiverId);
  }

  @Patch('request/:id')
  @ApiOperation({ summary: 'Chấp nhận lời mời kết bạn' })
  @ApiParam({ name: 'id', description: 'ID friendship' })
  @ApiResponse({ status: 200, description: 'Đã chấp nhận lời mời kết bạn' })
  acceptRequest(
    @CurrentUser('sub') userId: string,
    @Param('id') friendshipId: string,
  ) {
    return this.friendsService.acceptRequest(userId, friendshipId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách bạn bè (pagination)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang',
  })
  @ApiResponse({ status: 200, description: 'Danh sách bạn bè' })
  getFriends(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.friendsService.getFriends(
      userId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('requests')
  @ApiOperation({ summary: 'Lời mời đang chờ (incoming)' })
  @ApiResponse({ status: 200, description: 'Danh sách lời mời đang chờ' })
  getPendingRequests(@CurrentUser('sub') userId: string) {
    return this.friendsService.getPendingRequests(userId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Hủy kết bạn / Hủy lời mời' })
  @ApiParam({ name: 'userId', description: 'ID người dùng muốn hủy kết bạn' })
  @ApiResponse({ status: 200, description: 'Đã hủy kết bạn' })
  removeFriendship(
    @CurrentUser('sub') userId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.friendsService.removeFriendship(userId, targetUserId);
  }
}

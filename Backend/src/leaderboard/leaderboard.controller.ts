import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

@ApiTags('Leaderboard')
@ApiBearerAuth('access-token')
@Controller()
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @ApiOperation({ summary: 'Like một user' })
  @ApiParam({ name: 'id', description: 'ID người dùng' })
  @ApiResponse({ status: 200, description: 'Đã thích người dùng' })
  @Post('users/:id/like')
  likeUser(@CurrentUser('sub') likerId: string, @Param('id') userId: string) {
    return this.leaderboardService.likeUser(likerId, userId);
  }

  @ApiOperation({ summary: 'Bỏ like một user' })
  @ApiParam({ name: 'id', description: 'ID người dùng' })
  @ApiResponse({ status: 200, description: 'Đã bỏ thích người dùng' })
  @Delete('users/:id/like')
  unlikeUser(@CurrentUser('sub') likerId: string, @Param('id') userId: string) {
    return this.leaderboardService.unlikeUser(likerId, userId);
  }

  @ApiOperation({ summary: 'Xem số lượt thích và trạng thái của người dùng' })
  @ApiResponse({ status: 200, description: 'Thông tin lượt thích' })
  @Get('users/:id/likes')
  getUserLikes(
    @CurrentUser('sub') requesterId: string,
    @Param('id') userId: string,
  ) {
    return this.leaderboardService.getUserLikeCount(userId, requesterId);
  }

  @ApiOperation({ summary: 'Bảng xếp hạng top users theo số like' })
  @ApiResponse({ status: 200, description: 'Bảng xếp hạng' })
  @Get('leaderboard/users')
  getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.leaderboardService.getLeaderboard(query);
  }
}

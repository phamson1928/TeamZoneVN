import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

@ApiTags('Leaderboard')
@ApiBearerAuth()
@Controller()
export class LeaderboardController {
    constructor(private readonly leaderboardService: LeaderboardService) { }

    @ApiOperation({ summary: 'Like một user' })
    @ApiParam({ name: 'id', description: 'User ID cần like' })
    @Post('users/:id/like')
    likeUser(
        @CurrentUser('sub') likerId: string,
        @Param('id') userId: string,
    ) {
        return this.leaderboardService.likeUser(likerId, userId);
    }

    @ApiOperation({ summary: 'Bỏ like một user' })
    @ApiParam({ name: 'id', description: 'User ID cần bỏ like' })
    @Delete('users/:id/like')
    unlikeUser(
        @CurrentUser('sub') likerId: string,
        @Param('id') userId: string,
    ) {
        return this.leaderboardService.unlikeUser(likerId, userId);
    }

    @ApiOperation({ summary: 'Xem số like và trạng thái like của user' })
    @Get('users/:id/likes')
    getUserLikes(
        @CurrentUser('sub') requesterId: string,
        @Param('id') userId: string,
    ) {
        return this.leaderboardService.getUserLikeCount(userId, requesterId);
    }

    @ApiOperation({ summary: 'Bảng xếp hạng top users theo số like' })
    @Get('leaderboard/users')
    getLeaderboard(@Query() query: LeaderboardQueryDto) {
        return this.leaderboardService.getLeaderboard(query);
    }
}

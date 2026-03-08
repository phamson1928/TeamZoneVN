import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ZoneInvitesService } from './zone-invites.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateZoneInviteDto } from './dto/create-zone-invite.dto';
import { HandleZoneInviteDto } from './dto/handle-zone-invite.dto';

@ApiTags('Zone Invites')
@ApiBearerAuth()
@Controller()
export class ZoneInvitesController {
    constructor(private readonly zoneInvitesService: ZoneInvitesService) { }

    @ApiOperation({ summary: 'Mời bạn bè vào zone (owner only)' })
    @Post('zones/:zoneId/invite')
    inviteToZone(
        @CurrentUser('sub') userId: string,
        @Param('zoneId') zoneId: string,
        @Body() dto: CreateZoneInviteDto,
    ) {
        return this.zoneInvitesService.inviteToZone(userId, zoneId, dto);
    }

    @ApiOperation({ summary: 'Chấp nhận / Từ chối lời mời vào zone' })
    @ApiParam({ name: 'inviteId', description: 'ID của lời mời' })
    @Patch('zones/:zoneId/invites/:inviteId')
    handleInvite(
        @CurrentUser('sub') userId: string,
        @Param('inviteId') inviteId: string,
        @Body() dto: HandleZoneInviteDto,
    ) {
        return this.zoneInvitesService.handleInvite(userId, inviteId, dto);
    }

    @ApiOperation({ summary: 'Lấy danh sách lời mời zone đang chờ của user' })
    @Get('users/me/zone-invites')
    getMyInvites(@CurrentUser('sub') userId: string) {
        return this.zoneInvitesService.getMyInvites(userId);
    }

    @ApiOperation({ summary: 'Hủy lời mời (owner only)' })
    @Delete('zones/:zoneId/invites/:inviteId')
    cancelInvite(
        @CurrentUser('sub') userId: string,
        @Param('zoneId') zoneId: string,
        @Param('inviteId') inviteId: string,
    ) {
        return this.zoneInvitesService.cancelInvite(userId, zoneId, inviteId);
    }
}

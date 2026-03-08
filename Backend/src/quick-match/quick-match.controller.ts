import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuickMatchService } from './quick-match.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JoinQuickMatchDto } from './dto/join-quick-match.dto';

@ApiTags('Quick Match')
@ApiBearerAuth()
@Controller('quick-match')
export class QuickMatchController {
    constructor(private readonly quickMatchService: QuickMatchService) { }

    @ApiOperation({ summary: 'Lấy trạng thái hàng đợi hiện tại' })
    @Get('status')
    getStatus(@CurrentUser('sub') userId: string) {
        return this.quickMatchService.getQueueStatus(userId);
    }

    @ApiOperation({ summary: 'Vào hàng đợi Quick Match' })
    @Post()
    joinQueue(
        @CurrentUser('sub') userId: string,
        @Body() dto: JoinQuickMatchDto,
    ) {
        return this.quickMatchService.joinQueue(userId, dto);
    }

    @ApiOperation({ summary: 'Rời hàng đợi Quick Match' })
    @Delete()
    leaveQueue(@CurrentUser('sub') userId: string) {
        return this.quickMatchService.leaveQueue(userId);
    }
}

import { Module } from '@nestjs/common';
import { QuickMatchService } from './quick-match.service';
import { QuickMatchController } from './quick-match.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { GroupsModule } from 'src/groups/groups.module';

@Module({
    imports: [NotificationsModule, GroupsModule],
    controllers: [QuickMatchController],
    providers: [QuickMatchService],
})
export class QuickMatchModule { }

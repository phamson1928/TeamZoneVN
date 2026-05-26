import { Module } from '@nestjs/common';
import { ZoneInvitesService } from './zone-invites.service';
import { ZoneInvitesController } from './zone-invites.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { GroupsModule } from 'src/groups/groups.module';

@Module({
  imports: [NotificationsModule, GroupsModule],
  controllers: [ZoneInvitesController],
  providers: [ZoneInvitesService],
})
export class ZoneInvitesModule {}

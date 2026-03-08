import { Module } from '@nestjs/common';
import { ZoneInvitesService } from './zone-invites.service';
import { ZoneInvitesController } from './zone-invites.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
    imports: [NotificationsModule],
    controllers: [ZoneInvitesController],
    providers: [ZoneInvitesService],
})
export class ZoneInvitesModule { }

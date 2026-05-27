import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { ZonesModule } from './zones/zones.module';
import { JoinRequestsModule } from './join-requests/join-requests.module';
import { GroupsModule } from './groups/groups.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { UserGameProfilesModule } from './user-game-profiles/user-game-profiles.module';
import { TagsModule } from './tags/tags.module';
import { FilesModule } from './files/files.module';
import { ChatModule } from './chat/chat.module';
import { MessagesModule } from './messages/messages.module';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { FriendsModule } from './friends/friends.module';
import { ZoneInvitesModule } from './zone-invites/zone-invites.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { BlocksModule } from './blocks/blocks.module';
import { RedisModule } from './common/redis/redis.module';
import { RedisThrottlerStorage } from './common/redis/redis-throttler-storage';

@Module({
  imports: [
    // Config Module - load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting - 100 requests per minute by default (Redis-backed)
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisThrottlerStorage],
      useFactory: (storage: RedisThrottlerStorage) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000, // 1 minute
            limit: 100,
          },
        ],
        storage,
      }),
    }),

    // Cache - Redis store (cache-manager-ioredis-yet)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: require('cache-manager-ioredis-yet'),
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: config.get<number>('REDIS_PORT', 6379),
        password: config.get<string>('REDIS_PASSWORD', ''),
        ttl: 60, // default TTL in seconds
      }),
    }),

    // Redis - raw client for Presence & Leaderboard
    RedisModule,

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    GamesModule,
    ZonesModule,
    JoinRequestsModule,
    GroupsModule,
    NotificationsModule,
    ReportsModule,
    UserGameProfilesModule,
    TagsModule,
    FilesModule,
    ChatModule,
    MessagesModule,
    DashboardModule,
    FriendsModule,
    ZoneInvitesModule,
    LeaderboardModule,
    BlocksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT Auth Guard - all routes require authentication by default
    // Use @Public() decorator to make routes public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Throttler Guard - rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

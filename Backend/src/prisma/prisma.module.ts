import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseKeepaliveService } from './prisma-keepalive.service';

@Global()
@Module({
  providers: [PrismaService, DatabaseKeepaliveService],
  exports: [PrismaService],
})
export class PrismaModule {}

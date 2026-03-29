import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserGameProfileDto } from './dto/create-user-game-profile.dto.js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserGameProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateUserGameProfileDto) {
    // Check if game exists
    const game = await this.prisma.game.findUnique({
      where: { id: dto.gameId },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Check if profile already exists for this game
    const existing = await this.prisma.userGameProfile.findUnique({
      where: { userId_gameId: { userId, gameId: dto.gameId } },
    });
    if (existing) {
      throw new ConflictException('You already have a profile for this game');
    }

    return this.prisma.userGameProfile.create({
      data: {
        userId,
        gameId: dto.gameId,
      },
      include: {
        game: {
          select: { name: true, iconUrl: true },
        },
      },
    });
  }

  async findAllByMe(userId: string) {
    return this.prisma.userGameProfile.findMany({
      where: { userId },
      include: {
        game: {
          select: { name: true, iconUrl: true, bannerUrl: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.userGameProfile.findUnique({
      where: { id },
      include: {
        game: {
          select: { name: true, iconUrl: true },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException('User game profile not found');
    }
    return profile;
  }

  async remove(userId: string, id: string) {
    const profile = await this.findOne(id);

    if (profile.userId !== userId) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    return this.prisma.userGameProfile.delete({
      where: { id },
    });
  }
}

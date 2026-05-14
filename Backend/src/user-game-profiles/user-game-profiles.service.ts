import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserGameProfileDto } from './dto/create-user-game-profile.dto.js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserGameProfilesService {
  private readonly storageBaseUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/game-assets`;
  }

  private transformGameUrls(game: any) {
    if (!game) return game;

    const transform = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      return `${this.storageBaseUrl}/${path}`;
    };

    return {
      ...game,
      iconUrl: transform(game.iconUrl),
    };
  }

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

    const profile = await this.prisma.userGameProfile.create({
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

    return {
      ...profile,
      game: this.transformGameUrls(profile.game),
    };
  }

  async findAllByMe(userId: string) {
    const profiles = await this.prisma.userGameProfile.findMany({
      where: { userId },
      include: {
        game: {
          select: { name: true, iconUrl: true, bannerUrl: true },
        },
      },
    });

    return profiles.map((p) => ({
      ...p,
      game: this.transformGameUrls(p.game),
    }));
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
    return {
      ...profile,
      game: this.transformGameUrls(profile.game),
    };
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

import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class GamesService {
  private readonly storageBaseUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/game-assets`;
  }

  private transformGameUrls(game: any) {
    if (!game) return game;

    const transform = (path: string | null) => {
      if (!path) return path;
      if (path.startsWith('http')) return path;
      return `${this.storageBaseUrl}/${path}`;
    };

    return {
      ...game,
      iconUrl: transform(game.iconUrl),
      bannerUrl: transform(game.bannerUrl),
    };
  }

  async create(dto: CreateGameDto) {
    const game = await this.prisma.game.create({
      data: dto,
    });
    await this.cache.del('games');
    return this.transformGameUrls(game);
  }

  async findAllForAdmin(page?: number, limit?: number) {
    const pageLimit = limit || 10;
    const skip: number = ((page || 1) - 1) * pageLimit;
    const games = await this.prisma.game.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        platforms: true,
        createdAt: true,
        iconUrl: true,
        bannerUrl: true,
        _count: {
          select: { groups: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageLimit,
    });
    return games.map((g) => this.transformGameUrls(g));
  }

  async findAllForUser() {
    const games = await this.prisma.game.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        iconUrl: true,
        bannerUrl: true,
        platforms: true,
        _count: {
          select: { zones: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return games.map((g) => this.transformGameUrls(g));
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        zones: {
          where: { status: 'OPEN' },
          select: {
            title: true,
            description: true,
            requiredPlayers: true,
          },
        },
      },
    });
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} không tồn tại`);
    }
    return this.transformGameUrls(game);
  }

  async update(id: string, dto: UpdateGameDto) {
    await this.findOne(id);
    const updated = await this.prisma.game.update({
      where: { id },
      data: dto,
    });
    await this.cache.del('games');
    return this.transformGameUrls(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.game.delete({
      where: { id },
    });
    await this.cache.del('games');
  }
}

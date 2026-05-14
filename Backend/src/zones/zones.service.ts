import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateZoneDto } from './dto/create-zone.dto.js';
import { UpdateZoneDto } from './dto/update-zone.dto.js';
import { SearchZonesDto, ZoneSortBy } from './dto/search-zones.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, ContactMethodType } from '@prisma/client';

@Injectable()
export class ZonesService {
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

  async create(ownerId: string, createZoneDto: CreateZoneDto) {
    const { tagIds, contacts, ...zoneData } = createZoneDto;

    // Fetch user profile to get default contactInfo if not provided
    if (!zoneData.contactInfo) {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId: ownerId },
      });
      if (userProfile?.contactInfo) {
        zoneData.contactInfo = userProfile.contactInfo;
      }
    }

    // Kiểm tra giới hạn tạo zone – chỉ đếm zone đang OPEN hoặc FULL
    const zoneCount = await this.prisma.zone.count({
      where: { ownerId, status: { in: ['OPEN', 'FULL'] } },
    });
    if (zoneCount >= 4) {
      throw new BadRequestException(
        'Bạn đã đạt giới hạn tạo zone (tối đa 4 zone đang hoạt động)',
      );
    }

    // Kiểm tra game có tồn tại không
    const game = await this.prisma.game.findUnique({
      where: { id: zoneData.gameId },
    });
    if (!game) {
      throw new BadRequestException('Game không tồn tại');
    }



    // Tạo zone + tags + contacts trong transaction để tránh partial data
    const zone = await this.prisma.$transaction(async (tx) => {
      // Bước 1: Tạo zone
      const newZone = await tx.zone.create({
        data: {
          ...zoneData,
          ownerId,
        },
      });

      // Bước 2: Thêm tags nếu có
      if (tagIds && tagIds.length > 0) {
        await tx.zoneTagRelation.createMany({
          data: tagIds.map((tagId) => ({
            zoneId: newZone.id,
            tagId,
          })),
        });
      }

      // Bước 3: Thêm contacts nếu có
      if (contacts && contacts.length > 0) {
        await tx.zoneContactMethod.createMany({
          data: contacts.map((c) => ({
            zoneId: newZone.id,
            type: c.type,
            value: c.value,
          })),
        });
      }

      return newZone;
    });

    // Trả về zone đầy đủ
    return this.findOneByOwner(zone.id, ownerId);
  }

  async findAllByUser(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.zone.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: { include: { tag: true } },
          owner: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          game: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
            },
          },
          _count: {
            select: {
              joinRequests: { where: { status: 'APPROVED' } },
            },
          },
        },
      }),
      this.prisma.zone.count(),
    ]);

    return {
      data: data.map((z) => ({ ...z, game: this.transformGameUrls(z.game) })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllByAdmin(page: number, limit: number, query?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.ZoneWhereInput = {};
    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { owner: { username: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.zone.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
          game: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
            },
          },
          _count: {
            select: {
              joinRequests: { where: { status: 'APPROVED' } },
            },
          },
        },
      }),
      this.prisma.zone.count({ where }),
    ]);
    return {
      data: data.map((z) => ({ ...z, game: this.transformGameUrls(z.game) })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllByOwner(ownerId: string) {
    const zones = await this.prisma.zone.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
        game: {
          select: {
            id: true,
            name: true,
            iconUrl: true,
          },
        },
        group: {
          select: {
            _count: { select: { members: true } },
          },
        },
        joinRequests: {
          select: {
            status: true,
          },
        },
        _count: {
          select: {
            joinRequests: { where: { status: 'APPROVED' } },
          },
        },
      },
    });

    return zones.map((z) => ({ ...z, game: this.transformGameUrls(z.game) }));
  }

  async search(dto: SearchZonesDto) {
    const { q, gameId, sortBy = ZoneSortBy.NEWEST, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ZoneWhereInput = {};

    if (gameId) {
      where.gameId = gameId;
    }

    if (q && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { owner: { username: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy clause
    let orderBy: Prisma.ZoneOrderByWithRelationInput;
    switch (sortBy) {
      case ZoneSortBy.OLDEST:
        orderBy = { createdAt: 'asc' };
        break;
      case ZoneSortBy.PLAYERS_ASC:
        orderBy = { requiredPlayers: 'asc' };
        break;
      case ZoneSortBy.PLAYERS_DESC:
        orderBy = { requiredPlayers: 'desc' };
        break;
      case ZoneSortBy.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [data, total] = await Promise.all([
      this.prisma.zone.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tags: { include: { tag: true } },
          owner: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          game: {
            select: {
              id: true,
              name: true,
            },
          },
          group: {
            select: {
              _count: { select: { members: true } },
            },
          },
          _count: {
            select: {
              joinRequests: { where: { status: 'APPROVED' } },
            },
          },
        },
      }),
      this.prisma.zone.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        query: q || null,
        sortBy,
      },
    };
  }

  async findOneByPublic(id: string) {
    const zone = await this.prisma.zone.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        contacts: {
          select: {
            type: true,
            value: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        game: {
          select: {
            id: true,
            name: true,
            iconUrl: true,
          },
        },
        group: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        joinRequests: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!zone) {
      throw new NotFoundException('Zone không tồn tại');
    }

    return {
      ...zone,
      game: this.transformGameUrls(zone.game),
    };
  }

  async findOneByOwner(id: string, ownerId: string) {
    const zone = await this.prisma.zone.findFirst({
      where: { id, ownerId },
      include: {
        tags: { include: { tag: true } },
        contacts: {
          select: {
            type: true,
            value: true,
          },
        },
        _count: {
          select: {
            joinRequests: true,
          },
        },
        game: {
          select: {
            id: true,
            name: true,
            iconUrl: true,
          },
        },
      },
    });

    if (!zone) {
      throw new NotFoundException(
        'Zone không tồn tại hoặc bạn không có quyền xem',
      );
    }

    return {
      ...zone,
      game: this.transformGameUrls(zone.game),
    };
  }

  async update(id: string, ownerId: string, updateZoneDto: UpdateZoneDto) {
    // Tách dữ liệu zone và relations
    const { tagIds, contacts, ...zoneData } = updateZoneDto;

    // Type guard for contacts
    const typedContacts = contacts as
      | Array<{ type: string; value: string }>
      | undefined;

    // Kiểm tra quyền sở hữu
    const zone = await this.prisma.zone.findFirst({
      where: { id, ownerId },
    });
    if (!zone) {
      throw new ForbiddenException('Bạn không có quyền sửa zone này');
    }

    // Cập nhật zone + tags + contacts trong transaction để tránh partial data
    await this.prisma.$transaction(async (tx) => {
      // Bước 1: Cập nhật zone info nếu có
      if (Object.keys(zoneData).length > 0) {
        await tx.zone.update({
          where: { id },
          data: zoneData,
        });
      }

      // Nếu requiredPlayers thay đổi, tính lại status FULL/OPEN dựa trên số thành viên hiện tại
      if (zoneData.requiredPlayers !== undefined) {
        const updatedZone = await tx.zone.findUnique({
          where: { id },
          include: {
            group: { include: { members: true } },
            joinRequests: { where: { status: 'APPROVED' } },
          },
        });

        if (updatedZone) {
          const currentMembers = updatedZone.group
            ? updatedZone.group.members.length
            : updatedZone.joinRequests.length + 1; // +1 cho owner
          const maxPlayers = updatedZone.requiredPlayers + 1;

          const newStatus = currentMembers >= maxPlayers ? 'FULL' : 'OPEN';
          if (newStatus !== updatedZone.status) {
            await tx.zone.update({
              where: { id },
              data: { status: newStatus },
            });
          }
        }
      }

      // Bước 2: Nếu có tagIds thì cập nhật tags
      if (tagIds !== undefined) {
        // Xóa tags cũ
        await tx.zoneTagRelation.deleteMany({
          where: { zoneId: id },
        });

        // Thêm tags mới nếu có
        if (tagIds.length > 0) {
          await tx.zoneTagRelation.createMany({
            data: tagIds.map((tagId) => ({
              zoneId: id,
              tagId,
            })),
          });
        }
      }

      // Bước 3: Nếu có contacts thì cập nhật
      if (typedContacts !== undefined) {
        // Xóa contacts cũ
        await tx.zoneContactMethod.deleteMany({
          where: { zoneId: id },
        });

        // Thêm contacts mới nếu có
        if (typedContacts.length > 0) {
          await tx.zoneContactMethod.createMany({
            data: typedContacts.map((c) => ({
              zoneId: id,
              type: c.type as ContactMethodType,
              value: c.value,
            })),
          });
        }
      }
    });

    // Trả về zone đã cập nhật với đầy đủ relations
    return this.findOneByOwner(id, ownerId);
  }

  async remove(id: string, ownerId: string) {
    // Kiểm tra quyền sở hữu
    const zone = await this.prisma.zone.findFirst({
      where: { id, ownerId },
    });
    if (!zone) {
      throw new ForbiddenException('Bạn không có quyền xóa zone này');
    }

    // Xóa zone (cascade sẽ xóa tags và contacts)
    await this.prisma.zone.delete({
      where: { id },
    });

    return { message: 'Zone đã được xóa thành công' };
  }

  // Admin methods
  async adminDeleteZone(id: string) {
    const zone = await this.prisma.zone.findUnique({ where: { id } });
    if (!zone) {
      throw new NotFoundException('Zone không tồn tại');
    }

    await this.prisma.zone.delete({
      where: { id },
    });

    return { message: 'Zone đã được xóa bởi admin' };
  }

  async getSuggestedZones(userId: string, limit = 10) {
    // Lấy danh sách game profile của user để biết game yêu thích
    const userGameProfiles = await this.prisma.userGameProfile.findMany({
      where: { userId },
      select: { gameId: true },
    });

    // Loại trừ zone user đã có request (mọi status)
    const userRequests = await this.prisma.zoneJoinRequest.findMany({
      where: { userId },
      select: { zoneId: true },
    });
    const excludeZoneIds = userRequests.map((r) => r.zoneId);

    const baseWhere = {
      id: { notIn: excludeZoneIds },
      ownerId: { not: userId },
    };

    if (userGameProfiles.length === 0) {
      // Fallback: trả về zones mới nhất
      const fallback = await this.prisma.zone.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          tags: { include: { tag: true } },
          owner: { select: { id: true, username: true, avatarUrl: true } },
          game: { select: { id: true, name: true, iconUrl: true } },
          group: {
            select: {
              _count: { select: { members: true } },
            },
          },
          _count: { select: { joinRequests: { where: { status: 'APPROVED' } } } },
        },
      });
      return fallback.map((z) => ({ ...z, game: this.transformGameUrls(z.game) }));
    }

    // Ưu tiên zones cùng game với user, không lọc theo trình độ
    const preferredGameIds = userGameProfiles.map((p) => p.gameId);

    const preferred = await this.prisma.zone.findMany({
      where: {
        ...baseWhere,
        gameId: { in: preferredGameIds },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        tags: { include: { tag: true } },
        owner: { select: { id: true, username: true, avatarUrl: true } },
        game: { select: { id: true, name: true, iconUrl: true } },
        group: {
          select: {
            _count: { select: { members: true } },
          },
        },
        _count: { select: { joinRequests: { where: { status: 'APPROVED' } } } },
      },
    });
    return preferred.map((z) => ({ ...z, game: this.transformGameUrls(z.game) }));
  }
}

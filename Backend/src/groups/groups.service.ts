import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GroupMemberRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class GroupsService {
  private readonly storageBaseUrl: string;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/game-assets`;
  }

  /**
   * Đồng bộ members từ Zone vào Group.
   * - Nếu chưa có Group: tạo mới khi đủ approved requests.
   * - Nếu đã có Group: thêm approved members còn thiếu vào group.
   * - Set zone status = FULL khi group đạt requiredPlayers.
   * Gọi sau mỗi lần approve join request hoặc accept invite.
   */
  async syncGroupFromZone(zoneId: string) {
    const group = await this.prisma.$transaction(async (tx) => {
      const zone = await tx.zone.findUnique({
        where: { id: zoneId },
        include: {
          joinRequests: { where: { status: 'APPROVED' } },
          group: { include: { members: true } },
        },
      });

      if (!zone) return null;

      const currentMemberIds = zone.group?.members.map(m => m.userId) ?? [];
      const currentMemberCount = currentMemberIds.length;
      const approvedUserIds = zone.joinRequests.map(r => r.userId);
      const ownerId = zone.ownerId;
      const maxPlayers = zone.requiredPlayers + 1; // requiredPlayers = số người cần thêm (không tính owner)

      // ─── Scenario A: Chưa có Group ───
      if (!zone.group) {
        // Cần ít nhất 1 người ngoài owner để tạo group
        if (approvedUserIds.length < 1) return null;

        // requiredPlayers = số slot cho member (không tính owner)
        const membersToAdd = zone.joinRequests.slice(0, zone.requiredPlayers);

        const groupCreated = await tx.group.create({
          data: {
            zoneId: zone.id,
            leaderId: ownerId,
            gameId: zone.gameId,
            members: {
              createMany: {
                data: [
                  { userId: ownerId, role: 'LEADER' },
                  ...membersToAdd.map(r => ({
                    userId: r.userId,
                    role: 'MEMBER' as const,
                  })),
                ],
              },
            },
          },
        });

        // Set FULL nếu đã đủ người
        if (membersToAdd.length >= zone.requiredPlayers) {
          await tx.zone.update({
            where: { id: zoneId },
            data: { status: 'FULL' },
          });
        }

        return groupCreated;
      }

      // ─── Scenario B: Đã có Group ───
      if (currentMemberCount >= maxPlayers) {
        // Set FULL nếu chưa FULL
        if (zone.status !== 'FULL') {
          await tx.zone.update({
            where: { id: zoneId },
            data: { status: 'FULL' },
          });
        }
        return zone.group; // Group đã đầy, không thêm ai
      }

      const slotsRemaining = maxPlayers - currentMemberCount;
      const toAdd = zone.joinRequests
        .filter(r => !currentMemberIds.includes(r.userId))
        .slice(0, slotsRemaining);

      if (toAdd.length === 0) return zone.group;

      await tx.groupMember.createMany({
        data: toAdd.map(r => ({
          groupId: zone.group!.id,
          userId: r.userId,
          role: 'MEMBER' as const,
        })),
      });

      // Set FULL nếu giờ đã đủ người
      if (currentMemberCount + toAdd.length >= maxPlayers) {
        await tx.zone.update({
          where: { id: zoneId },
          data: { status: 'FULL' },
        });
      }

      return zone.group;
    });

    if (group) {
      const memberIds = await this.prisma.groupMember
        .findMany({ where: { groupId: group.id }, select: { userId: true } })
        .then((rows) => rows.map((r) => r.userId));
      await this.notificationsService.createMany(memberIds, {
        type: NotificationType.GROUP_FORMED,
        title: 'Group đã tạo',
        data: { groupId: group.id, zoneId },
      });
    }

    return group;
  }

  /**
   * Helper method to transform absolute URLs for images
   */
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
    };
  }

  /**
   * GET /groups - Danh sách groups của user hiện tại
   */
  async getUserGroups(userId: string) {
    const groups = await this.prisma.group.findMany({
      where: {
        members: { some: { userId } },
        isActive: true,
      },
      include: {
        zone: { select: { id: true, title: true, status: true } },
        game: { select: { id: true, name: true, iconUrl: true } },
        leader: {
          select: { id: true, username: true, avatarUrl: true },
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return groups.map(group => ({
      ...group,
      game: this.transformGameUrls(group.game)
    }));
  }

  /**
   * GET /groups/:id - Chi tiết group (chỉ member mới được xem)
   */
  async getGroupDetail(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        zone: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
        game: { select: { id: true, name: true, iconUrl: true } },
        leader: {
          select: { id: true, username: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, avatarUrl: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group không tồn tại');
    }

    // Chỉ member mới được xem chi tiết
    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không thuộc group này');
    }

    return {
      ...group,
      game: this.transformGameUrls(group.game),
    };
  }

  /**
   * POST /groups/:id/leave - Rời group (member only, leader phải giải tán)
   */
  async leaveGroup(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
        zone: { select: { id: true, requiredPlayers: true } },
      },
    });

    if (!group || !group.isActive) {
      throw new NotFoundException('Group không tồn tại');
    }

    const member = group.members.find((m) => m.userId === userId);
    if (!member) {
      throw new BadRequestException('Bạn không thuộc group này');
    }

    // Leader không được leave → phải giải tán
    if (member.role === 'LEADER') {
      throw new BadRequestException(
        'Leader không thể rời group. Hãy giải tán group thay vì rời.',
      );
    }

    await this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });

    // Mở lại zone nếu group còn ít hơn requiredPlayers
    const remainingCount = await this.prisma.groupMember.count({
      where: { groupId },
    });
    if (remainingCount < group.zone.requiredPlayers) {
      await this.prisma.zone.update({
        where: { id: group.zone.id },
        data: { status: 'OPEN' },
      });
    }

    await this.notificationsService.create(group.leaderId, {
      type: NotificationType.MEMBER_LEFT,
      title: 'Có thành viên rời group',
      data: { groupId },
    });

    return { message: 'Đã rời khỏi group' };
  }

  /**
   * DELETE /groups/:id - Giải tán group (leader only, hard delete)
   * Nhờ onDelete: Cascade, xóa group sẽ tự động xóa GroupMember + Message
   */
  async dissolveGroup(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group || !group.isActive) {
      throw new NotFoundException('Group không tồn tại');
    }

    if (group.leaderId !== userId) {
      throw new ForbiddenException('Chỉ leader mới được giải tán group');
    }

    // Xóa Zone -> Chuỗi Cascade sẽ tự động xóa: Group, GroupMember và Message
    await this.prisma.zone.delete({
      where: { id: group.zoneId },
    });

    return { message: 'Nhóm và bài đăng đã được xóa hoàn toàn' };
  }

  /**
   * GET /groups/:id/members - Danh sách members của group (member-only)
   */
  async getGroupMembers(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group || !group.isActive) {
      throw new NotFoundException('Group không tồn tại');
    }

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không thuộc group này');
    }

    return this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  /**
   * DELETE /groups/:id/members/:userId - Kick member (leader only)
   */
  async kickMember(leaderId: string, groupId: string, targetUserId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
        zone: { select: { id: true, requiredPlayers: true } },
      },
    });

    if (!group || !group.isActive) {
      throw new NotFoundException('Group không tồn tại');
    }

    if (group.leaderId !== leaderId) {
      throw new ForbiddenException('Chỉ leader mới có quyền kick member');
    }

    if (targetUserId === leaderId) {
      throw new BadRequestException('Leader không thể kick chính mình');
    }

    const targetMember = group.members.find((m) => m.userId === targetUserId);
    if (!targetMember) {
      throw new NotFoundException('User không phải là thành viên của group');
    }

    await this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });

    // Mở lại zone nếu group còn ít hơn requiredPlayers
    const remainingCount = await this.prisma.groupMember.count({
      where: { groupId },
    });
    if (remainingCount < group.zone.requiredPlayers) {
      await this.prisma.zone.update({
        where: { id: group.zone.id },
        data: { status: 'OPEN' },
      });
    }

    // Notify người bị kick
    await this.notificationsService.create(targetUserId, {
      type: NotificationType.MEMBER_LEFT,
      title: 'Bạn đã bị kick khỏi group',
      data: { groupId },
    });

    return { message: 'Đã kick member khỏi group' };
  }

  /**
   * PATCH /groups/:id/members/:userId - Đổi role member (leader only)
   * Khi chuyển role LEADER cho member khác, leader hiện tại sẽ trở thành MEMBER.
   */
  async changeMemberRole(
    leaderId: string,
    groupId: string,
    targetUserId: string,
    newRole: GroupMemberRole,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group || !group.isActive) {
      throw new NotFoundException('Group không tồn tại');
    }

    if (group.leaderId !== leaderId) {
      throw new ForbiddenException('Chỉ leader mới có quyền đổi role');
    }

    if (targetUserId === leaderId) {
      throw new BadRequestException(
        'Không thể đổi role của chính mình. Hãy chuyển leader cho người khác.',
      );
    }

    const targetMember = group.members.find((m) => m.userId === targetUserId);
    if (!targetMember) {
      throw new NotFoundException('User không phải là thành viên của group');
    }

    if (targetMember.role === newRole) {
      throw new BadRequestException(`User đã có role ${newRole}`);
    }

    // Nếu chuyển LEADER cho member khác → leader hiện tại thành MEMBER
    if (newRole === 'LEADER') {
      await this.prisma.$transaction([
        this.prisma.groupMember.update({
          where: { groupId_userId: { groupId, userId: targetUserId } },
          data: { role: 'LEADER' },
        }),
        this.prisma.groupMember.update({
          where: { groupId_userId: { groupId, userId: leaderId } },
          data: { role: 'MEMBER' },
        }),
        this.prisma.group.update({
          where: { id: groupId },
          data: { leaderId: targetUserId },
        }),
      ]);

      return { message: `Đã chuyển quyền leader cho user` };
    }

    // Đổi role thông thường (LEADER → MEMBER không áp dụng ở đây vì target không phải leader)
    await this.prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId: targetUserId } },
      data: { role: newRole },
    });

    return { message: `Đã đổi role thành ${newRole}` };
  }

  // ========================
  // Admin methods
  // ========================

  /**
   * GET /groups/admin - Danh sách tất cả groups (Admin, pagination)
   */
  async adminGetAllGroups(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.group.findMany({
        skip,
        take: limit,
        include: {
          zone: { select: { id: true, title: true, status: true } },
          game: { select: { id: true, name: true, iconUrl: true } },
          leader: {
            select: { id: true, username: true, avatarUrl: true },
          },
          _count: { select: { members: true, messages: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.group.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * DELETE /groups/admin/:id - Force dissolve group (Admin, hard delete)
   * Nhờ onDelete: Cascade, xóa group sẽ tự động xóa GroupMember + Message
   */
  async adminForceDissolve(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group không tồn tại');
    }

    // Admin xóa Zone -> Dọn dẹp sạch toàn bộ dữ liệu liên quan
    await this.prisma.zone.delete({
      where: { id: group.zoneId },
    });

    return { message: 'Nhóm đã được admin xóa hoàn toàn khỏi hệ thống' };
  }

  /**
   * GET /groups/admin/:id/messages - Xem messages của group (Admin)
   */
  async adminGetGroupMessages(
    groupId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group không tồn tại');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { groupId },
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count({ where: { groupId } }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

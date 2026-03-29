import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateProfileDto,
  UserResponseDto,
  PublicUserResponseDto,
  SearchUsersDto,
} from './dto';
import { FriendStatus, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: { select: { likesReceived: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.updateLastActive(userId);

    return this.toUserResponse(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.userProfile.upsert({
      where: { userId },
      update: updateProfileDto,
      create: {
        userId,
        ...updateProfileDto,
      },
    });

    return this.getMe(userId);
  }

  async getPublicProfile(
    userId: string,
    requesterId?: string,
  ): Promise<
    PublicUserResponseDto & {
      likeCount: number;
      isLikedByMe: boolean;
      friendshipRelation: 'NONE' | 'FRIENDS' | 'PENDING_SENT' | 'PENDING_RECEIVED';
      pendingFriendshipId: string | null;
    }
  > {
    const uid = userId.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      include: {
        profile: true,
        _count: { select: { likesReceived: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'BANNED') {
      throw new ForbiddenException(
        'Tài khoản này đã bị khóa và không thể xem hồ sơ.',
      );
    }

    const rid = requesterId?.trim().toLowerCase();

    const isLikedByMe = rid
      ? !!(await this.prisma.userLike.findUnique({
        where: { userId_likerId: { userId: uid, likerId: rid } },
      }))
      : false;

    let friendshipRelation: 'NONE' | 'FRIENDS' | 'PENDING_SENT' | 'PENDING_RECEIVED' =
      'NONE';
    let pendingFriendshipId: string | null = null;

    if (rid && rid !== uid) {
      const f = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            { senderId: rid, receiverId: uid },
            { senderId: uid, receiverId: rid },
          ],
          status: { in: [FriendStatus.PENDING, FriendStatus.ACCEPTED] },
        },
        select: { id: true, status: true, senderId: true },
      });

      if (f?.status === FriendStatus.ACCEPTED) {
        friendshipRelation = 'FRIENDS';
      } else if (f?.status === FriendStatus.PENDING) {
        pendingFriendshipId = f.id;
        friendshipRelation =
          f.senderId === rid ? 'PENDING_SENT' : 'PENDING_RECEIVED';
      }
    }

    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      likeCount: user._count.likesReceived,
      isLikedByMe,
      friendshipRelation,
      pendingFriendshipId,
      profile: user.profile
        ? {
          bio: user.profile.bio,
          playStyle: user.profile.playStyle,
          timezone: user.profile.timezone,
          lastActiveAt: user.profile.lastActiveAt,
        }
        : null,
    };
  }

  async updateAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      include: { profile: true },
    });

    return this.toUserResponse(user);
  }

  private async updateLastActive(userId: string): Promise<void> {
    await this.prisma.userProfile.upsert({
      where: { userId },
      update: { lastActiveAt: new Date() },
      create: {
        userId,
        lastActiveAt: new Date(),
      },
    });
  }

  async getAllUsersForAdmin(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: any[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const maxLimit = Math.min(limit, 100);
    const skip: number = (page - 1) * maxLimit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        include: {
          profile: true,
        },
        skip,
        take: maxLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit: maxLimit,
        total,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async searchUsers(
    searchDto: SearchUsersDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: any[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.UserWhereInput = {};

    if (searchDto.query) {
      where.OR = [
        { email: { contains: searchDto.query, mode: 'insensitive' } },
        { username: { contains: searchDto.query, mode: 'insensitive' } },
      ];
    }

    if (searchDto.role) {
      where.role = searchDto.role as Prisma.EnumUserRoleFilter;
    }

    if (searchDto.status) {
      where.status = searchDto.status as Prisma.EnumUserStatusFilter;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { profile: true },
        skip,
        take: maxLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit: maxLimit,
        total,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async banUser(userId: string, adminId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (adminId && userId === adminId) {
      throw new BadRequestException('You cannot ban yourself');
    }

    if (user.status === 'BANNED') {
      throw new BadRequestException('User is already banned');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'BANNED' },
      include: { profile: true },
    });

    return {
      success: true,
      message: 'User has been banned successfully',
      data: this.toPublicUserResponse(updatedUser),
    };
  }

  async unBanUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'BANNED') {
      throw new BadRequestException('User is not banned');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
      include: { profile: true },
    });

    return {
      success: true,
      message: 'User has been unbanned successfully',
      data: this.toPublicUserResponse(updatedUser),
    };
  }

  async deleteUser(userId: string, adminId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (adminId && userId === adminId) {
      throw new BadRequestException('You cannot delete yourself');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: 'User has been deleted successfully',
      data: { id: userId },
    };
  }

  async removeMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: 'Your account has been deleted successfully',
    };
  }

  private toUserResponse(user: {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    role: string;
    status: string;
    warnCount: number;
    tempBannedUntil: Date | null;
    createdAt: Date;
    profile?: {
      bio: string | null;
      playStyle: string | null;
      timezone: string | null;
      lastActiveAt: Date | null;
    } | null;
    _count?: { likesReceived: number };
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      warnCount: user.warnCount,
      tempBannedUntil: user.tempBannedUntil,
      createdAt: user.createdAt,
      likesReceived: user._count?.likesReceived ?? 0,
      profile: user.profile
        ? {
          bio: user.profile.bio,
          playStyle: user.profile.playStyle,
          timezone: user.profile.timezone,
          lastActiveAt: user.profile.lastActiveAt,
        }
        : null,
    };
  }

  private toPublicUserResponse(user: {
    id: string;
    username: string;
    avatarUrl: string | null;
    profile?: {
      bio: string | null;
      playStyle: string | null;
      timezone: string | null;
      lastActiveAt: Date | null;
    } | null;
  }): PublicUserResponseDto {
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      profile: user.profile
        ? {
          bio: user.profile.bio,
          playStyle: user.profile.playStyle,
          timezone: user.profile.timezone,
          lastActiveAt: user.profile.lastActiveAt,
        }
        : null,
    };
  }
}

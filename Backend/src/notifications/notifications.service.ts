import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) {}

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async create(userId: string, createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        ...createNotificationDto,
        userId,
      },
    });
    const unreadCount = await this.getUnreadCount(userId);
    this.chatGateway.emitNotificationToUser(userId, {
      notification,
      unreadCount,
    });
    return notification;
  }

  async createMany(
    userIds: string[],
    createNotificationDto: CreateNotificationDto,
  ) {
    // 1 query duy nhất thay vì N queries tuần tự
    const notifications = await this.prisma.notification.createManyAndReturn({
      data: userIds.map((userId) => ({ ...createNotificationDto, userId })),
    });

    // Lấy unread count và emit WS song song cho tất cả users
    await Promise.all(
      notifications.map(async (notification) => {
        const unreadCount = await this.getUnreadCount(notification.userId);
        this.chatGateway.emitNotificationToUser(notification.userId, {
          notification,
          unreadCount,
        });
      }),
    );

    return { count: notifications.length };
  }

  async findForUser(page: number, limit: number, userId: string) {
    const skip = (page - 1) * limit;
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.getUnreadCount(userId),
    ]);
    return { items, total, unreadCount, meta: { page, limit } };
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new BadRequestException('Thông báo không tồn tại');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
    return { count: result.count };
  }

  async delete(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new BadRequestException('Thông báo không tồn tại');
    }
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}

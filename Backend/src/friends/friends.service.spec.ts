import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FriendStatus, NotificationType } from '@prisma/client';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

describe('FriendsService', () => {
  let service: FriendsService;

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
    friendship: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    notification: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendRequest', () => {
    const senderId = 'user-1';
    const receiverId = 'user-2';

    it('should throw BadRequestException for friending self', async () => {
      await expect(service.sendRequest(senderId, senderId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException for invalid receiver', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if already friends', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: receiverId,
      });
      mockPrismaService.friendship.findFirst.mockResolvedValue({
        status: FriendStatus.ACCEPTED,
      });

      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create friendship and notification successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: receiverId,
      });
      mockPrismaService.friendship.findFirst.mockResolvedValue(null);
      mockPrismaService.friendship.create.mockResolvedValue({
        id: 'f-1',
        senderId,
        receiverId,
        status: FriendStatus.PENDING,
      });
      mockPrismaService.notification.create.mockResolvedValue({});

      const result = await service.sendRequest(senderId, receiverId);

      expect(result.status).toBe(FriendStatus.PENDING);
      expect(mockPrismaService.friendship.create).toHaveBeenCalled();
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: NotificationType.FRIEND_REQUEST,
          }),
        }),
      );
    });
  });

  describe('acceptRequest', () => {
    const userId = 'user-2';
    const friendshipId = 'f-1';

    it('should accept pending request', async () => {
      mockPrismaService.friendship.findUnique.mockResolvedValue({
        id: friendshipId,
        receiverId: userId,
        senderId: 'user-1',
        status: FriendStatus.PENDING,
      });
      mockPrismaService.friendship.update.mockResolvedValue({
        id: friendshipId,
        status: FriendStatus.ACCEPTED,
      });
      mockPrismaService.notification.create.mockResolvedValue({});

      const result = await service.acceptRequest(userId, friendshipId);

      expect(result.status).toBe(FriendStatus.ACCEPTED);
      expect(mockPrismaService.friendship.update).toHaveBeenCalledWith({
        where: { id: friendshipId },
        data: { status: FriendStatus.ACCEPTED },
      });
    });

    it('should throw if user is not receiver', async () => {
      mockPrismaService.friendship.findUnique.mockResolvedValue({
        id: friendshipId,
        receiverId: 'different-user',
        status: FriendStatus.PENDING,
      });

      await expect(service.acceptRequest(userId, friendshipId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

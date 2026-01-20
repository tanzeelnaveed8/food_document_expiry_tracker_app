import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import {
  BroadcastNotificationDto,
  TargetAudience,
} from './dto/broadcast-notification.dto';
import { ExpiryStatus, NotificationStatus, SubscriptionPlan } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // User stats
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: {
        lastLoginAt: {
          gte: weekAgo,
        },
      },
    });
    const inactiveUsers = await this.prisma.user.count({
      where: {
        OR: [
          { lastLoginAt: { lt: thirtyDaysAgo } },
          { lastLoginAt: null },
        ],
      },
    });
    const premiumUsers = await this.prisma.subscription.count({
      where: {
        plan: SubscriptionPlan.PREMIUM,
        status: 'ACTIVE',
      },
    });

    // Item stats
    const totalFoodItems = await this.prisma.foodItem.count();
    const totalDocuments = await this.prisma.document.count();
    const expiredFood = await this.prisma.foodItem.count({
      where: { status: ExpiryStatus.EXPIRED },
    });
    const expiredDocs = await this.prisma.document.count({
      where: { status: ExpiryStatus.EXPIRED },
    });
    const expiringSoonFood = await this.prisma.foodItem.count({
      where: { status: ExpiryStatus.EXPIRING_SOON },
    });
    const expiringSoonDocs = await this.prisma.document.count({
      where: { status: ExpiryStatus.EXPIRING_SOON },
    });

    // Notification stats
    const sentToday = await this.prisma.notification.count({
      where: {
        status: NotificationStatus.SENT,
        sentAt: { gte: today },
      },
    });
    const sentThisWeek = await this.prisma.notification.count({
      where: {
        status: NotificationStatus.SENT,
        sentAt: { gte: weekAgo },
      },
    });
    const failedToday = await this.prisma.notification.count({
      where: {
        status: NotificationStatus.FAILED,
        updatedAt: { gte: today },
      },
    });

    const totalSentToday = await this.prisma.notification.count({
      where: {
        sentAt: { gte: today },
        status: { in: [NotificationStatus.SENT, NotificationStatus.FAILED] },
      },
    });
    const deliveryRate =
      totalSentToday > 0 ? (sentToday / totalSentToday) * 100 : 100;

    // Growth stats
    const newUsersToday = await this.prisma.user.count({
      where: { createdAt: { gte: today } },
    });
    const newUsersThisWeek = await this.prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    });
    const newUsersThisMonth = await this.prisma.user.count({
      where: { createdAt: { gte: monthAgo } },
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        premium: premiumUsers,
        premiumPercentage:
          totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0,
      },
      items: {
        total: totalFoodItems + totalDocuments,
        food: totalFoodItems,
        documents: totalDocuments,
        expired: expiredFood + expiredDocs,
        expiringSoon: expiringSoonFood + expiringSoonDocs,
      },
      notifications: {
        sentToday,
        sentThisWeek,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
        failedToday,
      },
      growth: {
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
      },
    };
  }

  async getUsers(params: {
    status?: 'active' | 'inactive' | 'all';
    plan?: 'free' | 'premium' | 'all';
    search?: string;
    cursor?: string;
    limit?: number;
  }) {
    const { status = 'all', plan = 'all', search, cursor, limit = 50 } = params;

    const where: any = {};

    // Status filter
    if (status === 'active') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      where.lastLoginAt = { gte: weekAgo };
    } else if (status === 'inactive') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.OR = [
        { lastLoginAt: { lt: thirtyDaysAgo } },
        { lastLoginAt: null },
      ];
    }

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Cursor pagination
    if (cursor) {
      where.id = { gt: cursor };
    }

    const users = await this.prisma.user.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: true,
        _count: {
          select: {
            foodItems: true,
            documents: true,
          },
        },
      },
    });

    const hasMore = users.length > limit;
    const items = hasMore ? users.slice(0, -1) : users;

    // Filter by plan if needed
    let filteredItems = items;
    if (plan === 'premium') {
      filteredItems = items.filter(
        (u) => u.subscription?.plan === SubscriptionPlan.PREMIUM,
      );
    } else if (plan === 'free') {
      filteredItems = items.filter(
        (u) =>
          !u.subscription || u.subscription?.plan === SubscriptionPlan.FREE,
      );
    }

    return {
      users: filteredItems.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPremium: user.subscription?.plan === SubscriptionPlan.PREMIUM,
        isActive: user.isActive,
        itemCount: user._count.foodItems + user._count.documents,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      })),
      pagination: {
        nextCursor: hasMore ? items[items.length - 1].id : null,
        hasMore,
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        _count: {
          select: {
            foodItems: true,
            documents: true,
            notifications: {
              where: { status: NotificationStatus.SENT },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Get recent items
    const recentFoodItems = await this.prisma.foodItem.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        expiryDate: true,
        status: true,
      },
    });

    const recentDocuments = await this.prisma.document.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        expiryDate: true,
        status: true,
      },
    });

    const recentItems = [
      ...recentFoodItems.map((item) => ({ ...item, type: 'FOOD' as const })),
      ...recentDocuments.map((item) => ({
        ...item,
        type: 'DOCUMENT' as const,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime(),
      )
      .slice(0, 5);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isPremium: user.subscription?.plan === SubscriptionPlan.PREMIUM,
      isActive: user.isActive,
      itemCount: user._count.foodItems + user._count.documents,
      foodItemCount: user._count.foodItems,
      documentCount: user._count.documents,
      notificationsSent: user._count.notifications,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      subscription: user.subscription
        ? {
            plan: user.subscription.plan,
            status: user.subscription.status,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
          }
        : null,
      recentItems,
    };
  }

  async broadcastNotification(dto: BroadcastNotificationDto) {
    const { title, body, targetAudience, scheduleFor } = dto;

    // Determine target users
    let targetUsers: string[] = [];

    switch (targetAudience) {
      case TargetAudience.ALL:
        const allUsers = await this.prisma.user.findMany({
          where: { isActive: true },
          select: { id: true },
        });
        targetUsers = allUsers.map((u) => u.id);
        break;

      case TargetAudience.PREMIUM:
        const premiumUsers = await this.prisma.user.findMany({
          where: {
            isActive: true,
            subscription: {
              plan: SubscriptionPlan.PREMIUM,
              status: 'ACTIVE',
            },
          },
          select: { id: true },
        });
        targetUsers = premiumUsers.map((u) => u.id);
        break;

      case TargetAudience.FREE:
        const freeUsers = await this.prisma.user.findMany({
          where: {
            isActive: true,
            OR: [
              { subscription: null },
              { subscription: { plan: SubscriptionPlan.FREE } },
            ],
          },
          select: { id: true },
        });
        targetUsers = freeUsers.map((u) => u.id);
        break;

      case TargetAudience.INACTIVE:
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const inactiveUsers = await this.prisma.user.findMany({
          where: {
            OR: [
              { lastLoginAt: { lt: thirtyDaysAgo } },
              { lastLoginAt: null },
            ],
          },
          select: { id: true },
        });
        targetUsers = inactiveUsers.map((u) => u.id);
        break;
    }

    // Create broadcast ID
    const broadcastId = `broadcast_${Date.now()}`;

    // Schedule notifications for each user
    const scheduledFor = scheduleFor ? new Date(scheduleFor) : new Date();

    // Create notifications in batches
    const batchSize = 100;
    for (let i = 0; i < targetUsers.length; i += batchSize) {
      const batch = targetUsers.slice(i, i + batchSize);
      await this.prisma.notification.createMany({
        data: batch.map((userId) => ({
          userId,
          title,
          body,
          scheduledFor,
          status: NotificationStatus.PENDING,
          itemType: 'FOOD', // Broadcast notifications don't have items
          fcmMessageId: broadcastId,
        })),
      });
    }

    return {
      message: 'Broadcast notification queued successfully',
      targetUserCount: targetUsers.length,
      broadcastId,
    };
  }
}

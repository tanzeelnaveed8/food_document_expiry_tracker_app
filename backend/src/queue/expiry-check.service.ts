import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueueService } from '../queue/notification-queue.service';

@Injectable()
export class ExpiryCheckService {
  private readonly logger = new Logger(ExpiryCheckService.name);

  constructor(
    private prisma: PrismaService,
    private notificationQueue: NotificationQueueService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringItems() {
    this.logger.log('Starting daily expiry check...');

    try {
      const users = await this.prisma.user.findMany({
        where: {
          isActive: true,
          preference: {
            enabled: true,
          },
        },
        include: {
          preference: true,
        },
      });

      for (const user of users) {
        await this.scheduleNotificationsForUser(user);
      }

      this.logger.log(`Completed expiry check for ${users.length} users`);
    } catch (error) {
      this.logger.error('Failed to check expiring items', error);
    }
  }

  private async scheduleNotificationsForUser(user: any) {
    const intervals = user.preference?.intervals || [30, 15, 7, 1];
    const now = new Date();

    // Get all active items for the user
    const [foodItems, documents] = await Promise.all([
      this.prisma.foodItem.findMany({
        where: {
          userId: user.id,
          expiryDate: {
            gte: now,
          },
        },
      }),
      this.prisma.document.findMany({
        where: {
          userId: user.id,
          expiryDate: {
            gte: now,
          },
        },
      }),
    ]);

    // Schedule notifications for food items
    if (user.preference?.foodNotificationsEnabled) {
      for (const item of foodItems) {
        await this.scheduleNotificationsForItem(
          user.id,
          item.id,
          'FOOD',
          item.name,
          item.expiryDate,
          intervals,
        );
      }
    }

    // Schedule notifications for documents
    if (user.preference?.documentNotificationsEnabled) {
      for (const item of documents) {
        await this.scheduleNotificationsForItem(
          user.id,
          item.id,
          'DOCUMENT',
          item.name,
          item.expiryDate,
          intervals,
        );
      }
    }
  }

  private async scheduleNotificationsForItem(
    userId: string,
    itemId: string,
    itemType: 'FOOD' | 'DOCUMENT',
    itemName: string,
    expiryDate: Date,
    intervals: number[],
  ) {
    const now = new Date();

    for (const daysBeforeExpiry of intervals) {
      const notificationDate = new Date(expiryDate);
      notificationDate.setDate(notificationDate.getDate() - daysBeforeExpiry);
      notificationDate.setHours(9, 0, 0, 0); // Send at 9 AM

      // Only schedule if the notification date is in the future
      if (notificationDate > now) {
        await this.notificationQueue.scheduleExpiryNotification(
          {
            userId,
            itemId,
            itemType,
            itemName,
            expiryDate,
            daysUntilExpiry: daysBeforeExpiry,
          },
          notificationDate,
        );
      }
    }
  }

  async scheduleNotificationsForNewItem(
    userId: string,
    itemId: string,
    itemType: 'FOOD' | 'DOCUMENT',
    itemName: string,
    expiryDate: Date,
  ) {
    // Get user preferences
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { preference: true },
    });

    if (!user?.preference?.enabled) {
      return;
    }

    // Check if notifications are enabled for this item type
    const notificationsEnabled =
      itemType === 'FOOD'
        ? user.preference.foodNotificationsEnabled
        : user.preference.documentNotificationsEnabled;

    if (!notificationsEnabled) {
      return;
    }

    const intervals = user.preference.intervals || [30, 15, 7, 1];
    await this.scheduleNotificationsForItem(
      userId,
      itemId,
      itemType,
      itemName,
      expiryDate,
      intervals,
    );
  }

  async rescheduleNotificationsForItem(
    userId: string,
    itemId: string,
    itemType: 'FOOD' | 'DOCUMENT',
    itemName: string,
    expiryDate: Date,
  ) {
    // Cancel existing notifications
    await this.notificationQueue.cancelExpiryNotifications(itemId);

    // Schedule new notifications
    await this.scheduleNotificationsForNewItem(
      userId,
      itemId,
      itemType,
      itemName,
      expiryDate,
    );
  }
}

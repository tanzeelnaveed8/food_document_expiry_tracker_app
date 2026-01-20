import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { ItemsService } from '../items/items.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationJobData } from './notification.processor';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
    private notificationsService: NotificationsService,
    private itemsService: ItemsService,
    private prisma: PrismaService,
  ) {}

  // Run every hour to check for items that need notifications
  @Cron(CronExpression.EVERY_HOUR)
  async scheduleExpiryNotifications() {
    this.logger.log('Running expiry notification scheduler');

    try {
      // Get all users with notification preferences
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
        await this.scheduleUserNotifications(user);
      }

      this.logger.log('Expiry notification scheduling completed');
    } catch (error) {
      this.logger.error('Error scheduling notifications:', error);
    }
  }

  private async scheduleUserNotifications(user: any) {
    const preferences = user.preference;
    if (!preferences || !preferences.enabled) {
      return;
    }

    const intervals = preferences.intervals || [30, 15, 7, 1];

    // Get user's items
    const [foodItems, documents] = await Promise.all([
      this.prisma.foodItem.findMany({
        where: { userId: user.id },
      }),
      this.prisma.document.findMany({
        where: { userId: user.id },
      }),
    ]);

    const now = new Date();

    // Process food items
    if (preferences.foodNotificationsEnabled) {
      for (const item of foodItems) {
        await this.scheduleItemNotifications(
          user.id,
          'FOOD',
          item,
          intervals,
          now,
        );
      }
    }

    // Process documents
    if (preferences.documentNotificationsEnabled) {
      for (const item of documents) {
        await this.scheduleItemNotifications(
          user.id,
          'DOCUMENT',
          item,
          intervals,
          now,
        );
      }
    }
  }

  private async scheduleItemNotifications(
    userId: string,
    itemType: 'FOOD' | 'DOCUMENT',
    item: any,
    intervals: number[],
    now: Date,
  ) {
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Check if we should send a notification for any interval
    for (const interval of intervals) {
      if (daysUntilExpiry === interval) {
        // Check if notification already exists
        const existingNotification = await this.prisma.notification.findFirst({
          where: {
            userId,
            itemType,
            [itemType === 'FOOD' ? 'foodItemId' : 'documentId']: item.id,
            scheduledFor: {
              gte: now,
              lte: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Within next 24 hours
            },
          },
        });

        if (!existingNotification) {
          await this.createAndQueueNotification(
            userId,
            itemType,
            item,
            daysUntilExpiry,
          );
        }
      }
    }
  }

  private async createAndQueueNotification(
    userId: string,
    itemType: 'FOOD' | 'DOCUMENT',
    item: any,
    daysUntilExpiry: number,
  ) {
    const title = `${itemType === 'FOOD' ? 'Food' : 'Document'} Expiring Soon`;
    const body = `${item.name} will expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;

    // Schedule notification for preferred time or default to 9 AM
    const scheduledFor = new Date();
    scheduledFor.setHours(9, 0, 0, 0);

    // Create notification in database
    const notification = await this.notificationsService.createNotification({
      userId,
      itemType,
      itemId: item.id,
      title,
      body,
      scheduledFor,
    });

    // Add to queue
    const jobData: NotificationJobData = {
      notificationId: notification.id,
      userId,
      itemType,
      itemId: item.id,
      itemName: item.name,
      expiryDate: item.expiryDate,
      daysUntilExpiry,
    };

    await this.notificationQueue.add('send-expiry-reminder', jobData, {
      delay: Math.max(0, scheduledFor.getTime() - Date.now()),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    this.logger.log(
      `Scheduled notification for ${item.name} (${itemType}) - expires in ${daysUntilExpiry} days`,
    );
  }

  async queueTestNotification(userId: string) {
    const testData: NotificationJobData = {
      notificationId: 'test-' + Date.now(),
      userId,
      itemType: 'FOOD',
      itemId: 'test-item',
      itemName: 'Test Item',
      expiryDate: new Date(),
      daysUntilExpiry: 1,
    };

    await this.notificationQueue.add('send-expiry-reminder', testData);
    this.logger.log('Test notification queued');
  }
}

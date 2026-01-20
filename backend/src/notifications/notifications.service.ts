import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UpdateNotificationPreferencesDto, QueryNotificationsDto, RegisterFcmTokenDto } from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  async getPreferences(userId: string) {
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await this.prisma.notificationPreference.create({
        data: {
          userId,
          enabled: true,
          foodNotificationsEnabled: true,
          documentNotificationsEnabled: true,
          intervals: [30, 15, 7, 1],
          quietHoursEnabled: false,
        },
      });
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    updateDto: UpdateNotificationPreferencesDto,
  ) {
    // Ensure preferences exist
    await this.getPreferences(userId);

    return this.prisma.notificationPreference.update({
      where: { userId },
      data: updateDto,
    });
  }

  async getNotificationHistory(userId: string, query: QueryNotificationsDto) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledFor: 'desc' },
        include: {
          foodItem: {
            select: {
              id: true,
              name: true,
              category: true,
              expiryDate: true,
            },
          },
          document: {
            select: {
              id: true,
              name: true,
              type: true,
              expiryDate: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createNotification(data: {
    userId: string;
    itemType: 'FOOD' | 'DOCUMENT';
    itemId: string;
    title: string;
    body: string;
    scheduledFor: Date;
  }) {
    const notificationData: any = {
      userId: data.userId,
      itemType: data.itemType,
      title: data.title,
      body: data.body,
      scheduledFor: data.scheduledFor,
      status: 'PENDING',
    };

    if (data.itemType === 'FOOD') {
      notificationData.foodItemId = data.itemId;
    } else {
      notificationData.documentId = data.itemId;
    }

    return this.prisma.notification.create({
      data: notificationData,
    });
  }

  async markAsSent(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  async markAsFailed(notificationId: string, errorMessage: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'FAILED',
        errorMessage,
      },
    });
  }

  async getUpcomingNotifications() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    return this.prisma.notification.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          gte: now,
          lte: oneHourFromNow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            preference: true,
          },
        },
        foodItem: true,
        document: true,
      },
    });
  }

  // FCM Token Management
  async registerFcmToken(userId: string, registerDto: RegisterFcmTokenDto) {
    const { token, platform, deviceId } = registerDto;

    // Check if token already exists
    const existingToken = await this.prisma.fcmToken.findUnique({
      where: { token },
    });

    if (existingToken) {
      // Update if it belongs to a different user
      if (existingToken.userId !== userId) {
        return this.prisma.fcmToken.update({
          where: { token },
          data: {
            userId,
            platform,
            deviceId,
            updatedAt: new Date(),
          },
        });
      }
      return existingToken;
    }

    // Create new token
    return this.prisma.fcmToken.create({
      data: {
        token,
        userId,
        platform,
        deviceId,
      },
    });
  }

  async removeFcmToken(userId: string, token: string) {
    const fcmToken = await this.prisma.fcmToken.findUnique({
      where: { token },
    });

    if (!fcmToken || fcmToken.userId !== userId) {
      throw new NotFoundException('FCM token not found');
    }

    await this.prisma.fcmToken.delete({
      where: { token },
    });
  }

  async getUserFcmTokens(userId: string): Promise<string[]> {
    const tokens = await this.prisma.fcmToken.findMany({
      where: { userId },
      select: { token: true },
    });

    return tokens.map((t) => t.token);
  }

  // Send Notifications
  async sendPushNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
  ) {
    const tokens = await this.getUserFcmTokens(userId);

    if (tokens.length === 0) {
      this.logger.warn(`No FCM tokens found for user ${userId}`);
      return { success: false, message: 'No FCM tokens registered' };
    }

    try {
      if (tokens.length === 1) {
        const messageId = await this.firebaseService.sendNotification(
          tokens[0],
          notification,
          data,
        );
        return { success: true, messageId };
      } else {
        const response = await this.firebaseService.sendMulticast(
          tokens,
          notification,
          data,
        );
        return {
          success: true,
          successCount: response.successCount,
          failureCount: response.failureCount,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${userId}`, error);
      throw error;
    }
  }

  async sendTestNotification(userId: string) {
    return this.sendPushNotification(
      userId,
      {
        title: 'Test Notification',
        body: 'This is a test notification from Expiry Tracker',
      },
      {
        type: 'test',
      },
    );
  }

  async sendExpiryNotification(
    userId: string,
    item: {
      id: string;
      name: string;
      type: 'FOOD' | 'DOCUMENT';
      expiryDate: Date;
    },
    daysUntilExpiry: number,
  ) {
    const title = daysUntilExpiry === 0
      ? `${item.name} expires today!`
      : daysUntilExpiry === 1
      ? `${item.name} expires tomorrow`
      : `${item.name} expires in ${daysUntilExpiry} days`;

    const body = item.type === 'FOOD'
      ? 'Check your food items to avoid waste'
      : 'Renew your document before it expires';

    return this.sendPushNotification(
      userId,
      { title, body },
      {
        type: 'expiry',
        itemId: item.id,
        itemType: item.type,
        daysUntilExpiry: daysUntilExpiry.toString(),
      },
    );
  }
}

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationJobData } from './notification-queue.service';

@Processor('notifications')
export class NotificationQueueProcessor {
  private readonly logger = new Logger(NotificationQueueProcessor.name);

  constructor(private notificationsService: NotificationsService) {}

  @Process('send-expiry-notification')
  async handleExpiryNotification(job: Job<NotificationJobData>) {
    const { userId, itemId, itemType, itemName, expiryDate, daysUntilExpiry } = job.data;

    this.logger.log(`Processing expiry notification for item ${itemId} (${itemName})`);

    try {
      await this.notificationsService.sendExpiryNotification(
        userId,
        {
          id: itemId,
          name: itemName,
          type: itemType,
          expiryDate: new Date(expiryDate),
        },
        daysUntilExpiry,
      );

      this.logger.log(`Successfully sent expiry notification for item ${itemId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send expiry notification for item ${itemId}`, error);
      throw error;
    }
  }
}

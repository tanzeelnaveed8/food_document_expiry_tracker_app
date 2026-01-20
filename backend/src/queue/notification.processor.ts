import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

export interface NotificationJobData {
  notificationId: string;
  userId: string;
  itemType: 'FOOD' | 'DOCUMENT';
  itemId: string;
  itemName: string;
  expiryDate: Date;
  daysUntilExpiry: number;
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private notificationsService: NotificationsService) {}

  @Process('send-expiry-reminder')
  async handleExpiryReminder(job: Job<NotificationJobData>) {
    this.logger.log(`Processing notification job ${job.id}`);

    const { notificationId, itemName, daysUntilExpiry, itemType } = job.data;

    try {
      // TODO: Implement actual notification sending (FCM, Email, etc.)
      // For now, just log and mark as sent
      this.logger.log(
        `Sending expiry reminder: ${itemName} (${itemType}) expires in ${daysUntilExpiry} days`,
      );

      // Mark notification as sent
      await this.notificationsService.markAsSent(notificationId);

      this.logger.log(`Notification ${notificationId} sent successfully`);
    } catch (error) {
      this.logger.error(`Failed to send notification ${notificationId}:`, error);

      // Mark notification as failed
      await this.notificationsService.markAsFailed(
        notificationId,
        error.message,
      );

      throw error;
    }
  }
}

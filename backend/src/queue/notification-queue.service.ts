import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface NotificationJobData {
  userId: string;
  itemId: string;
  itemType: 'FOOD' | 'DOCUMENT';
  itemName: string;
  expiryDate: Date;
  daysUntilExpiry: number;
}

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async scheduleExpiryNotification(data: NotificationJobData, scheduledFor: Date) {
    try {
      const delay = scheduledFor.getTime() - Date.now();

      if (delay < 0) {
        this.logger.warn(`Notification scheduled in the past for item ${data.itemId}, sending immediately`);
        return this.notificationQueue.add('send-expiry-notification', data);
      }

      const job = await this.notificationQueue.add(
        'send-expiry-notification',
        data,
        {
          delay,
          jobId: `expiry-${data.itemId}-${data.daysUntilExpiry}`,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      this.logger.log(`Scheduled expiry notification for item ${data.itemId} at ${scheduledFor.toISOString()}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to schedule notification for item ${data.itemId}`, error);
      throw error;
    }
  }

  async cancelExpiryNotifications(itemId: string) {
    try {
      const jobs = await this.notificationQueue.getJobs(['delayed', 'waiting']);
      const itemJobs = jobs.filter((job) => job.data.itemId === itemId);

      for (const job of itemJobs) {
        await job.remove();
      }

      this.logger.log(`Cancelled ${itemJobs.length} notifications for item ${itemId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel notifications for item ${itemId}`, error);
    }
  }

  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.notificationQueue.getCompletedCount(),
      this.notificationQueue.getFailedCount(),
      this.notificationQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }
}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationProcessor } from './notification.processor';
import { NotificationScheduler } from './notification.scheduler';
import { NotificationsModule } from '../notifications/notifications.module';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    NotificationsModule,
    ItemsModule,
  ],
  providers: [NotificationProcessor, NotificationScheduler],
  exports: [NotificationScheduler],
})
export class QueueModule {}

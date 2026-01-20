import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationQueueProcessor } from './notification-queue.processor';
import { NotificationQueueService } from './notification-queue.service';
import { ExpiryCheckService } from './expiry-check.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    NotificationsModule,
    PrismaModule,
  ],
  providers: [NotificationQueueProcessor, NotificationQueueService, ExpiryCheckService],
  exports: [NotificationQueueService, ExpiryCheckService],
})
export class NotificationQueueModule {}

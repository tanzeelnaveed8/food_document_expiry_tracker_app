import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { NotificationsModule } from './notifications/notifications.module';
import { QueueModule } from './queue/queue.module';
import { NotificationQueueModule } from './queue/notification-queue.module';
import { AdminModule } from './admin/admin.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AdminGuard } from './auth/guards/admin.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    QueueModule,
    NotificationQueueModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
  ],
})
export class AppModule {}

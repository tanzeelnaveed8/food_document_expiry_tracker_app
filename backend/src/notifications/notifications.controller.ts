import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferencesDto, QueryNotificationsDto, RegisterFcmTokenDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('preferences')
  getPreferences(@GetUser('id') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Patch('preferences')
  @HttpCode(HttpStatus.OK)
  updatePreferences(
    @GetUser('id') userId: string,
    @Body() updateDto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(userId, updateDto);
  }

  @Get('history')
  getHistory(
    @GetUser('id') userId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationsService.getNotificationHistory(userId, query);
  }

  @Post('fcm-token')
  @HttpCode(HttpStatus.CREATED)
  registerFcmToken(
    @GetUser('id') userId: string,
    @Body() registerDto: RegisterFcmTokenDto,
  ) {
    return this.notificationsService.registerFcmToken(userId, registerDto);
  }

  @Delete('fcm-token/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFcmToken(
    @GetUser('id') userId: string,
    @Param('token') token: string,
  ) {
    return this.notificationsService.removeFcmToken(userId, token);
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestNotification(@GetUser('id') userId: string) {
    return this.notificationsService.sendTestNotification(userId);
  }
}

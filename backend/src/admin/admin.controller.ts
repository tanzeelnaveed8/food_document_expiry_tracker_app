import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from '../auth/decorators/admin.decorator';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';

@Controller('admin')
@Admin()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(
    @Query('status') status?: 'active' | 'inactive' | 'all',
    @Query('plan') plan?: 'free' | 'premium' | 'all',
    @Query('search') search?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers({
      status,
      plan,
      search,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string) {
    const user = await this.adminService.getUserDetails(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post('notifications/broadcast')
  async broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    return this.adminService.broadcastNotification(dto);
  }
}

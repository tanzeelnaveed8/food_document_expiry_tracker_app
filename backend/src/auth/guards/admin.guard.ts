import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isAdmin) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('Admin access required');
    }

    // Check if user is an admin
    const adminUser = await this.prisma.adminUser.findUnique({
      where: { email: user.email },
    });

    if (!adminUser || !adminUser.isActive) {
      throw new ForbiddenException('Admin access required');
    }

    // Attach admin info to request
    request.admin = adminUser;

    return true;
  }
}

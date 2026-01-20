import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
        preference: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        preference: true,
      },
    });
  }

  async create(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async setPasswordResetToken(
    userId: string,
    token: string,
    expiry: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: token,
        passwordResetExpiry: expiry,
      },
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: {
          gte: new Date(),
        },
      },
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });
  }
}

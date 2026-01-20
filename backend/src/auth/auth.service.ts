import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Handle name splitting if only 'name' is provided
    let firstName = data.firstName;
    let lastName = data.lastName;

    if (data.name && !firstName && !lastName) {
      const nameParts = data.name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || nameParts[0];
    }

    // Create user
    const user = await this.usersService.create({
      email: data.email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await this.usersService.setPasswordResetToken(user.id, resetToken, resetExpiry);

    // TODO: Send email with reset link (requires EmailService - T019d)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: http://localhost:3001/reset-password?token=${resetToken}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find user by reset token
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.usersService.updatePassword(user.id, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}

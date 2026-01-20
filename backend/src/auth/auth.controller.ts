import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { Public } from './decorators/public.decorator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  fcmToken?: string;

  @IsOptional()
  @IsEnum(['ios', 'android'])
  platform?: 'ios' | 'android';
}

class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    const result = await this.authService.signup(signupDto);

    // Remove password from response
    const { password, ...userWithoutPassword } = result.user;

    return {
      user: userWithoutPassword,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto.email, loginDto.password);

    // TODO: Handle FCM token registration (T101)
    if (loginDto.fcmToken && loginDto.platform) {
      console.log(`FCM token received: ${loginDto.fcmToken} (${loginDto.platform})`);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = result.user;

    return {
      user: userWithoutPassword,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser('id') userId: string, @Body() body: { fcmToken?: string }) {
    // TODO: Handle FCM token removal (T102)
    if (body.fcmToken) {
      console.log(`FCM token to remove: ${body.fcmToken}`);
    }

    return { message: 'Logged out successfully' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return { message: 'Password reset email sent' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return { message: 'Password reset successful' };
  }
}

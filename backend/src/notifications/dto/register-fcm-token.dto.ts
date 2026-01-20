import { IsString, IsEnum, IsOptional } from 'class-validator';

export class RegisterFcmTokenDto {
  @IsString()
  token: string;

  @IsEnum(['ios', 'android'])
  platform: 'ios' | 'android';

  @IsOptional()
  @IsString()
  deviceId?: string;
}

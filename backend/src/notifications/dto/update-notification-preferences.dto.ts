import { IsBoolean, IsOptional, IsArray, IsInt, IsString, Matches } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  foodNotificationsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  documentNotificationsEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  intervals?: number[];

  @IsOptional()
  @IsBoolean()
  quietHoursEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'quietHoursStart must be in HH:MM format',
  })
  quietHoursStart?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'quietHoursEnd must be in HH:MM format',
  })
  quietHoursEnd?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'preferredTime must be in HH:MM format',
  })
  preferredTime?: string;
}

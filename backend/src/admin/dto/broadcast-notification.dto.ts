import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export enum TargetAudience {
  ALL = 'all',
  PREMIUM = 'premium',
  FREE = 'free',
  INACTIVE = 'inactive',
}

export class BroadcastNotificationDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(500)
  body: string;

  @IsEnum(TargetAudience)
  targetAudience: TargetAudience;

  @IsOptional()
  @IsDateString()
  scheduleFor?: string;
}

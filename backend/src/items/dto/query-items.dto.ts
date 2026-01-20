import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemType } from './create-item.dto';

export class QueryItemsDto {
  @IsOptional()
  @IsEnum(ItemType)
  type?: ItemType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  expiringBefore?: string;

  @IsOptional()
  @IsDateString()
  expiringAfter?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(['expiryDate', 'createdAt', 'name'])
  sortBy?: string = 'expiryDate';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

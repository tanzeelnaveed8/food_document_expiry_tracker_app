import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { FoodCategory, StorageType, DocumentType } from './create-item.dto';

export class UpdateFoodItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(FoodCategory)
  category?: FoodCategory;

  @IsOptional()
  @IsEnum(StorageType)
  storageType?: StorageType;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string | null;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  customType?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string | null;
}

import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';

export enum ItemType {
  FOOD = 'FOOD',
  DOCUMENT = 'DOCUMENT',
}

export enum FoodCategory {
  DAIRY = 'DAIRY',
  MEAT = 'MEAT',
  SEAFOOD = 'SEAFOOD',
  VEGETABLES = 'VEGETABLES',
  FRUITS = 'FRUITS',
  GRAINS = 'GRAINS',
  BEVERAGES = 'BEVERAGES',
  CONDIMENTS = 'CONDIMENTS',
  FROZEN = 'FROZEN',
  OTHER = 'OTHER',
}

export enum StorageType {
  REFRIGERATOR = 'REFRIGERATOR',
  FREEZER = 'FREEZER',
  PANTRY = 'PANTRY',
  COUNTER = 'COUNTER',
}

export enum DocumentType {
  PASSPORT = 'PASSPORT',
  VISA = 'VISA',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  ID_CARD = 'ID_CARD',
  INSURANCE_POLICY = 'INSURANCE_POLICY',
  MEMBERSHIP = 'MEMBERSHIP',
  CUSTOM = 'CUSTOM',
}

// Base DTO for common fields
export class CreateItemDto {
  @IsEnum(ItemType)
  type: ItemType;

  @IsString()
  name: string;

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

// Food-specific DTO
export class CreateFoodItemDto {
  @IsString()
  name: string;

  @IsEnum(FoodCategory)
  category: FoodCategory;

  @IsEnum(StorageType)
  storageType: StorageType;

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

// Document-specific DTO
export class CreateDocumentDto {
  @IsString()
  name: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsDateString()
  expiryDate: string;

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
  photoUrl?: string;
}

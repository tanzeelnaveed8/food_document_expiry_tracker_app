# Data Model: Food & Document Expiry Tracker

**Feature**: Food & Document Expiry Tracker
**Date**: 2026-01-17
**Database**: PostgreSQL 15+ via Neon
**ORM**: Prisma 5.x

## Overview

This document defines the complete database schema for the Food & Document Expiry Tracker application. The schema supports user authentication, item tracking (food and documents), notification management, and premium subscriptions.

## Entity Relationship Diagram

```
User (1) ──────< (many) FoodItem
  │
  ├──────< (many) Document
  │
  ├──────< (many) Notification
  │
  ├────── (1:1) NotificationPreference
  │
  └────── (1:1, optional) Subscription

AdminUser (separate table, no relation to User)
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed

  // Profile
  firstName String?
  lastName  String?

  // Account status
  isActive  Boolean  @default(true)
  isVerified Boolean @default(false)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastLoginAt DateTime?

  // Relations
  foodItems    FoodItem[]
  documents    Document[]
  notifications Notification[]
  preference   NotificationPreference?
  subscription Subscription?

  // FCM tokens for push notifications
  fcmTokens    FcmToken[]

  @@index([email])
  @@index([createdAt])
  @@map("users")
}

model FcmToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Device info
  platform  String   // "ios" | "android"
  deviceId  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([token])
  @@map("fcm_tokens")
}

// ============================================================================
// ITEM TRACKING
// ============================================================================

model FoodItem {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Basic info
  name        String
  category    FoodCategory
  quantity    String?  // e.g., "2 liters", "500g", "3 pieces"
  storageType StorageType

  // Expiry tracking
  expiryDate  DateTime
  status      ExpiryStatus @default(SAFE)

  // Photo
  photoUrl    String?  // Cloudinary public_id

  // Metadata
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  notifications Notification[]

  @@index([userId])
  @@index([expiryDate])
  @@index([status])
  @@index([userId, expiryDate])
  @@map("food_items")
}

model Document {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Basic info
  name        String   // e.g., "Passport", "Driver's License", "Gym Membership"
  type        DocumentType
  customType  String?  // Used when type = CUSTOM

  // Document details
  documentNumber String?
  issuedDate     DateTime?
  expiryDate     DateTime
  status         ExpiryStatus @default(SAFE)

  // Metadata
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  notifications Notification[]

  @@index([userId])
  @@index([expiryDate])
  @@index([status])
  @@index([userId, expiryDate])
  @@map("documents")
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Item reference (polymorphic)
  itemType  ItemType // "FOOD" | "DOCUMENT"
  foodItemId String?
  foodItem   FoodItem? @relation(fields: [foodItemId], references: [id], onDelete: Cascade)
  documentId String?
  document   Document? @relation(fields: [documentId], references: [id], onDelete: Cascade)

  // Notification content
  title     String
  body      String

  // Scheduling
  scheduledFor DateTime
  sentAt       DateTime?

  // Delivery status
  status    NotificationStatus @default(PENDING)

  // FCM response
  fcmMessageId String?
  errorMessage String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([scheduledFor])
  @@index([status])
  @@index([userId, status])
  @@map("notifications")
}

model NotificationPreference {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Global settings
  enabled   Boolean  @default(true)

  // Item type toggles
  foodNotificationsEnabled     Boolean @default(true)
  documentNotificationsEnabled Boolean @default(true)

  // Custom intervals (days before expiry)
  intervals Int[]    @default([30, 15, 7, 1])

  // Quiet hours
  quietHoursEnabled Boolean @default(false)
  quietHoursStart   String? // e.g., "22:00"
  quietHoursEnd     String? // e.g., "08:00"

  // Preferred notification time
  preferredTime String? // e.g., "09:00" (daily notification time)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("notification_preferences")
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

model Subscription {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Plan details
  plan      SubscriptionPlan @default(FREE)
  status    SubscriptionStatus @default(ACTIVE)

  // Billing
  startDate DateTime @default(now())
  endDate   DateTime?

  // Payment integration
  stripeCustomerId     String?
  stripeSubscriptionId String?

  // Metadata
  cancelledAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@map("subscriptions")
}

// ============================================================================
// ADMIN
// ============================================================================

model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed

  // Profile
  name      String
  role      AdminRole @default(ADMIN)

  // Status
  isActive  Boolean  @default(true)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastLoginAt DateTime?

  @@index([email])
  @@map("admin_users")
}

// ============================================================================
// ENUMS
// ============================================================================

enum FoodCategory {
  DAIRY
  MEAT
  SEAFOOD
  VEGETABLES
  FRUITS
  GRAINS
  BEVERAGES
  CONDIMENTS
  FROZEN
  OTHER
}

enum StorageType {
  REFRIGERATOR
  FREEZER
  PANTRY
  COUNTER
}

enum DocumentType {
  PASSPORT
  VISA
  DRIVERS_LICENSE
  ID_CARD
  INSURANCE_POLICY
  MEMBERSHIP
  CUSTOM
}

enum ExpiryStatus {
  SAFE      // > 30 days
  EXPIRING_SOON // 1-30 days
  EXPIRED   // < 0 days
}

enum ItemType {
  FOOD
  DOCUMENT
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

enum SubscriptionPlan {
  FREE
  PREMIUM
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
}

enum AdminRole {
  ADMIN
  SUPER_ADMIN
}
```

## Entity Descriptions

### User
Represents an app user with authentication credentials and profile information.

**Key Fields**:
- `email`: Unique identifier for login (validated format)
- `password`: bcrypt hashed password (salt rounds: 10)
- `isVerified`: Email verification status (future feature)
- `lastLoginAt`: Track user activity for admin analytics

**Validation Rules**:
- Email: Valid email format, unique
- Password: Minimum 8 characters, at least one number and special character
- firstName/lastName: Optional, max 50 characters each

**Business Rules**:
- Soft delete: Set `isActive = false` instead of deleting
- Free tier: Max 50 items (foodItems + documents combined)
- Premium tier: Unlimited items

### FoodItem
Represents a tracked food item with expiry date and optional photo.

**Key Fields**:
- `name`: User-defined name (e.g., "Milk", "Chicken Breast")
- `category`: Predefined categories for filtering
- `quantity`: Free-text quantity (e.g., "2 liters", "500g")
- `storageType`: Where the item is stored
- `expiryDate`: Date when item expires
- `status`: Calculated field (updated daily via cron job)
- `photoUrl`: Cloudinary public_id (not full URL)

**Validation Rules**:
- Name: Required, 1-100 characters
- Quantity: Optional, max 50 characters
- ExpiryDate: Required, must be a valid date
- PhotoUrl: Optional, Cloudinary public_id format

**Business Rules**:
- Status calculation:
  - EXPIRED: expiryDate < today
  - EXPIRING_SOON: 0 < days until expiry <= 30
  - SAFE: days until expiry > 30
- Photo limit: 10MB max (enforced by Cloudinary preset)

### Document
Represents a tracked document with expiry date (passport, visa, license, etc.).

**Key Fields**:
- `name`: User-defined name (e.g., "US Passport", "Car Insurance")
- `type`: Predefined document types
- `customType`: Used when type = CUSTOM (user-defined)
- `documentNumber`: Optional identifier (e.g., passport number)
- `issuedDate`: Optional issue date
- `expiryDate`: Date when document expires
- `status`: Calculated field (same logic as FoodItem)

**Validation Rules**:
- Name: Required, 1-100 characters
- Type: Required, must be valid DocumentType enum
- CustomType: Required if type = CUSTOM, max 50 characters
- DocumentNumber: Optional, max 50 characters
- ExpiryDate: Required, must be a valid date

**Business Rules**:
- Status calculation: Same as FoodItem
- Custom types: Allow users to define their own document types

### Notification
Represents a scheduled or sent push notification for an expiring item.

**Key Fields**:
- `itemType`: Discriminator for polymorphic relation (FOOD or DOCUMENT)
- `foodItemId` / `documentId`: Foreign key to item (one will be null)
- `title`: Notification title (e.g., "Item Expiring Soon")
- `body`: Notification body (e.g., "Milk expires in 7 days")
- `scheduledFor`: When to send the notification
- `sentAt`: Actual send time (null if not sent yet)
- `status`: Delivery status (PENDING, SENT, FAILED, CANCELLED)

**Validation Rules**:
- Title: Required, max 100 characters
- Body: Required, max 500 characters
- ScheduledFor: Required, must be future date/time
- ItemType: Required, must match foodItemId or documentId

**Business Rules**:
- Retry logic: Failed notifications retry 3 times (1min, 5min, 15min)
- Cancellation: Delete item → cancel pending notifications
- Cleanup: Delete notifications older than 90 days (daily cron job)

### NotificationPreference
User-specific notification settings (one per user).

**Key Fields**:
- `enabled`: Global notification toggle
- `foodNotificationsEnabled`: Toggle for food item notifications
- `documentNotificationsEnabled`: Toggle for document notifications
- `intervals`: Array of days before expiry to send notifications (default: [30, 15, 7, 1])
- `quietHoursStart` / `quietHoursEnd`: Time range to delay notifications
- `preferredTime`: Daily time to send notifications (e.g., "09:00")

**Validation Rules**:
- Intervals: Array of positive integers, max 10 intervals
- QuietHours: Valid time format (HH:MM), start < end
- PreferredTime: Valid time format (HH:MM)

**Business Rules**:
- Default preferences created on user signup
- Quiet hours: Delay notifications until quietHoursEnd
- Preferred time: Send all daily notifications at this time

### Subscription
Premium subscription management for a user.

**Key Fields**:
- `plan`: FREE or PREMIUM
- `status`: ACTIVE, CANCELLED, or EXPIRED
- `startDate`: When subscription started
- `endDate`: When subscription ends (null for FREE)
- `stripeCustomerId` / `stripeSubscriptionId`: Payment integration

**Validation Rules**:
- Plan: Required, must be valid SubscriptionPlan enum
- Status: Required, must be valid SubscriptionStatus enum
- EndDate: Required for PREMIUM, null for FREE

**Business Rules**:
- Free tier: Default for all users, 50 item limit
- Premium tier: Unlimited items, ad-free, export features
- Cancellation: Set status = CANCELLED, endDate = end of billing period
- Expiration: Daily cron job checks endDate, sets status = EXPIRED

### FcmToken
Firebase Cloud Messaging device tokens for push notifications.

**Key Fields**:
- `token`: FCM device token (unique)
- `userId`: User who owns this device
- `platform`: "ios" or "android"
- `deviceId`: Optional device identifier

**Validation Rules**:
- Token: Required, unique
- Platform: Required, must be "ios" or "android"

**Business Rules**:
- Multiple tokens per user: Support multiple devices
- Token refresh: Update token when FCM provides new one
- Token cleanup: Delete tokens that fail delivery (invalid/expired)

### AdminUser
Separate admin user table for web panel access.

**Key Fields**:
- `email`: Admin email (unique)
- `password`: bcrypt hashed password
- `name`: Admin display name
- `role`: ADMIN or SUPER_ADMIN

**Validation Rules**:
- Email: Valid email format, unique
- Password: Minimum 12 characters (stronger than user passwords)
- Name: Required, max 100 characters

**Business Rules**:
- No relation to User table (separate authentication)
- SUPER_ADMIN: Can manage other admins
- ADMIN: Can view users, send notifications, view stats

## Indexes

### Performance Indexes
- `users.email`: Fast login lookup
- `users.createdAt`: User growth analytics
- `food_items.userId`: User's items query
- `food_items.expiryDate`: Expiry date filtering
- `food_items.status`: Status filtering
- `food_items(userId, expiryDate)`: Composite for dashboard query
- `documents.userId`: User's documents query
- `documents.expiryDate`: Expiry date filtering
- `documents(userId, expiryDate)`: Composite for dashboard query
- `notifications.userId`: User's notifications query
- `notifications.scheduledFor`: Notification scheduler query
- `notifications.status`: Status filtering
- `notifications(userId, status)`: Composite for user notification history

### Data Integrity
- All foreign keys have `onDelete: Cascade` for automatic cleanup
- Unique constraints on `email` fields prevent duplicates
- Enum types enforce valid values at database level

## Migration Strategy

### Initial Migration
```bash
# Create initial schema
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Seed Data (Development)
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      isVerified: true,
    },
  });

  // Create notification preferences
  await prisma.notificationPreference.create({
    data: {
      userId: user.id,
      enabled: true,
      intervals: [30, 15, 7, 1],
    },
  });

  // Create test food items
  await prisma.foodItem.createMany({
    data: [
      {
        userId: user.id,
        name: 'Milk',
        category: 'DAIRY',
        storageType: 'REFRIGERATOR',
        expiryDate: new Date('2026-01-25'),
        status: 'EXPIRING_SOON',
      },
      {
        userId: user.id,
        name: 'Chicken Breast',
        category: 'MEAT',
        storageType: 'FREEZER',
        expiryDate: new Date('2026-02-15'),
        status: 'SAFE',
      },
    ],
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Row-Level Security (RLS)

While Prisma doesn't natively support PostgreSQL RLS, we implement user data isolation at the application level:

### Prisma Middleware
```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    // Middleware to enforce userId filtering
    this.$use(async (params, next) => {
      const userModels = ['FoodItem', 'Document', 'Notification'];

      if (userModels.includes(params.model)) {
        if (params.action === 'findMany' || params.action === 'findFirst') {
          // Ensure userId filter is present
          if (!params.args.where?.userId) {
            throw new Error('userId filter required for user data queries');
          }
        }
      }

      return next(params);
    });
  }
}
```

## Data Validation

### DTO Examples
```typescript
// src/items/dto/create-food-item.dto.ts
import { IsString, IsEnum, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { FoodCategory, StorageType } from '@prisma/client';

export class CreateFoodItemDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(FoodCategory)
  category: FoodCategory;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  quantity?: string;

  @IsEnum(StorageType)
  storageType: StorageType;

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
```

## Conclusion

This data model provides:
- **User Data Isolation**: All user data scoped by userId
- **Flexible Item Tracking**: Support for both food and documents
- **Robust Notifications**: Scheduled notifications with retry logic
- **Premium Features**: Subscription management for monetization
- **Admin Capabilities**: Separate admin user system
- **Performance**: Strategic indexes for common queries
- **Type Safety**: Prisma generates TypeScript types from schema

**Next Phase**: Define API contracts (OpenAPI specifications) for all endpoints.

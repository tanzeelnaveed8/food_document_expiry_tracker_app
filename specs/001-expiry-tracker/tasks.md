# Tasks: Food & Document Expiry Tracker

**Input**: Design documents from `/specs/001-expiry-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the feature specification, so test tasks are EXCLUDED from this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this is a multi-project structure:
- **Backend**: `backend/src/`
- **Mobile**: `mobile/src/`
- **Admin**: `admin/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create monorepo structure with backend/, mobile/, and admin/ directories
- [X] T002 [P] Initialize NestJS backend project with TypeScript 5.x in backend/
- [X] T003 [P] Initialize React Native 0.73+ project in mobile/
- [X] T004 [P] Initialize Next.js 14.x admin project in admin/
- [X] T005 [P] Configure ESLint and Prettier for all three projects
- [ ] T006 [P] Setup Git hooks with Husky for pre-commit linting
- [X] T007 Create .env.example files for backend/, mobile/, and admin/
- [X] T008 [P] Configure TypeScript strict mode in all projects
- [ ] T009 Setup Neon PostgreSQL database with connection string: postgresql://neondb_owner:npg_nqOypVg2vS5r@ep-long-thunder-ahiwbath-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
- [ ] T010 [P] Setup Redis instance (local or Redis Cloud) for job queue
- [ ] T011 [P] Create Firebase project and download config files (google-services.json, GoogleService-Info.plist)
- [ ] T012 [P] Create Cloudinary account and copy API credentials
- [ ] T012a [P] Create email service account (SendGrid/Mailgun/AWS SES) and copy API key

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & ORM

- [X] T013 Install Prisma 5.x in backend/package.json
- [X] T014 Copy Prisma schema from data-model.md to backend/prisma/schema.prisma
- [ ] T015 Generate Prisma Client in backend/
- [ ] T016 Create initial database migration in backend/prisma/migrations/
- [ ] T017 Create PrismaService in backend/src/prisma/prisma.service.ts with connection pooling
- [ ] T018 Create Prisma middleware for userId filtering in backend/src/prisma/prisma.service.ts
- [ ] T019 Create database seed script in backend/prisma/seed.ts with test data

### Password Reset Infrastructure

- [ ] T019a Add passwordResetToken and passwordResetExpiry fields to User model in backend/prisma/schema.prisma
- [ ] T019b Run Prisma migration for password reset fields
- [ ] T019c [P] Install email service SDK in backend/ (e.g., @sendgrid/mail)
- [ ] T019d [P] Create EmailService in backend/src/common/services/email.service.ts
- [ ] T019e [P] Create password reset email template in backend/src/common/templates/password-reset.html

### Authentication Framework

- [ ] T020 [P] Install Passport.js and JWT dependencies in backend/
- [ ] T021 [P] Create JWT strategy in backend/src/auth/jwt.strategy.ts
- [ ] T022 [P] Create JWT auth guard in backend/src/common/guards/jwt-auth.guard.ts
- [ ] T023 [P] Create GetUser decorator in backend/src/common/decorators/get-user.decorator.ts
- [ ] T024 Create AuthModule in backend/src/auth/auth.module.ts
- [ ] T025 Configure JWT secrets and expiry in backend/.env

### API Infrastructure

- [ ] T026 [P] Configure CORS middleware in backend/src/main.ts
- [ ] T027 [P] Configure Helmet security headers in backend/src/main.ts
- [ ] T028 [P] Setup global validation pipe in backend/src/main.ts
- [ ] T029 [P] Create global exception filter in backend/src/common/filters/http-exception.filter.ts
- [ ] T030 [P] Setup request logging interceptor in backend/src/common/interceptors/logging.interceptor.ts
- [ ] T031 Configure rate limiting with @nestjs/throttler in backend/src/app.module.ts

### Job Queue Infrastructure

- [ ] T032 Install Bull and Redis dependencies in backend/
- [ ] T033 Configure Bull module in backend/src/app.module.ts with Redis connection
- [ ] T034 Create notification queue in backend/src/notifications/queues/notification.queue.ts
- [ ] T035 Setup Bull Board for job monitoring in backend/src/main.ts

### Mobile App Foundation

- [ ] T036 [P] Setup React Navigation in mobile/src/navigation/
- [ ] T037 [P] Create AuthContext in mobile/src/store/AuthContext.tsx
- [ ] T038 [P] Create API client with Axios in mobile/src/services/api.ts
- [ ] T039 [P] Configure AsyncStorage wrapper in mobile/src/utils/storage.ts
- [ ] T040 Setup React Native Firebase in mobile/ (iOS and Android)
- [ ] T041 Create navigation structure (AuthNavigator, AppNavigator) in mobile/src/navigation/

### Admin Panel Foundation

- [ ] T042 [P] Setup NextAuth.js in admin/src/app/api/auth/[...nextauth]/route.ts
- [ ] T043 [P] Create API client in admin/src/lib/api.ts
- [ ] T044 [P] Configure TailwindCSS in admin/tailwind.config.js
- [ ] T045 Create admin layout in admin/src/app/layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Food Item Tracking (Priority: P1) 🎯 MVP

**Goal**: Users can create accounts and track basic food items with expiry dates

**Independent Test**: Create account, add 3-5 food items with different expiry dates, verify dashboard shows items sorted by expiry status

### Backend Implementation for US1

- [ ] T046 [P] [US1] Create User entity DTOs in backend/src/users/dto/
- [ ] T047 [P] [US1] Create FoodItem DTOs (CreateFoodItemDto, UpdateFoodItemDto) in backend/src/items/dto/
- [ ] T048 [US1] Implement UsersService in backend/src/users/users.service.ts
- [ ] T049 [US1] Implement AuthService with signup/login in backend/src/auth/auth.service.ts
- [ ] T050 [US1] Create AuthController with /signup and /login endpoints in backend/src/auth/auth.controller.ts
- [ ] T050a [US1] Implement POST /auth/forgot-password endpoint in backend/src/auth/auth.controller.ts
- [ ] T050b [US1] Implement POST /auth/reset-password endpoint in backend/src/auth/auth.controller.ts
- [ ] T050c [US1] Implement POST /auth/refresh endpoint in backend/src/auth/auth.controller.ts
- [ ] T050d [US1] Add password reset token generation and validation in backend/src/auth/auth.service.ts
- [ ] T050e [US1] Add email sending for password reset in backend/src/auth/auth.service.ts
- [ ] T051 [US1] Implement ExpiryCalculationService in backend/src/items/expiry-calculator.service.ts
- [ ] T052 [US1] Implement ItemsService with CRUD for food items in backend/src/items/items.service.ts
- [ ] T052a [US1] Implement expiry date sorting (soonest first) in backend/src/items/items.service.ts
- [ ] T053 [US1] Create ItemsController with GET /items and POST /items endpoints in backend/src/items/items.controller.ts
- [ ] T053a [US1] Add type query parameter to GET /items endpoint in backend/src/items/items.controller.ts
- [ ] T053b [US1] Add summary field to GET /items response in backend/src/items/items.service.ts
- [ ] T054 [US1] Add item count validation (50 item limit for free tier) in backend/src/items/items.service.ts
- [ ] T055 [US1] Create daily cron job to update expiry status in backend/src/items/jobs/update-expiry-status.job.ts

### Mobile Implementation for US1

- [ ] T056 [P] [US1] Create LoginScreen in mobile/src/screens/auth/LoginScreen.tsx
- [ ] T057 [P] [US1] Create SignupScreen in mobile/src/screens/auth/SignupScreen.tsx
- [ ] T058 [US1] Implement auth service methods (signup, login) in mobile/src/services/auth.service.ts
- [ ] T058a [US1] Create ForgotPasswordScreen in mobile/src/screens/auth/ForgotPasswordScreen.tsx
- [ ] T058b [US1] Create ResetPasswordScreen in mobile/src/screens/auth/ResetPasswordScreen.tsx
- [ ] T058c [US1] Implement token refresh logic in mobile/src/services/auth.service.ts
- [ ] T058d [US1] Add automatic token refresh on 401 errors in mobile/src/services/api.ts
- [ ] T059 [US1] Create DashboardScreen with item list in mobile/src/screens/dashboard/DashboardScreen.tsx
- [ ] T059a [US1] Add item type filter toggle (All/Food/Documents) to mobile/src/screens/dashboard/DashboardScreen.tsx
- [ ] T059b [US1] Implement filter state management in mobile/src/store/ItemsContext.tsx
- [ ] T059c [US1] Create StatusSummary component in mobile/src/components/StatusSummary.tsx
- [ ] T059d [US1] Add status summary calculation to dashboard in mobile/src/screens/dashboard/DashboardScreen.tsx
- [ ] T060 [US1] Create ItemCard component with expiry status badge in mobile/src/components/ItemCard.tsx
- [ ] T061 [US1] Create ExpiryBadge component (Safe, Expiring Soon, Expired) in mobile/src/components/ExpiryBadge.tsx
- [ ] T062 [US1] Create AddItemScreen for food items in mobile/src/screens/items/AddItemScreen.tsx
- [ ] T063 [US1] Implement items service methods (list, create) in mobile/src/services/items.service.ts
- [ ] T064 [US1] Add offline storage for auth tokens in mobile/src/utils/storage.ts
- [ ] T065 [US1] Implement pull-to-refresh on dashboard in mobile/src/screens/dashboard/DashboardScreen.tsx
- [ ] T065a [US1] Implement search functionality on dashboard in mobile/src/screens/dashboard/DashboardScreen.tsx
- [ ] T065b [US1] Add search query parameter to GET /items endpoint in backend/src/items/items.controller.ts

**Checkpoint**: User Story 1 complete - users can register and track basic food items

---

## Phase 4: User Story 2 - Comprehensive Food Tracking with Categories and Photos (Priority: P2)

**Goal**: Users can organize food inventory with categories, storage types, quantities, and photos

**Independent Test**: Add food items with all optional fields (category, storage type, quantity, photo), filter by category, verify all details display correctly

### Backend Implementation for US2

- [ ] T066 [P] [US2] Install Cloudinary SDK in backend/
- [ ] T067 [P] [US2] Create StorageService for Cloudinary integration in backend/src/storage/storage.service.ts
- [ ] T068 [P] [US2] Create ImageProcessorService for compression in backend/src/storage/image-processor.service.ts
- [ ] T069 [US2] Add POST /items/:id/photo endpoint in backend/src/items/items.controller.ts
- [ ] T070 [US2] Implement photo upload with validation (10MB limit) in backend/src/items/items.service.ts
- [ ] T071 [US2] Add category and storage type filtering to GET /items endpoint in backend/src/items/items.controller.ts
- [ ] T072 [US2] Implement cursor-based pagination in backend/src/items/items.service.ts

### Mobile Implementation for US2

- [ ] T073 [P] [US2] Create CategoryPicker component in mobile/src/components/CategoryPicker.tsx
- [ ] T074 [P] [US2] Create StorageTypePicker component in mobile/src/components/StorageTypePicker.tsx
- [ ] T075 [P] [US2] Create PhotoUploader component with camera/gallery in mobile/src/components/PhotoUploader.tsx
- [ ] T076 [US2] Update AddItemScreen with category, storage, quantity, photo fields in mobile/src/screens/items/AddItemScreen.tsx
- [ ] T077 [US2] Create EditItemScreen for updating food items in mobile/src/screens/items/EditItemScreen.tsx
- [ ] T078 [US2] Create ItemDetailScreen with full item info in mobile/src/screens/items/ItemDetailScreen.tsx
- [ ] T079 [US2] Add category filter to dashboard in mobile/src/screens/dashboard/DashboardScreen.tsx
- [ ] T080 [US2] Add storage type grouping to dashboard in mobile/src/screens/dashboard/DashboardScreen.tsx
- [ ] T081 [US2] Implement photo upload with progress indicator in mobile/src/services/items.service.ts

**Checkpoint**: User Story 2 complete - comprehensive food tracking with organization features

---

## Phase 5: User Story 3 - Document Expiry Tracking (Priority: P2)

**Goal**: Users can track important document expiration dates alongside food items

**Independent Test**: Add various document types (passport, visa, license, insurance, custom), set expiry dates, verify they appear on dashboard with correct status

### Backend Implementation for US3

- [ ] T082 [P] [US3] Create Document DTOs (CreateDocumentDto, UpdateDocumentDto) in backend/src/items/dto/
- [ ] T083 [US3] Add document creation logic to ItemsService in backend/src/items/items.service.ts
- [ ] T084 [US3] Update POST /items endpoint to handle document type in backend/src/items/items.controller.ts
- [ ] T085 [US3] Add document type filtering to GET /items endpoint in backend/src/items/items.controller.ts
- [ ] T086 [US3] Update expiry calculation to handle documents in backend/src/items/expiry-calculator.service.ts

### Mobile Implementation for US3

- [ ] T087 [P] [US3] Create DocumentTypePicker component in mobile/src/components/DocumentTypePicker.tsx
- [ ] T088 [P] [US3] Create AddDocumentScreen in mobile/src/screens/items/AddDocumentScreen.tsx
- [ ] T089 [US3] Update dashboard to show food/document toggle in mobile/src/screens/dashboard/DashboardScreen.tsx
- [ ] T090 [US3] Create DocumentCard component for document display in mobile/src/components/DocumentCard.tsx
- [ ] T091 [US3] Add custom document type input field in mobile/src/screens/items/AddDocumentScreen.tsx
- [ ] T092 [US3] Update ItemDetailScreen to show document-specific fields in mobile/src/screens/items/ItemDetailScreen.tsx

**Checkpoint**: User Story 3 complete - document tracking integrated with food tracking

---

## Phase 6: User Story 4 - Expiry Reminder Notifications (Priority: P2)

**Goal**: Users receive automated push notifications before items expire

**Independent Test**: Add items with expiry dates 30, 15, 7, and 1 day in the future, verify notifications are received at correct times with correct content

### Backend Implementation for US4

- [ ] T093 [P] [US4] Install Firebase Admin SDK in backend/
- [ ] T094 [P] [US4] Create FcmToken entity and repository in backend/src/users/
- [ ] T095 [P] [US4] Create NotificationPreference entity with defaults in backend/src/notifications/
- [ ] T096 [US4] Implement FCM service in backend/src/notifications/fcm.service.ts
- [ ] T097 [US4] Create NotificationSchedulerService in backend/src/notifications/notification-scheduler.service.ts
- [ ] T098 [US4] Implement daily scan job (8 AM) in backend/src/notifications/jobs/daily-scan.job.ts
- [ ] T098a [US4] Implement notification grouping logic in backend/src/notifications/notification-scheduler.service.ts
- [ ] T098b [US4] Create grouped notification message template in backend/src/notifications/templates/
- [ ] T098c [US4] Update daily scan job to detect same-day expiries in backend/src/notifications/jobs/daily-scan.job.ts
- [ ] T099 [US4] Implement send notification job with retry logic in backend/src/notifications/jobs/send-notification.job.ts
- [ ] T100 [US4] Create notification cleanup job (delete >90 days) in backend/src/notifications/jobs/cleanup-notifications.job.ts
- [ ] T101 [US4] Add FCM token registration to POST /auth/login endpoint in backend/src/auth/auth.controller.ts
- [ ] T102 [US4] Add FCM token removal to POST /auth/logout endpoint in backend/src/auth/auth.controller.ts
- [ ] T103 [US4] Create POST /notifications/test endpoint in backend/src/notifications/notifications.controller.ts

### Mobile Implementation for US4

- [ ] T104 [P] [US4] Configure FCM permissions in mobile/ios/ and mobile/android/
- [ ] T105 [P] [US4] Create notification service in mobile/src/services/notifications.service.ts
- [ ] T106 [US4] Implement FCM token retrieval on app launch in mobile/src/App.tsx
- [ ] T107 [US4] Add FCM token to login request in mobile/src/services/auth.service.ts
- [ ] T108 [US4] Implement notification tap handler (deep linking) in mobile/src/App.tsx
- [ ] T109 [US4] Add notification permission request on signup in mobile/src/screens/auth/SignupScreen.tsx
- [ ] T110 [US4] Create notification history screen in mobile/src/screens/notifications/NotificationHistoryScreen.tsx

**Checkpoint**: User Story 4 complete - automated notifications working end-to-end

---

## Phase 7: User Story 5 - Customizable Notification Preferences (Priority: P3)

**Goal**: Users can customize notification timing and quiet hours

**Independent Test**: Change notification intervals in settings (e.g., 45, 20, 10, 3 days), add items, verify notifications arrive at custom intervals

### Backend Implementation for US5

- [ ] T111 [P] [US5] Create GET /notifications/preferences endpoint in backend/src/notifications/notifications.controller.ts
- [ ] T112 [P] [US5] Create PATCH /notifications/preferences endpoint in backend/src/notifications/notifications.controller.ts
- [ ] T113 [US5] Implement preference update logic in backend/src/notifications/notifications.service.ts
- [ ] T114 [US5] Update daily scan job to use custom intervals in backend/src/notifications/jobs/daily-scan.job.ts
- [ ] T115 [US5] Implement quiet hours logic in notification scheduler in backend/src/notifications/notification-scheduler.service.ts
- [ ] T116 [US5] Add preferred time scheduling in backend/src/notifications/notification-scheduler.service.ts

### Mobile Implementation for US5

- [ ] T117 [P] [US5] Create SettingsScreen in mobile/src/screens/settings/SettingsScreen.tsx
- [ ] T118 [P] [US5] Create NotificationSettingsScreen in mobile/src/screens/settings/NotificationSettingsScreen.tsx
- [ ] T119 [US5] Add global notification toggle in mobile/src/screens/settings/NotificationSettingsScreen.tsx
- [ ] T120 [US5] Add food/document notification toggles in mobile/src/screens/settings/NotificationSettingsScreen.tsx
- [ ] T121 [US5] Create custom interval editor in mobile/src/screens/settings/NotificationSettingsScreen.tsx
- [ ] T122 [US5] Add quiet hours time pickers in mobile/src/screens/settings/NotificationSettingsScreen.tsx
- [ ] T123 [US5] Add preferred notification time picker in mobile/src/screens/settings/NotificationSettingsScreen.tsx

**Checkpoint**: User Story 5 complete - notification customization available

---

## Phase 8: User Story 6 - Premium Plan Features (Priority: P3)

**Goal**: Users can upgrade to premium for unlimited items, ad-free experience, and export features

**Independent Test**: Compare free vs premium accounts - free has item limits and ads, premium has unlimited items, no ads, and export features

### Backend Implementation for US6

- [ ] T124 [P] [US6] Create Subscription entity and service in backend/src/subscriptions/
- [ ] T125 [P] [US6] Create GET /subscriptions/plans endpoint in backend/src/subscriptions/subscriptions.controller.ts
- [ ] T126 [P] [US6] Create POST /subscriptions/subscribe endpoint in backend/src/subscriptions/subscriptions.controller.ts
- [ ] T127 [P] [US6] Create DELETE /subscriptions/cancel endpoint in backend/src/subscriptions/subscriptions.controller.ts
- [ ] T128 [P] [US6] Create GET /subscriptions/status endpoint in backend/src/subscriptions/subscriptions.controller.ts
- [ ] T129 [US6] Implement subscription status check in item creation in backend/src/items/items.service.ts
- [ ] T129a [US6] Implement subscription status sync on login in backend/src/subscriptions/subscriptions.service.ts
- [ ] T130 [US6] Create data export service (CSV/PDF) in backend/src/items/export.service.ts
- [ ] T131 [US6] Create GET /items/export endpoint (premium only) in backend/src/items/items.controller.ts
- [ ] T132 [US6] Create daily subscription expiry check job in backend/src/subscriptions/jobs/check-expiry.job.ts

### Mobile Implementation for US6

- [ ] T133 [P] [US6] Create SubscriptionScreen in mobile/src/screens/subscription/SubscriptionScreen.tsx
- [ ] T134 [P] [US6] Integrate in-app purchase (iOS) in mobile/ios/
- [ ] T135 [P] [US6] Integrate in-app purchase (Android) in mobile/android/
- [ ] T136 [US6] Add premium badge to user profile in mobile/src/screens/settings/SettingsScreen.tsx
- [ ] T137 [US6] Show upgrade prompt at 50 item limit in mobile/src/screens/items/AddItemScreen.tsx
- [ ] T138 [US6] Add banner ads for free users in mobile/src/screens/dashboard/DashboardScreen.tsx
- [ ] T139 [US6] Create export data screen (premium only) in mobile/src/screens/settings/ExportDataScreen.tsx
- [ ] T140 [US6] Implement subscription purchase flow in mobile/src/services/subscription.service.ts

**Checkpoint**: User Story 6 complete - premium features and monetization implemented

---

## Phase 9: User Story 7 - Admin Web Panel for User Management (Priority: P4)

**Goal**: Administrators can monitor app usage, view user statistics, and send targeted push notifications

**Independent Test**: Login to admin panel, view user statistics, send test notification to user segment, verify delivery

### Backend Implementation for US7

- [ ] T141 [P] [US7] Create AdminUser entity and seed in backend/prisma/seed.ts
- [ ] T142 [P] [US7] Create admin JWT strategy in backend/src/admin/admin-jwt.strategy.ts
- [ ] T143 [P] [US7] Create admin auth guard in backend/src/common/guards/admin-auth.guard.ts
- [ ] T144 [US7] Create GET /admin/stats endpoint in backend/src/admin/admin.controller.ts
- [ ] T145 [US7] Implement dashboard statistics service in backend/src/admin/admin.service.ts
- [ ] T146 [US7] Create GET /admin/users endpoint with pagination in backend/src/admin/admin.controller.ts
- [ ] T147 [US7] Create GET /admin/users/:id endpoint in backend/src/admin/admin.controller.ts
- [ ] T148 [US7] Create POST /admin/notifications/broadcast endpoint in backend/src/admin/admin.controller.ts
- [ ] T149 [US7] Implement broadcast notification service in backend/src/admin/admin.service.ts
- [ ] T150 [US7] Create GET /admin/notifications/delivery-status/:id endpoint in backend/src/admin/admin.controller.ts

### Admin Panel Implementation for US7

- [ ] T151 [P] [US7] Create login page in admin/src/app/(auth)/login/page.tsx
- [ ] T152 [P] [US7] Create dashboard page with stats cards in admin/src/app/dashboard/page.tsx
- [ ] T153 [P] [US7] Create StatsCard component in admin/src/components/StatsCard.tsx
- [ ] T154 [US7] Create users list page in admin/src/app/users/page.tsx
- [ ] T155 [US7] Create UserTable component with search/filter in admin/src/components/UserTable.tsx
- [ ] T156 [US7] Create user detail page in admin/src/app/users/[id]/page.tsx
- [ ] T157 [US7] Create notifications page in admin/src/app/notifications/page.tsx
- [ ] T158 [US7] Create NotificationComposer component in admin/src/components/NotificationComposer.tsx
- [ ] T159 [US7] Add target audience selector (all, premium, free, inactive) in admin/src/components/NotificationComposer.tsx
- [ ] T160 [US7] Create delivery status view with real-time updates in admin/src/app/notifications/[id]/page.tsx

**Checkpoint**: User Story 7 complete - admin panel operational

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T161 [P] Create comprehensive README.md in repository root
- [ ] T162 [P] Add API documentation with Swagger in backend/src/main.ts
- [ ] T163 [P] Setup error tracking with Sentry in backend/ and mobile/
- [ ] T164 [P] Add analytics tracking in mobile/src/utils/analytics.ts
- [ ] T165a [P] Implement offline queue for add/edit/delete operations in mobile/src/store/OfflineContext.tsx
- [ ] T165b [P] Create sync service with retry logic in mobile/src/services/sync.service.ts
- [ ] T165c Implement conflict detection (timestamp comparison) in mobile/src/services/sync.service.ts
- [ ] T165d Implement last-write-wins conflict resolution in mobile/src/services/sync.service.ts
- [ ] T165e [P] Add network status monitoring in mobile/src/utils/network.ts
- [ ] T165f Trigger sync on reconnection in mobile/src/App.tsx
- [ ] T166 [P] Add loading states and skeletons across mobile app
- [ ] T167 [P] Reserved for future use (search moved to T065a)
- [ ] T168 [P] Add item deletion with confirmation dialog modal in mobile/src/screens/items/ItemDetailScreen.tsx
- [ ] T168a [P] Create reusable ConfirmationDialog component in mobile/src/components/ConfirmationDialog.tsx
- [ ] T169 [P] Create onboarding flow for new users in mobile/src/screens/onboarding/
- [ ] T170 [P] Add app icon and splash screen for iOS and Android
- [ ] T171 Performance optimization: add database query indexes verification
- [ ] T172 Security audit: verify all endpoints have authentication guards
- [ ] T173 Validate quickstart.md setup instructions on clean environment
- [ ] T174 Create deployment documentation for backend (Railway/Render)
- [ ] T175 Create app store submission checklist for iOS and Android

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 10)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Works with items from US1/US2/US3
- **User Story 5 (P3)**: Depends on US4 completion (extends notification system)
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Independent feature
- **User Story 7 (P4)**: Can start after Foundational (Phase 2) - Independent admin system

### Within Each User Story

- Backend tasks before mobile tasks (API must exist before mobile can consume it)
- DTOs and services before controllers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Backend and mobile tasks within same story can run in parallel if API contract is defined
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Backend tasks that can run in parallel:
Task T046: Create User entity DTOs
Task T047: Create FoodItem DTOs

# Mobile tasks that can run in parallel:
Task T056: Create LoginScreen
Task T057: Create SignupScreen

# After backend API is complete, mobile can integrate:
Task T058: Implement auth service methods
Task T059: Create DashboardScreen
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**Estimated Timeline**: 2-3 weeks (solo developer, full-time)

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready (Week 1-2)
2. Add User Story 1 → Test independently → Deploy/Demo (Week 3) **MVP!**
3. Add User Story 2 → Test independently → Deploy/Demo (Week 4)
4. Add User Story 3 → Test independently → Deploy/Demo (Week 5)
5. Add User Story 4 → Test independently → Deploy/Demo (Week 6-7)
6. Add User Story 5 → Test independently → Deploy/Demo (Week 8)
7. Polish phase → Final release (Week 9-10)

**Estimated Timeline**: 8-10 weeks (solo developer, full-time)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Week 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (Backend + Mobile)
   - Developer B: User Story 2 (Backend + Mobile)
   - Developer C: User Story 3 (Backend + Mobile)
3. Stories complete and integrate independently
4. Continue with remaining stories in priority order

**Estimated Timeline**: 4-6 weeks (3 developers, full-time)

---

## Task Summary

**Total Tasks**: 205 (175 original + 30 remediation tasks)
**By Phase**:
- Phase 1 (Setup): 13 tasks (+1 for email service)
- Phase 2 (Foundational): 38 tasks (+5 for password reset infrastructure)
- Phase 3 (US1): 33 tasks (+13 for password reset, dashboard features, search)
- Phase 4 (US2): 16 tasks
- Phase 5 (US3): 11 tasks
- Phase 6 (US4): 21 tasks (+3 for notification grouping)
- Phase 7 (US5): 13 tasks
- Phase 8 (US6): 18 tasks (+1 for subscription sync)
- Phase 9 (US7): 20 tasks
- Phase 10 (Polish): 22 tasks (+7 for offline sync, confirmation dialog)

**By User Story**:
- US1 (User Registration & Food Tracking): 33 tasks (+13 remediation)
- US2 (Comprehensive Food Tracking): 16 tasks
- US3 (Document Tracking): 11 tasks
- US4 (Notifications): 21 tasks (+3 remediation)
- US5 (Notification Preferences): 13 tasks
- US6 (Premium Features): 18 tasks (+1 remediation)
- US7 (Admin Panel): 20 tasks

**Parallel Opportunities**: 95 tasks marked [P] can run in parallel within their phase (+6 from remediation)

**MVP Scope** (User Story 1 only): 63 tasks (Setup + Foundational + US1) - includes all critical features

**Coverage**: 100% of functional requirements (58/58) now have implementation tasks

**Critical Features Added**:
- ✅ Password reset flow (13 tasks)
- ✅ Token refresh (1 task)
- ✅ Offline sync with conflict resolution (6 tasks)
- ✅ Notification grouping (3 tasks)
- ✅ Dashboard filters and summary (4 tasks)
- ✅ Search functionality (2 tasks)
- ✅ Confirmation dialogs (1 task)
- ✅ Subscription sync (1 task)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included as they were not explicitly requested in spec.md
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

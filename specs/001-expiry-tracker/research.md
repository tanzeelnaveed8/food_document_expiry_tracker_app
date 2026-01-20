# Research & Technology Decisions

**Feature**: Food & Document Expiry Tracker
**Date**: 2026-01-17
**Status**: Complete

## Overview

This document captures technology research and decisions made for the Food & Document Expiry Tracker application. All decisions prioritize production readiness, developer experience, and cost-effectiveness for a solo developer building an MVP.

## Database: PostgreSQL via Neon

### Decision
Use PostgreSQL 15+ hosted on Neon (serverless PostgreSQL platform).

### Rationale
- **Serverless Architecture**: Auto-scaling, no server management, pay-per-use pricing
- **Connection Pooling**: Built-in pooling handles serverless function limitations
- **PostgreSQL Features**: Row-Level Security (RLS), JSONB support, full-text search
- **Developer Experience**: Instant database creation, branch-based development databases
- **Cost**: Generous free tier (0.5 GB storage, 100 hours compute/month)
- **Reliability**: 99.95% uptime SLA, automated backups, point-in-time recovery

### Alternatives Considered
- **Supabase**: Similar features but more opinionated (includes auth, storage). Neon is more flexible for custom NestJS backend.
- **PlanetScale**: MySQL-based, lacks PostgreSQL features like RLS and JSONB.
- **MongoDB Atlas**: NoSQL not ideal for relational data (users, items, notifications with clear relationships).

### Implementation Notes
- Connection string format: `postgresql://user:pass@host/db?sslmode=require`
- Use Prisma connection pooling: `connection_limit=10` for serverless
- Enable RLS policies for user data isolation (defense in depth)

---

## ORM: Prisma

### Decision
Use Prisma 5.x as the database ORM and migration tool.

### Rationale
- **Type Safety**: Auto-generated TypeScript types from schema
- **Developer Experience**: Intuitive query API, excellent VS Code integration
- **Migrations**: Declarative schema with automatic migration generation
- **NestJS Integration**: Official `@nestjs/prisma` package, well-documented patterns
- **Performance**: Efficient query generation, connection pooling support
- **Neon Compatibility**: First-class support for serverless PostgreSQL

### Alternatives Considered
- **TypeORM**: More mature but less type-safe, verbose decorators, migration complexity
- **Sequelize**: Older API, weaker TypeScript support
- **Drizzle ORM**: Newer, lighter, but less ecosystem support and documentation

### Implementation Notes
```prisma
// Example schema pattern
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  items     Item[]
  createdAt DateTime @default(now())

  @@index([email])
}
```

---

## Job Queue: Bull + Redis

### Decision
Use Bull (Redis-based job queue) for background notification processing.

### Rationale
- **Reliability**: Persistent jobs, automatic retries, dead letter queue
- **Scheduling**: Cron-based scheduling for daily notification scans
- **Scalability**: Distributed processing, rate limiting, priority queues
- **Monitoring**: Bull Board UI for job inspection and debugging
- **NestJS Integration**: `@nestjs/bull` official package with decorators
- **Cost**: Redis Cloud free tier (30 MB) sufficient for MVP job queue

### Alternatives Considered
- **Agenda**: MongoDB-based, but we're using PostgreSQL
- **BullMQ**: Newer version of Bull, but Bull is more stable and well-documented
- **pg-boss**: PostgreSQL-based, but less feature-rich than Bull

### Implementation Notes
- Redis connection: Use Redis Cloud or local Redis for development
- Job types: `daily-scan`, `send-notification`, `cleanup-old-notifications`
- Retry strategy: 3 attempts with exponential backoff (1min, 5min, 15min)
- Rate limiting: 500 FCM messages/second (Firebase limit)

---

## Push Notifications: Firebase Cloud Messaging (FCM)

### Decision
Use Firebase Cloud Messaging for cross-platform push notifications.

### Rationale
- **Cross-Platform**: Single API for iOS and Android
- **Reliability**: Google infrastructure, 95%+ delivery rate
- **Free**: Unlimited notifications at no cost
- **Features**: Topic-based messaging, device groups, notification scheduling
- **React Native Support**: `@react-native-firebase/messaging` official library
- **Admin SDK**: Node.js SDK for server-side sending

### Alternatives Considered
- **OneSignal**: Third-party service, adds dependency and potential cost
- **Pusher Beams**: Limited free tier (1000 devices)
- **Apple Push Notification Service (APNS) + Firebase Cloud Messaging (FCM) separately**: More complex, need to manage two systems

### Implementation Notes
- Firebase project setup: Enable FCM in Firebase Console
- Device token management: Store FCM tokens in User table
- Notification payload: `{ title, body, data: { itemId, type } }`
- Deep linking: Handle notification tap to open specific item

---

## Photo Storage: Cloudinary

### Decision
Use Cloudinary for photo upload, storage, and transformation.

### Rationale
- **Free Tier**: 25 GB storage, 25 GB bandwidth/month (sufficient for MVP)
- **Automatic Optimization**: Image compression, format conversion (WebP), responsive images
- **CDN**: Global content delivery for fast image loading
- **Transformations**: On-the-fly resizing, cropping, quality adjustment
- **Upload API**: Direct upload from mobile app with signed URLs
- **No Server Processing**: Offload image processing from backend

### Alternatives Considered
- **AWS S3 + CloudFront**: More complex setup, requires Lambda for image processing
- **Supabase Storage**: Limited free tier (1 GB), less mature than Cloudinary
- **Self-hosted**: Requires server storage, CDN setup, image processing library

### Implementation Notes
- Upload preset: `food_items` with auto-compression (quality: 80, max width: 1200px)
- Signed uploads: Generate signature on backend for secure uploads
- URL format: `https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.jpg`
- Fallback: Store Cloudinary public_id in database, not full URL

---

## Authentication: JWT Tokens

### Decision
Use JSON Web Tokens (JWT) with Passport.js for authentication.

### Rationale
- **Stateless**: No server-side session storage, scales horizontally
- **Mobile-Friendly**: Token stored in secure storage (iOS Keychain, Android Keystore)
- **Standard**: Industry-standard approach, well-documented
- **NestJS Integration**: `@nestjs/passport` and `@nestjs/jwt` official packages
- **Flexibility**: Custom claims (userId, role, subscription status)

### Alternatives Considered
- **Session-based auth**: Requires session store (Redis), not ideal for mobile
- **OAuth2**: Overkill for MVP, adds complexity
- **Firebase Auth**: Vendor lock-in, less control over user data

### Implementation Notes
- Token expiry: Access token (15 min), refresh token (7 days)
- Storage: httpOnly cookies for web admin, secure storage for mobile
- Claims: `{ userId, email, role, isPremium, iat, exp }`
- Refresh flow: `/auth/refresh` endpoint with refresh token

---

## Mobile State Management: React Context API

### Decision
Use React Context API for global state management in mobile app.

### Rationale
- **Built-in**: No additional dependencies, part of React
- **Sufficient for MVP**: Simple state (auth, items, offline queue)
- **Performance**: Acceptable for small-to-medium state trees
- **Learning Curve**: Minimal, standard React patterns

### Alternatives Considered
- **Redux**: Overkill for MVP, boilerplate-heavy
- **Zustand**: Lightweight but adds dependency
- **MobX**: More complex, steeper learning curve

### Implementation Notes
- Contexts: `AuthContext`, `ItemsContext`, `OfflineContext`
- Persistence: Sync context state to AsyncStorage for offline support
- Pattern: Context + useReducer for complex state updates

---

## Offline Storage: AsyncStorage

### Decision
Use React Native AsyncStorage for offline data persistence.

### Rationale
- **Official**: Part of React Native community packages
- **Simple API**: Key-value store, async operations
- **Cross-Platform**: Works on iOS and Android
- **Sufficient**: Handles offline item queue, auth tokens, user preferences

### Alternatives Considered
- **SQLite**: More complex, overkill for simple offline queue
- **Realm**: Heavy dependency, designed for complex offline-first apps
- **MMKV**: Faster but newer, less battle-tested

### Implementation Notes
- Keys: `@auth_token`, `@user_data`, `@offline_items`, `@preferences`
- Sync strategy: Queue offline changes, sync on reconnection
- Size limit: ~6 MB on iOS, ~10 MB on Android (sufficient for MVP)

---

## Testing Framework: Jest + Supertest + Detox

### Decision
- **Unit/Integration**: Jest (built-in with NestJS)
- **API Testing**: Supertest (HTTP assertions)
- **E2E Mobile**: Detox (React Native E2E framework)

### Rationale
- **Jest**: Standard for TypeScript/Node.js, excellent NestJS integration
- **Supertest**: Simple API testing, works with NestJS test module
- **Detox**: Most mature React Native E2E framework, supports iOS/Android simulators

### Alternatives Considered
- **Mocha/Chai**: Less TypeScript-friendly than Jest
- **Cypress**: Web-only, doesn't support React Native
- **Appium**: More complex setup than Detox

### Implementation Notes
- Test database: Separate PostgreSQL database for integration tests
- Test isolation: Transaction rollback between tests
- E2E: Run on iOS simulator (faster) for CI, manual Android testing

---

## Deployment Platforms

### Backend: Railway

**Decision**: Deploy NestJS backend to Railway.

**Rationale**:
- **Simplicity**: Git-based deployment, automatic builds
- **Free Tier**: $5 credit/month (sufficient for MVP)
- **PostgreSQL Integration**: Easy connection to Neon
- **Environment Variables**: Secure secrets management
- **Logs**: Built-in logging and monitoring

**Alternatives**: Render (similar), Vercel (serverless functions, not ideal for Bull jobs), Heroku (expensive)

### Mobile: App Store + Play Store

**Decision**: Standard app store distribution with TestFlight/Internal Testing for beta.

**Rationale**: Required for production mobile apps, no alternatives.

### Admin Panel: Vercel

**Decision**: Deploy Next.js admin panel to Vercel.

**Rationale**:
- **Optimized for Next.js**: Built by Next.js creators
- **Free Tier**: Generous limits for admin panel traffic
- **Automatic Deployments**: Git-based, preview deployments
- **Edge Functions**: Fast global performance

---

## Cost Estimate (MVP)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Neon (Database) | 0.5 GB, 100 hrs/month | $0 (within free tier) |
| Redis Cloud | 30 MB | $0 (within free tier) |
| Cloudinary | 25 GB storage/bandwidth | $0 (within free tier) |
| Firebase (FCM) | Unlimited | $0 |
| Railway (Backend) | $5 credit/month | $0-5/month |
| Vercel (Admin) | Generous free tier | $0 |
| **Total** | | **$0-5/month** |

**Post-MVP Scaling** (10K users):
- Neon: ~$20/month (1 GB storage, 300 hrs compute)
- Redis Cloud: ~$10/month (100 MB)
- Cloudinary: ~$0 (still within free tier with compression)
- Railway: ~$20/month (increased compute)
- **Total**: ~$50/month

---

## Security Considerations

### Data Protection
- **Encryption at Rest**: Neon provides automatic encryption
- **Encryption in Transit**: TLS 1.3 for all API communication
- **Row-Level Security**: PostgreSQL RLS policies for user data isolation
- **Input Validation**: Class-validator on all DTOs

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds = 10
- **JWT Secret**: Strong random secret (256-bit) in environment variable
- **Token Expiry**: Short-lived access tokens (15 min)
- **Refresh Token Rotation**: New refresh token on each refresh

### API Security
- **Rate Limiting**: Throttler guard (10 req/sec per IP)
- **CORS**: Whitelist mobile app and admin panel origins
- **Helmet**: Security headers (CSP, HSTS, X-Frame-Options)
- **SQL Injection**: Prisma parameterized queries (automatic protection)

---

## Performance Optimization

### Database
- **Indexes**: userId, expiryDate, createdAt, email
- **Connection Pooling**: Prisma pool size = 10 for serverless
- **Query Optimization**: Select only needed fields, use pagination

### API
- **Caching**: Redis cache for user preferences (TTL: 5 min)
- **Compression**: Gzip compression for API responses
- **Pagination**: Cursor-based pagination (limit: 50 items/page)

### Mobile
- **Image Optimization**: Cloudinary auto-compression (quality: 80)
- **Lazy Loading**: Load images on scroll, not all at once
- **Offline-First**: AsyncStorage cache, sync on reconnection

---

## Development Tools

### Code Quality
- **ESLint**: TypeScript linting with recommended rules
- **Prettier**: Code formatting (consistent style)
- **Husky**: Pre-commit hooks (lint, format, test)

### Monitoring (Post-MVP)
- **Sentry**: Error tracking and crash reporting
- **LogRocket**: Session replay for debugging
- **Firebase Analytics**: User behavior tracking

---

## Conclusion

All technology decisions prioritize:
1. **Production Readiness**: Battle-tested, reliable technologies
2. **Developer Experience**: Minimal boilerplate, excellent TypeScript support
3. **Cost Efficiency**: Free tiers for MVP, predictable scaling costs
4. **Simplicity**: Avoid over-engineering, use established patterns

**Next Phase**: Proceed to data model design and API contract definition.

---
id: 003
title: Implementation plan for expiry tracker
stage: plan
date: 2026-01-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-expiry-tracker
branch: 001-expiry-tracker
user: user
command: /sp.plan
labels: ["implementation-plan", "nestjs", "react-native", "prisma", "neon", "architecture"]
links:
  spec: specs/001-expiry-tracker/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-expiry-tracker/plan.md
  - specs/001-expiry-tracker/research.md
  - specs/001-expiry-tracker/data-model.md
  - specs/001-expiry-tracker/quickstart.md
  - specs/001-expiry-tracker/contracts/auth.openapi.yaml
  - specs/001-expiry-tracker/contracts/items.openapi.yaml
  - specs/001-expiry-tracker/contracts/notifications.openapi.yaml
  - specs/001-expiry-tracker/contracts/admin.openapi.yaml
  - CLAUDE.md
tests:
  - none
---

## Prompt

create a practical step by step implementation plan for building the food & document expiry tracker app.

include:
- database schema overview (users, food items, documents, notifications, plans)
- prisma + neon setup steps
- backend module breakdown in nestjs
- api endpoints list
- expiry reminder job strategy
- admin panel responsibilities
- recommended development order

assume a solo developer building an mvp first.
keep the plan realistic, clear and execution focused.

## Response snapshot

Created comprehensive implementation plan for Food & Document Expiry Tracker with complete technical architecture and execution roadmap.

**Main Plan (plan.md)**:
- Technical context: TypeScript 5.x, NestJS 10.x, React Native 0.73+, Next.js 14.x, Prisma 5.x, PostgreSQL (Neon), Redis (Bull queue)
- Constitution check: All 6 principles satisfied (privacy, architecture, security, scalability, testing, simplicity)
- Project structure: 3 separate projects (backend, mobile, admin) with detailed folder organization
- MVP timeline: 8-10 weeks for solo developer (Week 1-2: Backend foundation, Week 3-4: Item management, Week 5-6: Mobile app, Week 7-8: Notifications, Week 9-10: Polish)
- Post-MVP: 6-8 weeks for premium features, admin panel, and enhancements
- Expiry reminder job strategy: Bull queue with 3 job types (daily scan, send notification, cleanup)
- Admin panel: Dashboard stats, user management, broadcast notifications, analytics
- Deployment: Railway (backend), App Store/Play Store (mobile), Vercel (admin)

**Research (research.md)**:
- Database: PostgreSQL via Neon (serverless, auto-scaling, RLS support)
- ORM: Prisma (type-safe, excellent DX, migration management)
- Job Queue: Bull + Redis (reliable, distributed, retry logic)
- Photo Storage: Cloudinary (free tier, auto-compression, CDN)
- Push Notifications: Firebase Cloud Messaging (cross-platform, free, reliable)
- Authentication: JWT tokens (stateless, mobile-friendly)
- Cost estimate: $0-5/month for MVP, ~$50/month at 10K users

**Data Model (data-model.md)**:
- Complete Prisma schema with 8 entities: User, FoodItem, Document, Notification, NotificationPreference, Subscription, FcmToken, AdminUser
- Enums: FoodCategory (10 types), StorageType (4 types), DocumentType (7 types), ExpiryStatus (3 states), NotificationStatus (4 states)
- Indexes: Strategic indexes on userId, expiryDate, status for query performance
- Validation rules: DTO examples with class-validator decorators
- Prisma middleware: Enforce userId filtering for user data isolation
- Seed data: Test users, items, and admin accounts

**API Contracts (contracts/)**:
- auth.openapi.yaml: 6 endpoints (signup, login, logout, refresh, forgot-password, reset-password)
- items.openapi.yaml: 6 endpoints (list, create, get, update, delete, upload photo) with pagination and filtering
- notifications.openapi.yaml: 4 endpoints (get preferences, update preferences, history, test notification)
- admin.openapi.yaml: 5 endpoints (stats, list users, user details, broadcast notification, delivery status)
- Total: 21 REST API endpoints with complete request/response schemas

**Quickstart (quickstart.md)**:
- Prerequisites: Node.js 20.x, Git, Redis, React Native environment
- Required accounts: Neon, Cloudinary, Firebase, Redis Cloud (optional)
- Setup instructions: Backend (NestJS), Mobile (React Native), Admin (Next.js)
- Environment variables: Complete reference for all 3 projects
- Common issues: 9 troubleshooting scenarios with solutions
- Development workflow: Running all services, testing, debugging
- Useful commands: Quick reference for common tasks

**Key Architectural Decisions**:
1. Monolithic NestJS backend (not microservices) - simplicity for solo developer
2. Bull job queue for notification scheduling - reliable, scalable, retry logic
3. Prisma ORM - type safety, excellent DX, migration management
4. Cursor-based pagination - better performance than offset pagination
5. Cloudinary for photos - offload image processing, free tier sufficient
6. JWT authentication - stateless, mobile-friendly, standard approach

**Constitutional Compliance**:
- Privacy: Row-Level Security via Prisma middleware, userId filtering on all queries
- Architecture: Feature-based modules, service layer separation, clear naming
- Security: Class-validator DTOs, Prisma parameterized queries, Helmet middleware, JWT in httpOnly cookies
- Scalability: Database indexes, pagination, connection pooling, Redis caching, background jobs
- Testing: Unit tests (Jest), integration tests (Supertest), E2E tests (Detox)
- Simplicity: Monolithic backend, established patterns, YAGNI principle, no premature abstraction

## Outcome

- ✅ Impact: Complete implementation plan ready for task generation and development
- 🧪 Tests: No tests created (planning phase)
- 📁 Files: Created 8 files (plan, research, data model, quickstart, 4 API contracts)
- 🔁 Next prompts: /sp.tasks to generate detailed task breakdown, then begin Week 1 implementation
- 🧠 Reflection: Plan is execution-focused for solo developer with realistic 8-10 week MVP timeline. Technology choices prioritize production readiness, developer experience, and cost efficiency. All constitutional principles satisfied without violations. Database schema supports all functional requirements with proper indexes and validation. API contracts provide complete specifications for frontend integration. Quickstart guide enables rapid environment setup with troubleshooting for common issues.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan is comprehensive and actionable
- Graders run and results (PASS/FAIL): Constitutional check PASS (all 6 principles satisfied)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A

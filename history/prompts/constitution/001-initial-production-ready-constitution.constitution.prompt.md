---
id: 001
title: Initial production-ready constitution
stage: constitution
date: 2026-01-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "setup", "architecture", "production-ready"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

you are a senior full stack engineer and software architect.

your responsibility is to design and plan a production ready food and document expiry tracker application.

rules:
- follow clean and simple architecture
- think like this app will go to real users
- prioritize clarity over over engineering
- backend should be scalable and secure
- use postgresql as primary database via neon
- all data must be user isolated and private
- prefer maintainable folder structures
- explain decisions briefly when needed

## Response snapshot

Created comprehensive constitution (v1.0.0) for Food & Document Expiry Tracker application with 6 core principles:

1. **User Data Privacy & Isolation (NON-NEGOTIABLE)**: Strict user data isolation with Row-Level Security, authentication on every request, and user-scoped queries
2. **Clean & Simple Architecture**: Separation of concerns, clear naming, single responsibilities, feature-based organization
3. **Security First**: Input validation, parameterized queries, secrets in env vars, HTTPS, security headers, httpOnly cookies
4. **Scalable Backend Design**: Indexed queries, pagination, connection pooling, stateless API, caching, background jobs
5. **Test-Driven Quality**: Unit, integration, and E2E tests with 70% coverage minimum, CI pipeline enforcement
6. **Simplicity Over Complexity**: Monolithic start, established patterns, YAGNI principle, refactor when patterns emerge

**Technology Stack Defined:**
- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: Next.js API Routes + PostgreSQL (Neon) + Prisma ORM
- Auth: NextAuth.js with JWT + httpOnly cookies
- Deployment: Vercel + Neon

**Security Requirements:** MFA support, password complexity, rate limiting, RLS policies, audit logging, TLS 1.3, CORS configuration

**Development Workflow:** ESLint/Prettier, TypeScript strict mode, pre-commit hooks, code review required, staging environment, feature flags, health checks

**Governance:** Constitutional compliance required for all PRs, semantic versioning for amendments, quarterly reviews, CI/CD enforcement

## Outcome

- ✅ Impact: Established foundational governance and architectural principles for production-ready application
- 🧪 Tests: No tests created (constitution document)
- 📁 Files: Created .specify/memory/constitution.md (v1.0.0)
- 🔁 Next prompts: Feature specification (/sp.specify), implementation planning (/sp.plan), or initial project setup
- 🧠 Reflection: Constitution balances production readiness with simplicity. Clear non-negotiables (privacy, security) with pragmatic guidelines (start simple, add complexity when justified). Technology choices align with requirements (Next.js for full-stack simplicity, Neon for serverless PostgreSQL, Prisma for type safety).

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (initial setup)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A

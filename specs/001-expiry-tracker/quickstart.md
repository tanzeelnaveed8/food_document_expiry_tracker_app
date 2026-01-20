# Quickstart Guide: Food & Document Expiry Tracker

**Feature**: Food & Document Expiry Tracker
**Date**: 2026-01-17
**Audience**: Solo developer setting up the development environment

## Overview

This guide walks you through setting up the complete development environment for the Food & Document Expiry Tracker application, including backend (NestJS), mobile app (React Native), and admin panel (Next.js).

**Estimated Setup Time**: 2-3 hours (first time)

## Prerequisites

### Required Software

1. **Node.js 20.x LTS**
   - Download: https://nodejs.org/
   - Verify: `node --version` (should show v20.x.x)

2. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

3. **PostgreSQL Client** (optional, for local testing)
   - Download: https://www.postgresql.org/download/
   - Or use Neon web console

4. **Redis** (for job queue)
   - **macOS**: `brew install redis`
   - **Windows**: Download from https://redis.io/download or use Redis Cloud
   - **Linux**: `sudo apt-get install redis-server`
   - Verify: `redis-cli ping` (should return "PONG")

5. **React Native Development Environment**
   - **iOS** (macOS only):
     - Xcode 14+ from App Store
     - CocoaPods: `sudo gem install cocoapods`
   - **Android**:
     - Android Studio with Android SDK
     - Java Development Kit (JDK) 11+
   - Follow official guide: https://reactnative.dev/docs/environment-setup

### Required Accounts

1. **Neon** (PostgreSQL hosting)
   - Sign up: https://neon.tech/
   - Create project: "expiry-tracker"
   - Copy connection string

2. **Cloudinary** (photo storage)
   - Sign up: https://cloudinary.com/
   - Copy: Cloud name, API key, API secret

3. **Firebase** (push notifications)
   - Create project: https://console.firebase.google.com/
   - Enable Cloud Messaging
   - Download:
     - `google-services.json` (Android)
     - `GoogleService-Info.plist` (iOS)
   - Copy: Server key for backend

4. **Redis Cloud** (optional, if not running locally)
   - Sign up: https://redis.com/try-free/
   - Create database (free tier: 30MB)
   - Copy connection string

## Project Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd food-document-expiry-tracker

# Checkout feature branch
git checkout 001-expiry-tracker
```

### 2. Backend Setup (NestJS)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

**Edit `.env` file:**

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis (Job Queue)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
# Or use Redis Cloud connection string:
# REDIS_URL="redis://default:password@host:port"

# Cloudinary (Photo Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Firebase Cloud Messaging
FCM_PROJECT_ID="your-firebase-project-id"
FCM_PRIVATE_KEY="your-firebase-private-key"
FCM_CLIENT_EMAIL="your-firebase-client-email"

# Application
PORT=3000
NODE_ENV="development"

# CORS (for mobile and admin)
CORS_ORIGINS="http://localhost:3001,exp://localhost:19000"
```

**Initialize Database:**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with test data
npx prisma db seed
```

**Start Development Server:**

```bash
# Start backend server
npm run start:dev

# Server should be running at http://localhost:3000
# API docs available at http://localhost:3000/api/docs (if Swagger configured)
```

**Verify Backend:**

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Mobile App Setup (React Native)

```bash
# Navigate to mobile directory
cd ../mobile

# Install dependencies
npm install

# iOS only: Install CocoaPods dependencies
cd ios && pod install && cd ..

# Copy environment template
cp .env.example .env
```

**Edit `.env` file:**

```env
# API Configuration
API_URL="http://localhost:3000/api"

# For iOS simulator, use localhost
# For Android emulator, use 10.0.2.2
# For physical device, use your computer's IP address
# API_URL="http://192.168.1.100:3000/api"

# Firebase (will be configured via google-services.json and GoogleService-Info.plist)
```

**Configure Firebase:**

1. **Android:**
   ```bash
   # Copy google-services.json to android/app/
   cp ~/Downloads/google-services.json android/app/
   ```

2. **iOS:**
   ```bash
   # Copy GoogleService-Info.plist to ios/
   cp ~/Downloads/GoogleService-Info.plist ios/
   ```

**Start Metro Bundler:**

```bash
# Start Metro bundler
npm start
```

**Run on iOS (macOS only):**

```bash
# In a new terminal
npm run ios

# Or specify simulator
npm run ios -- --simulator="iPhone 15 Pro"
```

**Run on Android:**

```bash
# Start Android emulator first (via Android Studio)
# Or connect physical device with USB debugging enabled

# In a new terminal
npm run android
```

**Verify Mobile App:**

1. App should launch on simulator/emulator
2. Try signing up with a test account
3. Add a test food item
4. Verify item appears on dashboard

### 4. Admin Panel Setup (Next.js)

```bash
# Navigate to admin directory
cd ../admin

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

**Edit `.env.local` file:**

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"

# Admin Credentials (for development)
# In production, these should be in database
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

**Start Development Server:**

```bash
# Start Next.js dev server
npm run dev

# Admin panel should be running at http://localhost:3001
```

**Verify Admin Panel:**

1. Open http://localhost:3001
2. Login with admin credentials
3. View dashboard statistics
4. Check user list

## Development Workflow

### Running All Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Redis (if running locally):**
```bash
redis-server
```

**Terminal 3 - Mobile:**
```bash
cd mobile
npm start
```

**Terminal 4 - Mobile Platform:**
```bash
cd mobile
npm run ios  # or npm run android
```

**Terminal 5 - Admin Panel:**
```bash
cd admin
npm run dev
```

### Testing

**Backend Tests:**
```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**Mobile Tests:**
```bash
cd mobile

# Unit tests
npm test

# E2E tests (requires simulator/emulator running)
npm run test:e2e
```

### Database Management

**View Database:**
```bash
cd backend

# Open Prisma Studio (GUI for database)
npx prisma studio

# Opens at http://localhost:5555
```

**Reset Database:**
```bash
cd backend

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Reseed with test data
npx prisma db seed
```

**Create Migration:**
```bash
cd backend

# After modifying schema.prisma
npx prisma migrate dev --name add_new_field

# Generate updated Prisma Client
npx prisma generate
```

### Debugging

**Backend Debugging (VS Code):**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

**Mobile Debugging:**

1. **React Native Debugger:**
   ```bash
   # Install React Native Debugger
   brew install --cask react-native-debugger  # macOS

   # Or download from: https://github.com/jhen0409/react-native-debugger
   ```

2. **Enable Debug Menu:**
   - iOS: Cmd+D in simulator
   - Android: Cmd+M (macOS) or Ctrl+M (Windows/Linux)

3. **View Logs:**
   ```bash
   # iOS logs
   npx react-native log-ios

   # Android logs
   npx react-native log-android
   ```

## Common Issues & Solutions

### Issue: Database Connection Failed

**Symptoms:** Backend fails to start with "Can't reach database server"

**Solutions:**
1. Verify Neon connection string in `.env`
2. Check if `?sslmode=require` is appended to connection string
3. Test connection: `npx prisma db pull`
4. Ensure Neon project is not paused (free tier auto-pauses after inactivity)

### Issue: Redis Connection Failed

**Symptoms:** Backend starts but notifications don't work

**Solutions:**
1. Check if Redis is running: `redis-cli ping`
2. Start Redis: `redis-server` (or `brew services start redis` on macOS)
3. Verify Redis connection in `.env`
4. Use Redis Cloud if local Redis is problematic

### Issue: Mobile App Can't Connect to Backend

**Symptoms:** API requests fail with "Network Error"

**Solutions:**
1. **iOS Simulator:** Use `http://localhost:3000`
2. **Android Emulator:** Use `http://10.0.2.2:3000`
3. **Physical Device:** Use your computer's IP address (e.g., `http://192.168.1.100:3000`)
4. Ensure backend is running and accessible
5. Check CORS configuration in backend `.env`

### Issue: Firebase Notifications Not Working

**Symptoms:** Notifications not received on device

**Solutions:**
1. Verify `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is in correct location
2. Check FCM credentials in backend `.env`
3. Ensure notification permissions granted on device
4. Test with `/notifications/test` endpoint
5. Check Firebase Console for delivery status

### Issue: Prisma Client Not Found

**Symptoms:** Backend fails with "Cannot find module '@prisma/client'"

**Solutions:**
```bash
cd backend
npx prisma generate
npm install
```

### Issue: Metro Bundler Port Conflict

**Symptoms:** "Port 8081 already in use"

**Solutions:**
```bash
# Kill process on port 8081
npx react-native start --reset-cache --port 8082

# Or kill the process manually
lsof -ti:8081 | xargs kill -9  # macOS/Linux
```

### Issue: iOS Build Failed

**Symptoms:** Xcode build errors

**Solutions:**
```bash
cd mobile/ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Issue: Android Build Failed

**Symptoms:** Gradle build errors

**Solutions:**
```bash
cd mobile/android
./gradlew clean
cd ..
npm run android
```

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| JWT_SECRET | Secret for JWT access tokens | `random-256-bit-string` |
| JWT_REFRESH_SECRET | Secret for JWT refresh tokens | `random-256-bit-string` |
| REDIS_HOST | Redis server host | `localhost` |
| REDIS_PORT | Redis server port | `6379` |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | `your-cloud-name` |
| CLOUDINARY_API_KEY | Cloudinary API key | `123456789012345` |
| CLOUDINARY_API_SECRET | Cloudinary API secret | `abcdefghijklmnopqrstuvwxyz` |
| FCM_PROJECT_ID | Firebase project ID | `expiry-tracker-12345` |
| FCM_PRIVATE_KEY | Firebase private key | `-----BEGIN PRIVATE KEY-----\n...` |
| FCM_CLIENT_EMAIL | Firebase client email | `firebase-adminsdk@project.iam.gserviceaccount.com` |

### Mobile (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| API_URL | Backend API URL | `http://localhost:3000/api` |

### Admin (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | `http://localhost:3000/api` |
| NEXTAUTH_URL | Admin panel URL | `http://localhost:3001` |
| NEXTAUTH_SECRET | NextAuth secret | `random-256-bit-string` |

## Next Steps

1. **Review Implementation Plan:** Read `plan.md` for detailed architecture
2. **Review Data Model:** Read `data-model.md` for database schema
3. **Review API Contracts:** Check `contracts/*.openapi.yaml` for API specifications
4. **Start Development:** Begin with Week 1 tasks (backend foundation)
5. **Run Tests:** Ensure all tests pass before making changes

## Useful Commands

```bash
# Backend
cd backend
npm run start:dev          # Start dev server
npm run test               # Run tests
npm run test:watch         # Run tests in watch mode
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create migration

# Mobile
cd mobile
npm start                  # Start Metro bundler
npm run ios                # Run on iOS
npm run android            # Run on Android
npm test                   # Run tests
npm run lint               # Lint code

# Admin
cd admin
npm run dev                # Start dev server
npm run build              # Build for production
npm run lint               # Lint code

# Database
cd backend
npx prisma migrate reset   # Reset database
npx prisma db seed         # Seed test data
npx prisma generate        # Generate Prisma Client
```

## Support & Resources

- **NestJS Docs:** https://docs.nestjs.com/
- **Prisma Docs:** https://www.prisma.io/docs/
- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **Next.js Docs:** https://nextjs.org/docs
- **Firebase Docs:** https://firebase.google.com/docs/cloud-messaging
- **Neon Docs:** https://neon.tech/docs/introduction

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] All prerequisites installed and versions correct
- [ ] All environment variables configured in `.env` files
- [ ] Database migrations run successfully
- [ ] Redis server running (if using local Redis)
- [ ] Backend server running and accessible
- [ ] Firebase configuration files in correct locations
- [ ] CORS origins configured correctly
- [ ] No port conflicts (3000, 3001, 8081)
- [ ] Node modules installed in all projects
- [ ] Prisma Client generated

---

**Setup Complete!** You're ready to start building the Food & Document Expiry Tracker. Begin with the backend foundation (Week 1 in `plan.md`).

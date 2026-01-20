# Admin Panel Testing Guide

**Date:** 2026-01-18
**Purpose:** Complete testing checklist for admin panel functionality

---

## Prerequisites

### 1. Start Backend Server

Open a terminal and run:
```bash
cd backend
npm run start:dev
```

**Expected Output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [RoutesResolver] AdminController {/admin}:
[Nest] INFO [RouterExplorer] Mapped {/admin/stats, GET} route
[Nest] INFO [RouterExplorer] Mapped {/admin/users, GET} route
[Nest] INFO [RouterExplorer] Mapped {/admin/users/:id, GET} route
[Nest] INFO [RouterExplorer] Mapped {/admin/notifications/broadcast, POST} route
[Nest] INFO Application is running on: http://localhost:3000
```

**Verify Backend:**
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2026-01-18T..."}
```

---

## Test Suite 1: Admin Authentication

### Test 1.1: Login as Admin User

**Command:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "isActive": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**✅ Success Criteria:**
- Status code: 200
- Returns user object with admin email
- Returns accessToken and refreshToken
- Tokens are valid JWT strings

**Save the accessToken for subsequent tests!**

---

### Test 1.2: Login with Invalid Credentials

**Command:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"wrongpassword\"}"
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**✅ Success Criteria:**
- Status code: 401
- Returns error message

---

### Test 1.3: Login as Regular User (Should Work)

**Command:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "isActive": true
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

**✅ Success Criteria:**
- Regular users can login successfully
- Returns valid tokens

---

## Test Suite 2: Admin Dashboard Statistics

### Test 2.1: Get Dashboard Stats (Admin Token)

**Command:**
```bash
curl http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN_FROM_TEST_1.1>"
```

**Expected Response:**
```json
{
  "users": {
    "total": 1,
    "active": 1,
    "inactive": 0,
    "premium": 0,
    "premiumPercentage": 0
  },
  "items": {
    "total": 5,
    "food": 3,
    "documents": 2,
    "expired": 0,
    "expiringSoon": 2
  },
  "notifications": {
    "sentToday": 0,
    "sentThisWeek": 0,
    "deliveryRate": 100,
    "failedToday": 0
  },
  "growth": {
    "newUsersToday": 0,
    "newUsersThisWeek": 0,
    "newUsersThisMonth": 1
  }
}
```

**✅ Success Criteria:**
- Status code: 200
- Returns all 4 sections: users, items, notifications, growth
- Numbers match database state
- All fields are present

---

### Test 2.2: Get Dashboard Stats (Regular User Token)

**Command:**
```bash
curl http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer <REGULAR_USER_TOKEN_FROM_TEST_1.3>"
```

**Expected Response:**
```json
{
  "statusCode": 403,
  "message": "Admin access required"
}
```

**✅ Success Criteria:**
- Status code: 403
- Regular users cannot access admin endpoints
- Returns forbidden error

---

### Test 2.3: Get Dashboard Stats (No Token)

**Command:**
```bash
curl http://localhost:3000/api/admin/stats
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**✅ Success Criteria:**
- Status code: 401
- Unauthenticated requests are rejected

---

## Test Suite 3: User Management

### Test 3.1: List All Users

**Command:**
```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "isPremium": false,
      "isActive": true,
      "itemCount": 5,
      "lastLoginAt": "2026-01-18T...",
      "createdAt": "2026-01-17T..."
    }
  ],
  "pagination": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

**✅ Success Criteria:**
- Status code: 200
- Returns array of users
- Each user has all required fields
- Pagination info is present

---

### Test 3.2: Filter Users by Status (Active)

**Command:**
```bash
curl "http://localhost:3000/api/admin/users?status=active" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "test@example.com",
      "isActive": true,
      "lastLoginAt": "2026-01-18T..."
    }
  ],
  "pagination": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

**✅ Success Criteria:**
- Returns only active users (logged in within 7 days)
- All returned users have recent lastLoginAt

---

### Test 3.3: Filter Users by Plan (Free)

**Command:**
```bash
curl "http://localhost:3000/api/admin/users?plan=free" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "test@example.com",
      "isPremium": false
    }
  ],
  "pagination": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

**✅ Success Criteria:**
- Returns only free tier users
- All returned users have isPremium: false

---

### Test 3.4: Search Users by Email

**Command:**
```bash
curl "http://localhost:3000/api/admin/users?search=test" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "test@example.com"
    }
  ],
  "pagination": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

**✅ Success Criteria:**
- Returns users matching search term
- Search works on email and name fields

---

### Test 3.5: Get User Details

**Command:**
```bash
curl http://localhost:3000/api/admin/users/<USER_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "id": "...",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "isPremium": false,
  "isActive": true,
  "itemCount": 5,
  "foodItemCount": 3,
  "documentCount": 2,
  "notificationsSent": 0,
  "lastLoginAt": "2026-01-18T...",
  "createdAt": "2026-01-17T...",
  "subscription": null,
  "recentItems": [
    {
      "id": "...",
      "name": "Milk",
      "type": "FOOD",
      "expiryDate": "2026-01-25",
      "status": "EXPIRING_SOON"
    }
  ]
}
```

**✅ Success Criteria:**
- Returns detailed user information
- Includes item counts breakdown
- Shows recent items (up to 5)
- Includes subscription info if applicable

---

### Test 3.6: Get Non-Existent User

**Command:**
```bash
curl http://localhost:3000/api/admin/users/invalid-id \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

**✅ Success Criteria:**
- Status code: 404
- Returns not found error

---

## Test Suite 4: Broadcast Notifications

### Test 4.1: Broadcast to All Users

**Command:**
```bash
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Notification\",\"body\":\"This is a test broadcast to all users\",\"targetAudience\":\"all\"}"
```

**Expected Response:**
```json
{
  "message": "Broadcast notification queued successfully",
  "targetUserCount": 1,
  "broadcastId": "broadcast_1737204000000"
}
```

**✅ Success Criteria:**
- Status code: 200
- Returns success message
- Shows target user count
- Returns broadcast ID

---

### Test 4.2: Broadcast to Premium Users

**Command:**
```bash
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Premium Feature\",\"body\":\"New premium feature available\",\"targetAudience\":\"premium\"}"
```

**Expected Response:**
```json
{
  "message": "Broadcast notification queued successfully",
  "targetUserCount": 0,
  "broadcastId": "broadcast_..."
}
```

**✅ Success Criteria:**
- Returns 0 users (no premium users in test data)
- Still queues successfully

---

### Test 4.3: Broadcast to Free Users

**Command:**
```bash
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Upgrade Now\",\"body\":\"Upgrade to premium for more features\",\"targetAudience\":\"free\"}"
```

**Expected Response:**
```json
{
  "message": "Broadcast notification queued successfully",
  "targetUserCount": 1,
  "broadcastId": "broadcast_..."
}
```

**✅ Success Criteria:**
- Returns 1 user (test user is free tier)
- Queues successfully

---

### Test 4.4: Broadcast to Inactive Users

**Command:**
```bash
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"We Miss You\",\"body\":\"Come back and check your items\",\"targetAudience\":\"inactive\"}"
```

**Expected Response:**
```json
{
  "message": "Broadcast notification queued successfully",
  "targetUserCount": 0,
  "broadcastId": "broadcast_..."
}
```

**✅ Success Criteria:**
- Returns 0 users (test user is active)
- Queues successfully

---

### Test 4.5: Broadcast with Invalid Data (Missing Title)

**Command:**
```bash
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"body\":\"Test\",\"targetAudience\":\"all\"}"
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request"
}
```

**✅ Success Criteria:**
- Status code: 400
- Returns validation error
- Specifies missing field

---

### Test 4.6: Broadcast with Title Too Long

**Command:**
```bash
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"This is a very long title that exceeds the maximum allowed length of 100 characters and should be rejected by validation\",\"body\":\"Test\",\"targetAudience\":\"all\"}"
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": ["title must be shorter than or equal to 100 characters"],
  "error": "Bad Request"
}
```

**✅ Success Criteria:**
- Status code: 400
- Returns validation error
- Specifies length constraint

---

### Test 4.7: Broadcast as Regular User (Should Fail)

**Command:**
```bash
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Authorization: Bearer <REGULAR_USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test\",\"body\":\"Test\",\"targetAudience\":\"all\"}"
```

**Expected Response:**
```json
{
  "statusCode": 403,
  "message": "Admin access required"
}
```

**✅ Success Criteria:**
- Status code: 403
- Regular users cannot broadcast

---

## Test Suite 5: Admin Panel Frontend

### Test 5.1: Start Admin Panel

Open a new terminal and run:
```bash
cd admin
npm run dev
```

**Expected Output:**
```
> expiry-tracker-admin@0.1.0 dev
> next dev -p 3001

- ready started server on 0.0.0.0:3001, url: http://localhost:3001
- event compiled client and server successfully
```

**Navigate to:** http://localhost:3001

---

### Test 5.2: Login Page

**URL:** http://localhost:3001/login

**Test Steps:**
1. Page loads without errors
2. Form displays email and password fields
3. "Sign In" button is visible
4. Test credentials are shown at bottom

**✅ Success Criteria:**
- Page renders correctly
- Form is functional
- No console errors

---

### Test 5.3: Login with Admin Credentials

**Test Steps:**
1. Enter email: `admin@example.com`
2. Enter password: `admin123`
3. Click "Sign In"
4. Should redirect to `/dashboard`

**✅ Success Criteria:**
- Login succeeds
- Redirects to dashboard
- No errors in console

---

### Test 5.4: Login with Invalid Credentials

**Test Steps:**
1. Enter email: `admin@example.com`
2. Enter password: `wrongpassword`
3. Click "Sign In"
4. Should show error message

**✅ Success Criteria:**
- Shows error: "Invalid credentials or not an admin user"
- Stays on login page
- Form is still functional

---

### Test 5.5: Dashboard Page

**URL:** http://localhost:3001/dashboard

**Test Steps:**
1. Verify all statistics sections load:
   - User Statistics (4 cards)
   - Item Statistics (5 cards)
   - Notification Statistics (4 cards)
   - Growth Statistics (3 cards)
2. Check navigation buttons (Users, Broadcast)
3. Verify numbers match backend data

**✅ Success Criteria:**
- All 16 stat cards display
- Numbers are accurate
- No loading errors
- Navigation buttons work

---

### Test 5.6: User Management Page

**URL:** http://localhost:3001/users

**Test Steps:**
1. Verify user table loads
2. Test status filter (All, Active, Inactive)
3. Test plan filter (All, Free, Premium)
4. Test search (enter "test")
5. Verify user data displays correctly

**✅ Success Criteria:**
- User table renders
- Filters work correctly
- Search filters results
- User data is accurate
- Status badges show correct colors

---

### Test 5.7: Broadcast Notification Page

**URL:** http://localhost:3001/broadcast

**Test Steps:**
1. Enter title: "Test Notification"
2. Enter body: "This is a test message"
3. Select target: "All Users"
4. Verify preview updates
5. Click "Send Broadcast"
6. Verify success message

**✅ Success Criteria:**
- Form is functional
- Preview updates in real-time
- Character counters work
- Broadcast sends successfully
- Shows target user count
- Success message displays

---

### Test 5.8: Navigation Between Pages

**Test Steps:**
1. Start at Dashboard
2. Click "Users" → Should navigate to /users
3. Click "Dashboard" → Should navigate to /dashboard
4. Click "Broadcast" → Should navigate to /broadcast
5. Navigate back to Dashboard

**✅ Success Criteria:**
- All navigation works
- No page reload (SPA behavior)
- URLs update correctly
- No errors

---

### Test 5.9: Logout (Manual)

**Test Steps:**
1. Open browser DevTools
2. Go to Application → Cookies
3. Delete NextAuth cookies
4. Refresh page
5. Should redirect to /login

**✅ Success Criteria:**
- Redirects to login when session expires
- Protected routes are inaccessible

---

## Test Suite 6: Database Verification

### Test 6.1: Verify Notifications Created

**Command:**
```bash
# Connect to your database and run:
SELECT COUNT(*) FROM notifications WHERE "fcmMessageId" LIKE 'broadcast_%';
```

**✅ Success Criteria:**
- Notifications were created for broadcasts
- Count matches target user count from broadcasts

---

### Test 6.2: Verify Admin User Exists

**Command:**
```bash
# Connect to your database and run:
SELECT * FROM admin_users WHERE email = 'admin@example.com';
```

**Expected Result:**
```
id    | email              | name       | role        | isActive
------|-------------------|------------|-------------|----------
...   | admin@example.com | Admin User | SUPER_ADMIN | true
```

**✅ Success Criteria:**
- Admin user exists
- Role is SUPER_ADMIN
- isActive is true

---

## Summary Checklist

### Backend Tests
- [ ] Test 1.1: Admin login succeeds
- [ ] Test 1.2: Invalid credentials rejected
- [ ] Test 1.3: Regular user login works
- [ ] Test 2.1: Dashboard stats return correctly
- [ ] Test 2.2: Regular users blocked from admin endpoints
- [ ] Test 2.3: Unauthenticated requests rejected
- [ ] Test 3.1: List all users works
- [ ] Test 3.2: Filter by status works
- [ ] Test 3.3: Filter by plan works
- [ ] Test 3.4: Search users works
- [ ] Test 3.5: Get user details works
- [ ] Test 3.6: Non-existent user returns 404
- [ ] Test 4.1: Broadcast to all users works
- [ ] Test 4.2: Broadcast to premium users works
- [ ] Test 4.3: Broadcast to free users works
- [ ] Test 4.4: Broadcast to inactive users works
- [ ] Test 4.5: Validation rejects missing fields
- [ ] Test 4.6: Validation rejects too-long titles
- [ ] Test 4.7: Regular users blocked from broadcast

### Frontend Tests
- [ ] Test 5.1: Admin panel starts successfully
- [ ] Test 5.2: Login page renders
- [ ] Test 5.3: Admin login succeeds
- [ ] Test 5.4: Invalid login shows error
- [ ] Test 5.5: Dashboard displays all stats
- [ ] Test 5.6: User management works
- [ ] Test 5.7: Broadcast form works
- [ ] Test 5.8: Navigation works
- [ ] Test 5.9: Logout/session expiry works

### Database Tests
- [ ] Test 6.1: Notifications created in database
- [ ] Test 6.2: Admin user exists in database

---

## Troubleshooting

### Backend Won't Start
**Issue:** Module not found errors
**Solution:**
```bash
cd backend
npm install
npm run prisma:generate
```

### Admin Panel Won't Start
**Issue:** Dependency errors
**Solution:**
```bash
cd admin
npm install --legacy-peer-deps
```

### 403 Forbidden on Admin Endpoints
**Issue:** User is not in AdminUser table
**Solution:** Verify admin user exists:
```bash
cd backend
node -r ts-node/register prisma/seed.ts
```

### CORS Errors
**Issue:** Frontend can't connect to backend
**Solution:** Verify CORS is configured in backend/src/main.ts

### Database Connection Errors
**Issue:** Cannot connect to Neon database
**Solution:** Check DATABASE_URL in backend/.env

---

## Expected Test Results

**Total Tests:** 27
**Expected Pass Rate:** 100%

**Critical Tests (Must Pass):**
1. Admin login (Test 1.1)
2. Dashboard stats (Test 2.1)
3. User list (Test 3.1)
4. Broadcast (Test 4.1)
5. Frontend login (Test 5.3)
6. Frontend dashboard (Test 5.5)

**If any critical test fails, the admin panel is not production-ready.**

---

## Next Steps After Testing

1. **All Tests Pass:** Admin panel is ready for production
2. **Some Tests Fail:** Review error messages and fix issues
3. **Performance Issues:** Optimize database queries
4. **Security Concerns:** Add rate limiting and audit logging

---

## Test Report Template

```
# Admin Panel Test Report

Date: ___________
Tester: ___________

## Backend Tests
- Admin Authentication: PASS / FAIL
- Dashboard Stats: PASS / FAIL
- User Management: PASS / FAIL
- Broadcast Notifications: PASS / FAIL

## Frontend Tests
- Login Page: PASS / FAIL
- Dashboard Page: PASS / FAIL
- User Management Page: PASS / FAIL
- Broadcast Page: PASS / FAIL

## Issues Found
1. ___________
2. ___________

## Overall Status
☐ Ready for Production
☐ Needs Fixes
☐ Major Issues

## Notes
___________
```

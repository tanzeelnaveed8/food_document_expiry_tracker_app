# Admin Panel - Manual Testing Instructions

**Issue:** The directory name contains `&` which causes Windows command line issues.

**Solution:** Start servers manually in separate terminals.

---

## Step-by-Step Testing Guide

### Terminal 1: Start Backend

1. Open a new terminal/command prompt
2. Navigate to backend directory:
   ```bash
   cd "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\backend"
   ```

3. Start the server:
   ```bash
   npm run start:dev
   ```

4. **Wait for this message:**
   ```
   [Nest] INFO Application is running on: http://localhost:3000
   ```

5. **Keep this terminal open!**

---

### Terminal 2: Test Backend API

1. Open a new terminal/command prompt

2. Test health endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```

   **Expected:** `{"status":"ok","timestamp":"..."}`

3. Login as admin:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
   ```

   **Expected:** Returns user object and tokens

4. Copy the `accessToken` from the response (you'll need it for next tests)

5. Test dashboard stats (replace `YOUR_TOKEN` with the actual token):
   ```bash
   curl http://localhost:3000/api/admin/stats -H "Authorization: Bearer YOUR_TOKEN"
   ```

   **Expected:** Returns statistics object with users, items, notifications, growth

6. Test user list:
   ```bash
   curl http://localhost:3000/api/admin/users -H "Authorization: Bearer YOUR_TOKEN"
   ```

   **Expected:** Returns array of users

7. Test broadcast:
   ```bash
   curl -X POST http://localhost:3000/api/admin/notifications/broadcast -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"Test\",\"body\":\"Test message\",\"targetAudience\":\"all\"}"
   ```

   **Expected:** Returns success message with target user count

---

### Terminal 3: Start Admin Panel

1. Open a new terminal/command prompt

2. Navigate to admin directory:
   ```bash
   cd "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\admin"
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. **Wait for this message:**
   ```
   ready started server on 0.0.0.0:3001, url: http://localhost:3001
   ```

5. **Keep this terminal open!**

---

### Browser Testing

1. **Open your browser** and go to: http://localhost:3001

2. **Login Page Test:**
   - Should redirect to `/login`
   - Enter email: `admin@example.com`
   - Enter password: `admin123`
   - Click "Sign In"
   - Should redirect to `/dashboard`

3. **Dashboard Test:**
   - Verify you see 4 sections of statistics:
     - User Statistics (4 cards)
     - Item Statistics (5 cards)
     - Notification Statistics (4 cards)
     - Growth Statistics (3 cards)
   - Check that numbers are displayed (not loading forever)
   - Verify navigation buttons appear (Users, Broadcast)

4. **User Management Test:**
   - Click "Users" button in header
   - Should see a table with the test user
   - Test filters:
     - Status dropdown: Select "Active" → should show test user
     - Plan dropdown: Select "Free" → should show test user
     - Search box: Type "test" → should filter results
   - Verify user information displays correctly

5. **Broadcast Test:**
   - Click "Broadcast" button in header
   - Fill in the form:
     - Title: "Test Notification"
     - Body: "This is a test broadcast message"
     - Target Audience: "All Users"
   - Watch the preview update as you type
   - Verify character counters work (100 for title, 500 for body)
   - Click "Send Broadcast"
   - Should see success message: "Broadcast queued successfully! 1 users will receive the notification."

6. **Navigation Test:**
   - Click between Dashboard, Users, and Broadcast
   - Verify URLs change correctly
   - Verify no page reloads (SPA behavior)
   - Check browser console for errors (F12 → Console tab)

---

## Quick Checklist

### Backend Tests
- [ ] Backend server starts successfully
- [ ] Health endpoint returns OK
- [ ] Admin login works (returns tokens)
- [ ] Dashboard stats endpoint works
- [ ] User list endpoint works
- [ ] Broadcast endpoint works
- [ ] Regular user blocked from admin endpoints (403)

### Frontend Tests
- [ ] Admin panel starts successfully
- [ ] Login page displays
- [ ] Admin login succeeds
- [ ] Dashboard displays all statistics
- [ ] User management page works
- [ ] Filters work on user page
- [ ] Broadcast form works
- [ ] Navigation between pages works
- [ ] No errors in browser console

---

## Expected Results

### Dashboard Statistics
You should see approximately:
- **Total Users:** 1
- **Active Users:** 1
- **Total Items:** 5 (3 food + 2 documents)
- **Expiring Soon:** 2
- **New Users This Month:** 1

### User List
You should see:
- **Email:** test@example.com
- **Name:** Test User
- **Plan:** Free
- **Status:** Active
- **Items:** 5

### Broadcast
When you send a broadcast to "All Users":
- **Target User Count:** 1
- **Status:** Success

---

## Troubleshooting

### Backend won't start
**Try:**
```bash
cd backend
npm install
npm run prisma:generate
```

### Admin panel won't start
**Try:**
```bash
cd admin
npm install --legacy-peer-deps
```

### Can't login
**Verify admin user exists:**
```bash
cd backend
node -r ts-node/register prisma/seed.ts
```

### Dashboard shows no data
**Check backend logs** in Terminal 1 for errors

### 403 Forbidden errors
**Make sure you're using the admin token**, not the regular user token

---

## Success Criteria

✅ **Your admin panel is working if:**
1. All 3 terminals are running without errors
2. You can login to the admin panel
3. Dashboard displays statistics
4. User management shows the test user
5. Broadcast form sends notifications
6. No errors in browser console

---

## What You've Built

### Backend (4 new endpoints)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management with filters
- `GET /api/admin/users/:id` - User details
- `POST /api/admin/notifications/broadcast` - Broadcast notifications

### Frontend (4 pages)
- `/login` - Admin authentication
- `/dashboard` - Statistics overview
- `/users` - User management
- `/broadcast` - Send notifications

### Features
- ✅ Secure admin authentication
- ✅ Real-time statistics
- ✅ User filtering and search
- ✅ Targeted broadcast notifications
- ✅ Responsive design
- ✅ Full TypeScript coverage

---

## Next Steps After Testing

Once everything works:

1. **Document test results** (use checklist above)
2. **Take screenshots** of each page for documentation
3. **Test with more data** (create additional users/items)
4. **Prepare for production** (environment variables, hosting)

---

## Need Help?

If you encounter issues:
1. Check all 3 terminals for error messages
2. Verify backend is running: `curl http://localhost:3000/api/health`
3. Check browser console (F12) for frontend errors
4. Review the comprehensive guide: `ADMIN_PANEL_TESTING_GUIDE.md`

---

**Ready to test!** Follow the steps above in order. 🚀

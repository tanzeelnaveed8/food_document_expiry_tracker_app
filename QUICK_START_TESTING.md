# Quick Start: Testing the Admin Panel

**Time Required:** 10-15 minutes
**Prerequisites:** Backend and admin panel code completed

---

## Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm run start:dev
```

**Wait for this message:**
```
[Nest] INFO Application is running on: http://localhost:3000
```

**Keep this terminal open!**

---

## Step 2: Verify Backend is Running

Open a new terminal and test:

```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2026-01-18T..."}
```

✅ If you see this, backend is ready!

---

## Step 3: Run Automated Tests (Optional)

### On Linux/Mac:
```bash
chmod +x test-admin-panel.sh
./test-admin-panel.sh
```

### On Windows:
```bash
test-admin-panel.bat
```

**Expected output:**
```
==========================================
Admin Panel Quick Test Suite
==========================================

Backend is running!

Test Suite 1: Health Check
Testing: Health endpoint... PASS (Status: 200)

Test Suite 2: Authentication
PASS: Admin login successful

Test Suite 3: Dashboard Statistics
Testing: Get dashboard stats... PASS (Status: 200)

...

Test Summary
Total Tests: 11
Passed: 11
Failed: 0

✓ All tests passed!
```

---

## Step 4: Start the Admin Panel

Open another new terminal:

```bash
cd admin
npm run dev
```

**Wait for this message:**
```
- ready started server on 0.0.0.0:3001, url: http://localhost:3001
```

**Keep this terminal open too!**

---

## Step 5: Test the Admin Panel UI

### 5.1 Open Browser
Navigate to: **http://localhost:3001**

You should be redirected to: **http://localhost:3001/login**

### 5.2 Login
- Email: `admin@example.com`
- Password: `admin123`
- Click "Sign In"

**Expected:** Redirect to dashboard

### 5.3 Test Dashboard
You should see:
- **User Statistics** (4 cards)
- **Item Statistics** (5 cards)
- **Notification Statistics** (4 cards)
- **Growth Statistics** (3 cards)

**Verify the numbers make sense:**
- Total Users: 1 (the test user)
- Total Items: 5 (3 food + 2 documents)
- All other stats should be reasonable

### 5.4 Test User Management
1. Click "Users" button in header
2. You should see the test user in the table
3. Try the filters:
   - Status: Select "Active" - should show test user
   - Plan: Select "Free" - should show test user
   - Search: Type "test" - should filter to test user

### 5.5 Test Broadcast Notifications
1. Click "Broadcast" button in header
2. Fill in the form:
   - Title: "Test Notification"
   - Body: "This is a test message"
   - Target: "All Users"
3. Watch the preview update as you type
4. Click "Send Broadcast"
5. Should see success message: "Broadcast queued successfully! 1 users will receive the notification."

---

## Step 6: Verify Everything Works

### Quick Checklist:
- [ ] Backend server started successfully
- [ ] Health endpoint returns OK
- [ ] Admin login works (via curl or UI)
- [ ] Dashboard displays statistics
- [ ] User list shows test user
- [ ] Filters work on user page
- [ ] Broadcast form works
- [ ] Navigation between pages works
- [ ] No errors in browser console

---

## Common Issues and Solutions

### Issue: Backend won't start
**Error:** `Cannot find module '@nestjs/cli'`

**Solution:**
```bash
cd backend
npm install
```

---

### Issue: Admin panel won't start
**Error:** `ERESOLVE could not resolve`

**Solution:**
```bash
cd admin
npm install --legacy-peer-deps
```

---

### Issue: 403 Forbidden on admin endpoints
**Error:** `Admin access required`

**Solution:** Make sure admin user exists in database:
```bash
cd backend
node -r ts-node/register prisma/seed.ts
```

---

### Issue: Can't login to admin panel
**Error:** `Invalid credentials or not an admin user`

**Possible causes:**
1. Backend not running
2. Admin user not seeded
3. Wrong credentials

**Solution:**
1. Check backend is running: `curl http://localhost:3000/api/health`
2. Verify admin user exists (run seed script above)
3. Use exact credentials: `admin@example.com` / `admin123`

---

### Issue: Dashboard shows no data
**Possible causes:**
1. Database not seeded
2. Backend not connected to database

**Solution:**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
node -r ts-node/register prisma/seed.ts
```

---

## What to Test Next

After basic testing works, try:

1. **Create more test data:**
   - Add more users via signup endpoint
   - Add more items via mobile app or API
   - Create premium subscriptions

2. **Test edge cases:**
   - Very long user lists (pagination)
   - Broadcast to different audiences
   - Filter combinations

3. **Test security:**
   - Try accessing admin endpoints without token
   - Try accessing with regular user token
   - Test invalid inputs

4. **Performance testing:**
   - Load test with many users
   - Test with large datasets
   - Monitor response times

---

## Full Testing Guide

For comprehensive testing with all 27 test cases, see:
**ADMIN_PANEL_TESTING_GUIDE.md**

---

## Success Criteria

Your admin panel is working correctly if:

✅ All automated tests pass (11/11)
✅ You can login to the admin panel
✅ Dashboard shows accurate statistics
✅ User management displays and filters users
✅ Broadcast notifications can be sent
✅ No errors in browser console
✅ No errors in backend logs

---

## Next Steps After Testing

Once everything works:

1. **Document any issues found**
2. **Create test data for demo**
3. **Prepare for production deployment**
4. **Set up monitoring and logging**
5. **Configure production environment variables**

---

## Need Help?

If you encounter issues:

1. Check the error messages carefully
2. Review the logs in both terminals
3. Check browser console for frontend errors
4. Verify database connection
5. Ensure all dependencies are installed

---

## Test Report

After testing, fill out:

**Date:** ___________

**Backend Tests:**
- [ ] Health check works
- [ ] Admin login works
- [ ] Dashboard stats work
- [ ] User list works
- [ ] Broadcast works

**Frontend Tests:**
- [ ] Login page works
- [ ] Dashboard displays
- [ ] User management works
- [ ] Broadcast form works
- [ ] Navigation works

**Issues Found:**
1. ___________
2. ___________

**Overall Status:**
- [ ] ✅ Ready for production
- [ ] ⚠️ Minor issues (list above)
- [ ] ❌ Major issues (needs fixes)

---

**Congratulations!** 🎉

If all tests pass, your admin panel is fully functional and ready for use!

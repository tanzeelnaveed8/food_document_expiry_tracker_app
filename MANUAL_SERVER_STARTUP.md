# Manual Server Startup Guide

**Issue:** The directory name contains `&` which causes Windows path issues with npm scripts.

**Solution:** Start servers manually using these exact steps.

---

## 🚀 Start Backend Server

### Step 1: Open Terminal/Command Prompt

Press `Win + R`, type `cmd`, press Enter

### Step 2: Navigate to Backend

Copy and paste this command:
```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\backend"
```

### Step 3: Start Backend

Run:
```cmd
npm run start:dev
```

### Step 4: Wait for Success Message

You should see:
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

✅ **Backend is ready when you see:** `Application is running on: http://localhost:3000`

**Keep this terminal window open!**

---

## 🎨 Start Admin Panel

### Step 1: Open Another Terminal/Command Prompt

Press `Win + R`, type `cmd`, press Enter (new window)

### Step 2: Navigate to Admin

Copy and paste this command:
```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\admin"
```

### Step 3: Start Admin Panel

Run:
```cmd
npm run dev
```

### Step 4: Wait for Success Message

You should see:
```
> expiry-tracker-admin@0.1.0 dev
> next dev -p 3001

- ready started server on 0.0.0.0:3001, url: http://localhost:3001
- event compiled client and server successfully in 2.3s
- Local:        http://localhost:3001
```

✅ **Admin panel is ready when you see:** `ready started server on 0.0.0.0:3001`

**Keep this terminal window open too!**

---

## 🌐 Open in Browser

### Step 1: Open Browser

Open Chrome, Firefox, or Edge

### Step 2: Navigate to Admin Panel

Go to: **http://localhost:3001**

You should be redirected to: **http://localhost:3001/login**

### Step 3: Login

- **Email:** `admin@example.com`
- **Password:** `admin123`
- Click **"Sign In"**

### Step 4: Explore

You should be redirected to the dashboard at: **http://localhost:3001/dashboard**

---

## ✅ Verification Checklist

### Backend Terminal
- [ ] Shows "Application is running on: http://localhost:3000"
- [ ] No error messages
- [ ] Terminal stays open (doesn't close)

### Admin Panel Terminal
- [ ] Shows "ready started server on 0.0.0.0:3001"
- [ ] No error messages
- [ ] Terminal stays open

### Browser
- [ ] Login page loads
- [ ] Can login with admin credentials
- [ ] Dashboard displays statistics
- [ ] Can navigate to Users and Broadcast pages
- [ ] No errors in browser console (F12 → Console)

---

## 🧪 Quick Test

Once both servers are running, test the backend API:

### Open a Third Terminal

```cmd
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2026-01-18T..."}
```

If you see this, the backend is working! ✅

---

## 🐛 Troubleshooting

### Backend shows "MODULE_NOT_FOUND"

**Solution:**
```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\backend"
npm install
npm run prisma:generate
npm run start:dev
```

### Admin panel shows "MODULE_NOT_FOUND"

**Solution:**
```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\admin"
npm install --legacy-peer-deps
npm run dev
```

### Port already in use

**Backend (port 3000):**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Admin (port 3001):**
```cmd
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### Can't login to admin panel

**Verify admin user exists:**
```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\backend"
node -r ts-node/register prisma/seed.ts
```

---

## 📝 What to Test

Once both servers are running:

### 1. Dashboard (http://localhost:3001/dashboard)
- [ ] User Statistics section (4 cards)
- [ ] Item Statistics section (5 cards)
- [ ] Notification Statistics section (4 cards)
- [ ] Growth Statistics section (3 cards)

### 2. User Management (http://localhost:3001/users)
- [ ] User table displays
- [ ] Filter by Status works
- [ ] Filter by Plan works
- [ ] Search box works

### 3. Broadcast (http://localhost:3001/broadcast)
- [ ] Can enter title and body
- [ ] Preview updates as you type
- [ ] Character counters work
- [ ] Can send broadcast
- [ ] Success message appears

---

## 🎯 Success Criteria

Your admin panel is working if:

✅ Both terminals show success messages
✅ You can login at http://localhost:3001
✅ Dashboard displays all statistics
✅ User management shows test user
✅ Broadcast form sends notifications
✅ No errors in browser console

---

## 💡 Optional: Fix the Path Issue

To avoid this issue in the future, you could rename the directory:

**Current:** `food&_document_expiry_tracker_app`
**Suggested:** `food-document-expiry-tracker-app`

**How to rename:**
1. Close all terminals
2. Rename the folder in Windows Explorer
3. Update any shortcuts or references
4. Restart servers with new path

---

## 📞 Need Help?

If servers still won't start:
1. Check both terminal windows for specific error messages
2. Verify Node.js is installed: `node --version`
3. Verify npm is installed: `npm --version`
4. Try reinstalling dependencies (see Troubleshooting section)

---

**Ready to start!** Follow the steps above in order. 🚀

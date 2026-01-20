# 📱 Start Mobile App - Complete Guide

## Prerequisites

Before starting the mobile app, make sure:
- ✅ **Backend server is running** on http://localhost:3000
- ✅ **Android Studio installed** (for Android) OR **Xcode installed** (for iOS on Mac)
- ✅ **Android Emulator running** OR **Physical device connected**

---

## 🚀 Quick Start - Android Emulator

### Step 1: Start Backend Server (if not already running)

Open Command Prompt:
```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\backend"
npm run start:dev
```

Wait for: `Application is running on: http://localhost:3000`

---

### Step 2: Start Android Emulator

**Option A: From Android Studio**
1. Open Android Studio
2. Click "Device Manager" (phone icon on right side)
3. Click ▶️ (Play) button next to any emulator
4. Wait for emulator to fully boot

**Option B: From Command Line**
```cmd
emulator -avd Pixel_5_API_33
```
(Replace `Pixel_5_API_33` with your emulator name)

---

### Step 3: Install Dependencies (First Time Only)

Open a new Command Prompt:
```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\mobile"
npm install
```

Wait for installation to complete.

---

### Step 4: Start Metro Bundler

In the same terminal:
```cmd
npm start
```

You should see:
```
               ######                ######
             ###     ####        ####     ###
            ##          ###    ###          ##
            ##             ####             ##
            ##             ####             ##
            ##           ##    ##           ##
            ##         ###      ###         ##
             ##  ########################  ##
          ######    ###            ###    ######
      ###     ##    ##              ##    ##     ###
   ###         ## ###      ####      ### ##         ###
  ##           ####      ########      ####           ##
 ##             ###     ##########     ###             ##
  ##           ####      ########      ####           ##
   ###         ## ###      ####      ### ##         ###
      ###     ##    ##              ##    ##     ###
          ######    ###            ###    ######
             ##  ########################  ##
            ##         ###      ###         ##
            ##           ##    ##           ##
            ##             ####             ##
            ##             ####             ##
            ##          ###    ###          ##
             ###     ####        ####     ###
               ######                ######

               Welcome to Metro!
```

**Keep this terminal open!**

---

### Step 5: Run on Android

Open **another** Command Prompt:
```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\mobile"
npm run android
```

This will:
1. Build the app
2. Install it on the emulator
3. Launch the app

**First build takes 5-10 minutes!** ⏳

---

## 📱 What You'll See

### On First Launch:
1. **Splash screen** (if configured)
2. **Login screen** with:
   - Email input
   - Password input
   - "Sign In" button
   - "Sign Up" link

### Test Credentials:
- **Email:** `test@example.com`
- **Password:** `password123`

### After Login:
- **Dashboard** with item list
- **Bottom tabs:** Items, Profile
- **Add button** to create new items

---

## 🍎 For iOS (Mac Only)

### Step 1: Install Pods
```bash
cd mobile/ios
pod install
cd ..
```

### Step 2: Start Metro
```bash
npm start
```

### Step 3: Run on iOS Simulator
```bash
npm run ios
```

**Note:** iOS uses `localhost` in .env file (already configured)

---

## 📱 For Physical Device

### Android Physical Device:

1. **Enable Developer Options:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back → Developer Options
   - Enable "USB Debugging"

2. **Connect via USB**

3. **Find your computer's IP:**
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

4. **Update mobile/.env:**
   ```
   API_URL=http://192.168.1.100:3000/api
   ```

5. **Run the app:**
   ```cmd
   npm run android
   ```

---

## ✅ Verification Checklist

### Backend:
- [ ] Backend running on http://localhost:3000
- [ ] Can access http://localhost:3000/api/health

### Mobile:
- [ ] Metro bundler running (shows Metro ASCII art)
- [ ] Android emulator/device running
- [ ] App installed and launched
- [ ] Login screen appears

### Connectivity:
- [ ] Can login with test credentials
- [ ] Dashboard loads items from backend
- [ ] Can create new items
- [ ] Items sync with backend

---

## 🐛 Troubleshooting

### "Unable to connect to development server"

**Solution 1: Reload Metro**
- Press `R` twice in the Metro terminal
- Or shake device → "Reload"

**Solution 2: Check API URL**
- Android Emulator: `http://10.0.2.2:3000/api`
- iOS Simulator: `http://localhost:3000/api`
- Physical Device: `http://YOUR_IP:3000/api`

---

### "Network request failed"

**Check:**
1. Backend is running: `curl http://localhost:3000/api/health`
2. Firewall allows connections
3. API_URL in mobile/.env is correct

**For Android Emulator:**
```cmd
adb reverse tcp:3000 tcp:3000
```

---

### "Build failed" or "Could not find tools.jar"

**Solution:**
```cmd
cd mobile/android
./gradlew clean
cd ../..
npm run android
```

---

### "Metro bundler not responding"

**Solution:**
```cmd
# Kill Metro
taskkill /F /IM node.exe

# Clear cache
cd mobile
npm start -- --reset-cache
```

---

### "App crashes on launch"

**Check Metro terminal for errors**

Common fixes:
```cmd
cd mobile
npm install
cd android
./gradlew clean
cd ..
npm start -- --reset-cache
```

Then in another terminal:
```cmd
npm run android
```

---

## 🎯 Testing the Mobile App

Once the app is running:

### 1. Test Login
- [ ] Enter: test@example.com / password123
- [ ] Click "Sign In"
- [ ] Should navigate to dashboard

### 2. Test Dashboard
- [ ] See list of items (3 food + 2 documents)
- [ ] See item statistics at top
- [ ] Items show expiry status (Safe, Expiring Soon, Expired)

### 3. Test Add Item
- [ ] Tap "+" button
- [ ] Select "Food" or "Document"
- [ ] Fill in form
- [ ] Save item
- [ ] Should appear in list

### 4. Test Item Detail
- [ ] Tap any item in list
- [ ] See full details
- [ ] Tap "Edit" button
- [ ] Modify fields
- [ ] Save changes

### 5. Test Delete
- [ ] Open item detail
- [ ] Tap "Delete" button
- [ ] Confirm deletion
- [ ] Item removed from list

---

## 📊 Mobile App Features

### ✅ Implemented (89% complete):
- Authentication (Login/Signup)
- Items List with stats
- Add Item form (Food & Documents)
- Item Detail with edit/delete
- Photo upload with camera/gallery
- Push notifications (FCM)
- Pull-to-refresh
- Search functionality
- Status badges (Safe, Expiring Soon, Expired)

### ⏳ Pending:
- Settings screen
- Notification preferences
- Profile editing
- Export functionality

---

## 🔥 Hot Reload

While developing:
- **Save any file** → App reloads automatically
- **Press R twice** in Metro → Manual reload
- **Shake device** → Open developer menu

---

## 📝 Development Tips

### View Logs:
```cmd
# Android
adb logcat *:S ReactNative:V ReactNativeJS:V

# iOS
react-native log-ios
```

### Debug Menu:
- **Android Emulator:** Ctrl + M
- **Android Device:** Shake device
- **iOS Simulator:** Cmd + D
- **iOS Device:** Shake device

### Clear Cache:
```cmd
cd mobile
npm start -- --reset-cache
```

---

## 🎉 Success!

Your mobile app is running if:
- ✅ Metro bundler shows "Welcome to Metro!"
- ✅ App launches on emulator/device
- ✅ Login screen appears
- ✅ Can login and see dashboard
- ✅ Items load from backend

---

## 📞 Need Help?

If you're stuck:
1. Check Metro terminal for errors
2. Check backend terminal for API errors
3. Verify .env file has correct API_URL
4. Try clearing cache and rebuilding
5. Check Android Studio logcat for native errors

---

**Ready to start!** Follow the steps above in order. 🚀

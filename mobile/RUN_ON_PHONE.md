# 📱 Run Your Mobile App on Your Phone - NO Android Studio Needed!

## 🎯 Quick Summary

You have 2 options:

### Option 1: Quick UI Test (5 minutes) ⚡
- Test navigation and UI only
- Uses Expo Go app (free)
- Camera and notifications won't work
- **Best for:** Seeing your app quickly

### Option 2: Full App with All Features (20 minutes) 🚀
- Everything works (camera, notifications)
- Uses EAS Build (cloud build service)
- Free tier: 30 builds/month
- **Best for:** Complete testing

---

## 🚀 Option 1: Quick UI Test (Recommended to Start)

### Step 1: Install Expo Dependencies

Open Command Prompt:
```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\mobile"
npm install expo expo-status-bar
npx expo install expo-constants
```

### Step 2: Install Expo Go on Your Phone

1. Open **Google Play Store** on your Android phone
2. Search for **"Expo Go"**
3. Install it (it's free)
4. Open the app

### Step 3: Start the Development Server

In Command Prompt:
```cmd
npm start
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Step 4: Scan QR Code

1. Open **Expo Go** app on your phone
2. Tap **"Scan QR code"**
3. Point camera at the QR code in your terminal
4. Wait for app to load (30-60 seconds)

### ✅ What You'll See

- Login screen
- Dashboard (if you login)
- Navigation
- Item list
- Basic UI

### ❌ What Won't Work

- Camera/photo upload (needs custom build)
- Push notifications (needs custom build)
- Firebase features (needs custom build)

---

## 🔥 Option 2: Full App with All Features

### Step 1: Install EAS CLI

```cmd
npm install -g eas-cli
```

### Step 2: Create Expo Account

```cmd
eas login
```

Or create account at: https://expo.dev/signup

### Step 3: Configure EAS Build

```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\mobile"
eas build:configure
```

### Step 4: Build Your App

```cmd
eas build --platform android --profile preview
```

**What happens:**
1. Code uploads to Expo servers (2-3 minutes)
2. Expo builds your app in the cloud (10-15 minutes)
3. You get a download link

### Step 5: Install on Your Phone

1. Open the link on your phone
2. Download the APK file
3. Install it (you may need to allow "Install from unknown sources")
4. Open the app

### ✅ Everything Works!

- Camera and photo upload ✅
- Push notifications ✅
- All features ✅

---

## 🆘 Troubleshooting

### "Expo not found"
```cmd
npm install -g expo-cli
```

### "Cannot connect to Metro"
Make sure your phone and computer are on the **same WiFi network**

### "Network request failed" in app
Update the API URL in `mobile/src/services/api.ts`:
- Change `http://10.0.2.2:3000` to `http://YOUR_COMPUTER_IP:3000`
- Find your IP: Run `ipconfig` in Command Prompt, look for "IPv4 Address"

### QR code not scanning
In Expo Go app, manually type the URL shown in terminal (exp://192.168.x.x:8081)

---

## 📊 Comparison

| Feature | Expo Go (Option 1) | EAS Build (Option 2) |
|---------|-------------------|---------------------|
| Setup Time | 5 minutes | 20 minutes |
| Cost | Free | Free (30 builds/month) |
| Camera | ❌ | ✅ |
| Notifications | ❌ | ✅ |
| UI/Navigation | ✅ | ✅ |
| Hot Reload | ✅ | ❌ |
| Android Studio | Not needed | Not needed |

---

## 🎯 My Recommendation

1. **Start with Option 1** (Expo Go) to see your app quickly
2. **Then use Option 2** (EAS Build) when you need full features

---

## 📱 Next Steps After Testing

Once your app is running:

1. **Test all screens:**
   - Login/Signup
   - Dashboard
   - Add item
   - Item details

2. **Test API connection:**
   - Make sure backend is running
   - Update API URL if needed

3. **Report issues:**
   - Note what works and what doesn't
   - I'll help you fix any problems

---

## ✅ Success Checklist

- [ ] Expo Go installed on phone
- [ ] npm start runs without errors
- [ ] QR code appears in terminal
- [ ] Phone and computer on same WiFi
- [ ] App loads in Expo Go
- [ ] Can see login screen

---

**Ready to start?** Run these 3 commands:

```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\mobile"
npm install expo expo-status-bar
npm start
```

Then scan the QR code with Expo Go! 🎉

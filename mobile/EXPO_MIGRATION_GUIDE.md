# Migrate React Native CLI App to Expo

## Prerequisites
- Node.js installed
- Your Android phone
- Internet connection

---

## Step 1: Install Expo CLI

```cmd
cd /d "C:\Users\DELL LATITUDE\Desktop\work\food&_document_expiry_tracker_app\mobile"
npm install -g expo-cli eas-cli
```

---

## Step 2: Install Expo Dependencies

```cmd
npm install expo expo-dev-client
npx expo install expo-constants expo-device expo-notifications expo-image-picker
```

---

## Step 3: Replace Firebase with Expo Notifications

**Remove React Native Firebase:**
```cmd
npm uninstall @react-native-firebase/app @react-native-firebase/messaging
```

**Install Expo Notifications:**
```cmd
npx expo install expo-notifications
```

---

## Step 4: Replace Image Picker

**Remove React Native Image Picker:**
```cmd
npm uninstall react-native-image-picker
```

**Already installed:** `expo-image-picker` (from Step 2)

---

## Step 5: Create Expo Configuration

Create `app.json` in mobile folder:

```json
{
  "expo": {
    "name": "Expiry Tracker",
    "slug": "expiry-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.expirytracker.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.expirytracker.app",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS"
      ]
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Expiry Tracker to access your photos to upload item images.",
          "cameraPermission": "Allow Expiry Tracker to access your camera to take item photos."
        }
      ]
    ]
  }
}
```

---

## Step 6: Update Package.json Scripts

Replace scripts in `package.json`:

```json
"scripts": {
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "build:android": "eas build --platform android",
  "build:ios": "eas build --platform ios"
}
```

---

## Step 7: Update Code to Use Expo Modules

### Update Notifications Code

**Old (Firebase):**
```typescript
import messaging from '@react-native-firebase/messaging';
```

**New (Expo):**
```typescript
import * as Notifications from 'expo-notifications';
```

### Update Image Picker Code

**Old:**
```typescript
import { launchImageLibrary } from 'react-native-image-picker';
```

**New:**
```typescript
import * as ImagePicker from 'expo-image-picker';
```

---

## Step 8: Create EAS Build Configuration

```cmd
eas build:configure
```

This creates `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

---

## Step 9: Build Your App

```cmd
eas build --platform android --profile development
```

**What happens:**
1. Code uploads to Expo servers
2. Expo builds your app in the cloud (10-15 min)
3. You get a download link
4. Install APK on your phone

---

## Step 10: Install on Your Phone

1. **Download Expo Go** from Play Store (for testing)
2. **Or download your custom build** from the link EAS provides
3. **Scan QR code** or install APK directly

---

## Testing Without Building

For quick testing (limited features):

```cmd
npx expo start
```

Then:
1. Open Expo Go app on your phone
2. Scan the QR code
3. App loads (but Firebase features won't work)

---

## Important Notes

### What Works in Expo Go:
✅ Navigation
✅ UI components
✅ API calls
✅ AsyncStorage
✅ Basic functionality

### What Needs Custom Build:
❌ Push notifications
❌ Camera/Gallery
❌ Any native modules

### Cost:
- **Free tier:** 30 builds/month
- **Paid:** $29/month for unlimited builds

---

## Troubleshooting

### "Expo not found"
```cmd
npm install -g expo-cli
```

### "EAS not found"
```cmd
npm install -g eas-cli
```

### Build fails
Check `eas.json` configuration and ensure all dependencies are compatible.

---

## Alternative: Quick Test Without Migration

If you just want to see the UI without native features:

1. Comment out Firebase imports
2. Comment out Image Picker imports
3. Run `npx expo start`
4. Scan QR code with Expo Go

This lets you test navigation and UI quickly.

# Web App Debugging Guide

## Current Status
The Expo web server is running at: **http://localhost:8082**

## Step 1: Check Browser Console

1. Open your browser and go to: `http://localhost:8082`
2. Open Developer Tools:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I`
   - **Firefox**: Press `F12` or `Ctrl+Shift+K`
3. Click on the **Console** tab
4. Look for any **red error messages**
5. Take a screenshot or copy the error messages

## Step 2: Check What You See

### If you see a white screen:
- Check the browser console for errors (Step 1)
- Look for these console.log messages:
  - "App.tsx loaded - Platform: web"
  - "App component rendering"
  - "AuthContext.tsx loaded"
  - "AuthProvider rendering"

### If you see an error screen:
- The ErrorBoundary is working and caught an error
- Read the error message displayed on screen
- Check the browser console for more details

### If you see the login screen:
- **Success!** The app is working
- You can now test the functionality

## Step 3: Common Issues and Solutions

### Issue: "Cannot read property of undefined"
**Solution**: There's a runtime error in the code. Check the browser console for the exact line.

### Issue: "Module not found"
**Solution**: A dependency is missing. Run:
```bash
cd mobile
npm install
```

### Issue: "Network Error" or "Failed to fetch"
**Solution**: The backend API is not running or not accessible. Check:
- Is the backend server running?
- Is the API URL correct? (Check mobile/.env or app.json)

### Issue: Still white screen with no errors
**Solution**: Try these steps:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+F5)
3. Stop the Expo server (Ctrl+C) and restart:
   ```bash
   cd mobile
   npx expo start --web --clear
   ```

## Step 4: Test with Minimal App

If the app still doesn't work, let's test with a minimal version:

1. Stop the current server (Ctrl+C)
2. Backup your App.tsx:
   ```bash
   copy App.tsx App.tsx.backup
   ```
3. Replace App.tsx with this minimal version:
   ```javascript
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';

   export default function App() {
     return (
       <View style={styles.container}>
         <Text style={styles.text}>Hello Web!</Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       backgroundColor: '#f5f5f5',
     },
     text: {
       fontSize: 24,
       fontWeight: 'bold',
       color: '#333',
     },
   });
   ```
4. Restart the server:
   ```bash
   npx expo start --web
   ```
5. If you see "Hello Web!", the basic setup works
6. Restore your original App.tsx:
   ```bash
   copy App.tsx.backup App.tsx
   ```

## Step 5: Report Back

Please share:
1. What you see in the browser (white screen, error screen, or login screen)
2. Any error messages from the browser console
3. Screenshot if possible

## Files Modified for Web Compatibility

The following files have been updated to work on web:
- `mobile/src/services/notificationService.ts` - Added web platform checks
- `mobile/src/contexts/AuthContext.tsx` - Added web platform checks
- `mobile/src/screens/items/AddItemScreen.tsx` - Web-compatible date/image pickers
- `mobile/src/screens/items/ItemDetailScreen.tsx` - Web-compatible date/image pickers
- `mobile/src/screens/items/ItemsListScreen.tsx` - Fixed shadow styles for web
- `mobile/App.tsx` - Replaced SafeAreaView, added ErrorBoundary
- `mobile/src/components/ErrorBoundary.tsx` - New error boundary component
- `mobile/package.json` - Added react-native-web and react-dom

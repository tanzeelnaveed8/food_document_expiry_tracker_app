import { Platform, PermissionsAndroid } from 'react-native';

// Conditionally import Firebase messaging only on native platforms
let messaging: any = null;
if (Platform.OS !== 'web') {
  messaging = require('@react-native-firebase/messaging').default;
}

class NotificationService {
  async requestPermission(): Promise<boolean> {
    // Web doesn't support Firebase messaging
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled;
      } else {
        // Android 13+ requires runtime permission
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  async checkPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  onTokenRefresh(callback: (token: string) => void) {
    if (Platform.OS === 'web') {
      return () => {}; // Return no-op unsubscribe function
    }
    return messaging().onTokenRefresh(callback);
  }

  onMessage(callback: (message: any) => void) {
    if (Platform.OS === 'web') {
      return () => {}; // Return no-op unsubscribe function
    }
    return messaging().onMessage(callback);
  }

  onNotificationOpenedApp(callback: (message: any) => void) {
    if (Platform.OS === 'web') {
      return () => {}; // Return no-op unsubscribe function
    }
    return messaging().onNotificationOpenedApp(callback);
  }

  async getInitialNotification() {
    if (Platform.OS === 'web') {
      return null;
    }
    return messaging().getInitialNotification();
  }

  async setBadgeCount(count: number) {
    if (Platform.OS === 'ios') {
      await messaging().setApplicationIconBadgeNumber(count);
    }
  }
}

export const notificationService = new NotificationService();

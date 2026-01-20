import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import { api } from '../api/client';
import { storage } from '../utils/storage';
import { notificationService } from '../services/notificationService';
import { User, LoginRequest, SignupRequest } from '../types';

console.log('AuthContext.tsx loaded');

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('AuthProvider rendering');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider useEffect - loadUser');
    loadUser();
    if (Platform.OS !== 'web') {
      setupNotifications();
    }
  }, []);

  useEffect(() => {
    if (user && Platform.OS !== 'web') {
      registerFcmToken();
    }
  }, [user]);

  const setupNotifications = () => {
    // Handle foreground notifications
    const unsubscribeForeground = notificationService.onMessage((message) => {
      console.log('Foreground notification:', message);
      Alert.alert(
        message.notification?.title || 'Notification',
        message.notification?.body || '',
      );
    });

    // Handle notification opened from background
    const unsubscribeBackground = notificationService.onNotificationOpenedApp((message) => {
      console.log('Notification opened from background:', message);
      // Navigate to relevant screen based on message data
    });

    // Handle notification opened from quit state
    notificationService.getInitialNotification().then((message) => {
      if (message) {
        console.log('Notification opened from quit state:', message);
        // Navigate to relevant screen based on message data
      }
    });

    // Handle token refresh
    const unsubscribeTokenRefresh = notificationService.onTokenRefresh((token) => {
      console.log('FCM token refreshed:', token);
      if (user) {
        registerFcmTokenWithBackend(token);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      unsubscribeTokenRefresh();
    };
  };

  const registerFcmToken = async () => {
    try {
      // Check if permission is already granted
      const hasPermission = await notificationService.checkPermission();

      if (!hasPermission) {
        // Request permission
        const granted = await notificationService.requestPermission();
        if (!granted) {
          console.log('Notification permission denied');
          return;
        }
      }

      // Get FCM token
      const token = await notificationService.getFCMToken();
      if (token) {
        await registerFcmTokenWithBackend(token);
      }
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  };

  const registerFcmTokenWithBackend = async (token: string) => {
    try {
      const platform = Platform.OS as 'ios' | 'android';
      await api.registerFcmToken(token, platform);
      console.log('FCM token registered with backend');
    } catch (error) {
      console.error('Failed to register FCM token with backend:', error);
    }
  };

  const loadUser = async () => {
    try {
      const storedUser = await storage.getUser();
      const token = await storage.getAccessToken();

      if (storedUser && token) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await api.login(data);
      await storage.setTokens(response.accessToken, response.refreshToken);
      await storage.setUser(response.user);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      const response = await api.signup(data);
      await storage.setTokens(response.accessToken, response.refreshToken);
      await storage.setUser(response.user);
      setUser(response.user);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove FCM token from backend
      const token = await notificationService.getFCMToken();
      if (token) {
        await api.removeFcmToken(token);
      }

      await api.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await storage.clearAll();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

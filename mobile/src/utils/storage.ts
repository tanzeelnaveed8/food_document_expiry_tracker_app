import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: '@expiry_tracker:access_token',
  REFRESH_TOKEN: '@expiry_tracker:refresh_token',
  USER: '@expiry_tracker:user',
};

export const storage = {
  // Token management
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(KEYS.ACCESS_TOKEN, accessToken),
      AsyncStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(KEYS.REFRESH_TOKEN),
    ]);
  },

  // User management
  async getUser(): Promise<any | null> {
    const userJson = await AsyncStorage.getItem(KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  // Clear all data
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.ACCESS_TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.USER,
    ]);
  },
};

import axios, { AxiosInstance, AxiosError } from 'axios';
import { storage } from '../utils/storage';
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  ItemsResponse,
  StatsResponse,
} from '../types';

const API_URL = 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await storage.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data;
              await storage.setTokens(accessToken, newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await storage.clearAll();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/signup', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  // Items
  async getItems(params?: {
    type?: 'FOOD' | 'DOCUMENT';
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ItemsResponse> {
    const response = await this.client.get<ItemsResponse>('/items', { params });
    return response.data;
  }

  async getExpiringItems(days?: number): Promise<{ items: any[] }> {
    const response = await this.client.get('/items/expiring', {
      params: { days },
    });
    return response.data;
  }

  async getStats(): Promise<StatsResponse> {
    const response = await this.client.get<StatsResponse>('/items/stats');
    return response.data;
  }

  async createFoodItem(data: any): Promise<any> {
    const response = await this.client.post('/items/food', data);
    return response.data;
  }

  async createDocument(data: any): Promise<any> {
    const response = await this.client.post('/items/document', data);
    return response.data;
  }

  async updateFoodItem(id: string, data: any): Promise<any> {
    const response = await this.client.patch(`/items/food/${id}`, data);
    return response.data;
  }

  async updateDocument(id: string, data: any): Promise<any> {
    const response = await this.client.patch(`/items/document/${id}`, data);
    return response.data;
  }

  async deleteItem(id: string, type: 'FOOD' | 'DOCUMENT'): Promise<void> {
    await this.client.delete(`/items/${type}/${id}`);
  }

  // Photo upload
  async uploadPhoto(id: string, type: 'FOOD' | 'DOCUMENT', photo: any): Promise<any> {
    const formData = new FormData();
    formData.append('photo', {
      uri: photo.uri,
      type: photo.type || 'image/jpeg',
      name: photo.fileName || 'photo.jpg',
    } as any);

    const response = await this.client.post(`/items/${type}/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deletePhoto(id: string, type: 'FOOD' | 'DOCUMENT'): Promise<void> {
    await this.client.delete(`/items/${type}/${id}/photo`);
  }

  // Notifications
  async getNotificationPreferences(): Promise<any> {
    const response = await this.client.get('/notifications/preferences');
    return response.data;
  }

  async updateNotificationPreferences(data: any): Promise<any> {
    const response = await this.client.patch('/notifications/preferences', data);
    return response.data;
  }

  // FCM Token
  async registerFcmToken(token: string, platform: 'ios' | 'android', deviceId?: string): Promise<any> {
    const response = await this.client.post('/notifications/fcm-token', {
      token,
      platform,
      deviceId,
    });
    return response.data;
  }

  async removeFcmToken(token: string): Promise<void> {
    await this.client.delete(`/notifications/fcm-token/${token}`);
  }

  async sendTestNotification(): Promise<any> {
    const response = await this.client.post('/notifications/test');
    return response.data;
  }
}

export const api = new ApiClient();

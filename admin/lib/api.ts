import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use(async (config) => {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      return config;
    });
  }

  // Admin endpoints
  async getDashboardStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  async getUsers(params?: {
    status?: 'active' | 'inactive' | 'all';
    plan?: 'free' | 'premium' | 'all';
    search?: string;
    cursor?: string;
    limit?: number;
  }) {
    const response = await this.client.get('/admin/users', { params });
    return response.data;
  }

  async getUserDetails(userId: string) {
    const response = await this.client.get(`/admin/users/${userId}`);
    return response.data;
  }

  async broadcastNotification(data: {
    title: string;
    body: string;
    targetAudience: 'all' | 'premium' | 'free' | 'inactive';
    scheduleFor?: string;
  }) {
    const response = await this.client.post(
      '/admin/notifications/broadcast',
      data,
    );
    return response.data;
  }
}

export const api = new ApiClient();

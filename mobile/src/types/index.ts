export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface FoodItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  quantity?: string;
  storageType: string;
  expiryDate: string;
  status: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: string;
  customType?: string;
  documentNumber?: string;
  issuedDate?: string;
  expiryDate: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type Item = (FoodItem | Document) & { type: 'FOOD' | 'DOCUMENT' };

export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatsResponse {
  total: number;
  totalFood: number;
  totalDocuments: number;
  expired: number;
  expiredFood: number;
  expiredDocuments: number;
  expiringSoon: number;
  expiringFood: number;
  expiringDocuments: number;
}

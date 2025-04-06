import type { Role } from '@/shared/types/common';

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

export interface Profile {
  id: string;
  role: Role | null;
  telegramId: string;
  username: string;
  carModel?: string;
  carNumber?: string;
}

export type OrderStatus = 'pending' | 'negotiating' | 'accepted' | 'inProgress' | 'completed' | 'cancelled';
export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface Order {
  id: string;
  fromAddress: string;
  toAddress: string;
  price?: number;
  finalPrice?: number;
  status: OrderStatus;
  comment?: string;
  passengerId: string;
  driverId?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  offers: PriceOffer[];
  messages: Message[];
}

export interface PriceOffer {
  id: string;
  orderId: string;
  driverId: string;
  price: number;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDTO {
  role: Role;
  carModel?: string;
  carNumber?: string;
}

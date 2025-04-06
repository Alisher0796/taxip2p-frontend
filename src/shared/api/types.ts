export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code: string;
}

export interface Profile {
  id: string;
  role?: 'driver' | 'passenger';
  telegramId: number;
  username?: string;
}

export interface Order {
  id: string;
  fromAddress: string;
  toAddress: string;
  price?: number;
  status: OrderStatus;
  passengerId: string;
  driverId?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';

export interface PriceOffer {
  id: string;
  orderId: string;
  driverId: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  userId: string;
  text: string;
  createdAt: string;
}

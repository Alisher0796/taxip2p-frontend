import { useTelegram } from '@/app/providers/TelegramProvider';
import type { Order, OrderStatus } from '@/shared/types/api';

const API_URL = import.meta.env.VITE_API_URL;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export const createHttp = () => {
  const { webApp } = useTelegram();
  
  return async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', body, headers = {} } = options;

    if (!webApp?.initData) {
      console.error('No Telegram WebApp init data available');
      throw new Error('Невозможно получить данные Telegram');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': webApp.initData,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      console.error('HTTP Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      const error = await response.json().catch(() => ({ message: 'Неизвестная ошибка' }));
      throw new Error(error.message || 'Что-то пошло не так');
    }

    return response.json();
  };
};

export interface CreateOrderDTO {
  fromAddress: string;
  toAddress: string;
  price?: number;
  comment?: string;
}

interface CreateOfferDTO {
  orderId: string;
  price: number;
}

interface UpdateOrderDTO {
  status?: OrderStatus;
  finalPrice?: number;
  driverId?: string;
}

interface UpdateProfileDTO {
  role: 'driver' | 'passenger';
}

const http = createHttp();

export const api = {
  // Профиль
  getProfile: () => http<{ role: 'driver' | 'passenger' | null }>('/profile'),
  updateProfile: (data: UpdateProfileDTO) => http<{ role: 'driver' | 'passenger' }>('/profile', { method: 'PUT', body: data }),

  // Заказы
  getOrders: (status?: OrderStatus) => http<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  getOrder: (id: string) => http<Order>(`/orders/${id}`),
  createOrder: (data: CreateOrderDTO) => http<Order>('/orders', { method: 'POST', body: data }),
  updateOrder: (id: string, data: UpdateOrderDTO) => http<Order>(`/orders/${id}`, { method: 'PUT', body: data }),

  // Предложения цены
  createOffer: (data: CreateOfferDTO) => http<{ id: string }>('/offers', { method: 'POST', body: data }),
  updateOffer: (id: string, data: { status: 'accepted' | 'rejected' }) =>
    http<{ status: 'accepted' | 'rejected' }>(`/offers/${id}`, { method: 'PUT', body: data }),

  // Чат
  getMessages: (orderId: string) => http<{ id: string; text: string; createdAt: string }[]>(`/orders/${orderId}/messages`),
  sendMessage: (orderId: string, text: string) =>
    http<{ id: string; text: string; createdAt: string }>(`/orders/${orderId}/messages`, { method: 'POST', body: { text } }),
} as const;

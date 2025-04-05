import { useTelegram } from '@/app/providers/TelegramProvider';
import type { OrderStatus } from '@/shared/types/api';

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
  getProfile: () => http('/profile'),
  updateProfile: (data: UpdateProfileDTO) => http('/profile', { method: 'PUT', body: data }),

  // Заказы
  getOrders: (status?: OrderStatus) => http(`/orders${status ? `?status=${status}` : ''}`),
  getOrder: (id: string) => http(`/orders/${id}`),
  createOrder: (data: CreateOrderDTO) => http('/orders', { method: 'POST', body: data }),
  updateOrder: (id: string, data: UpdateOrderDTO) => http(`/orders/${id}`, { method: 'PUT', body: data }),

  // Предложения цены
  createOffer: (data: CreateOfferDTO) => http('/offers', { method: 'POST', body: data }),
  updateOffer: (id: string, data: { status: 'accepted' | 'rejected' }) =>
    http(`/offers/${id}`, { method: 'PUT', body: data }),

  // Чат
  getMessages: (orderId: string) => http(`/orders/${orderId}/messages`),
  sendMessage: (orderId: string, text: string) =>
    http(`/orders/${orderId}/messages`, { method: 'POST', body: { text } }),
} as const;

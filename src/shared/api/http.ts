import WebApp from '@twa-dev/sdk';
import { Order, PriceOffer, User, OrderStatus, Message } from '@/shared/types/api';

const API_URL = import.meta.env.VITE_API_URL;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export const http = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers = {} } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': WebApp.initData,
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

    const error = await response.json().catch((parseError) => {
      console.error('Error parsing response:', parseError);
      return { message: 'Неизвестная ошибка' };
    });

    console.error('Error response body:', error);
    throw new Error(error.message || 'Что-то пошло не так');
  }

  return response.json();
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

export const api = {
  // Профиль
  getProfile: () => http<User>('/profile'),
  updateProfile: (data: UpdateProfileDTO) => http<User>('/profile', { method: 'PUT', body: data }),

  // Заказы
  getOrders: (status?: OrderStatus) => http<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  getOrder: (id: string) => http<Order>(`/orders/${id}`),
  createOrder: (data: CreateOrderDTO) => http<Order>('/orders', { method: 'POST', body: data }),
  updateOrder: (id: string, data: UpdateOrderDTO) => http<Order>(`/orders/${id}`, { method: 'PUT', body: data }),

  // Предложения цены
  createOffer: (data: CreateOfferDTO) => http<PriceOffer>('/offers', { method: 'POST', body: data }),
  updateOffer: (id: string, data: { status: 'accepted' | 'rejected' }) =>
    http<PriceOffer>(`/offers/${id}`, { method: 'PUT', body: data }),

  // Чат
  getMessages: (orderId: string) => http<Message[]>(`/orders/${orderId}/messages`),
  sendMessage: (orderId: string, text: string) =>
    http<Message>(`/orders/${orderId}/messages`, { method: 'POST', body: { text } }),
};

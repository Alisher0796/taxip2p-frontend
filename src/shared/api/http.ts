import type { Order, OrderStatus, PriceOffer, Message, Profile } from '@/shared/types/api';
import type { TelegramWebApp } from '@/shared/types/telegram';
import WebApp from '@twa-dev/sdk';

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
const API_PREFIX = '/api';

if (!BASE_URL) {
  throw new Error('VITE_API_URL is not defined');
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export const createHttp = () => {
  return async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const webApp = (WebApp as unknown) as TelegramWebApp;
    
    if (!webApp?.initData || !webApp?.initDataUnsafe?.user) {
      console.error('WebApp initialization error:', { 
        initData: webApp?.initData,
        user: webApp?.initDataUnsafe?.user 
      });
      throw new Error('Ошибка авторизации Telegram');
    }

    const { initData } = webApp;

    requestHeaders['x-telegram-init-data'] = initData;

    const fullUrl = `${BASE_URL}${API_PREFIX}${endpoint}`;
    console.log('Request to API:', { method, fullUrl, body });

    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      console.error('HTTP Error:', {
        status: response.status,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
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
  startedAt?: string;
  completedAt?: string;
}

interface UpdateProfileDTO {
  role: 'driver' | 'passenger';
}

const http = createHttp();

export const api = {
  // Профиль
  getProfile: () => http<Profile>('/profile'),
  updateProfile: (data: UpdateProfileDTO) =>
    http<Profile>('/profile', { method: 'PUT', body: data }),

  // Заказы
  getOrders: (status?: OrderStatus) =>
    http<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  getOrder: (id: string) => http<Order>(`/orders/${id}`),
  createOrder: (data: CreateOrderDTO) =>
    http<Order>('/orders', { method: 'POST', body: data }),
  updateOrder: (id: string, data: UpdateOrderDTO) =>
    http<Order>(`/orders/${id}`, { method: 'PUT', body: data }),

  // Предложения цены
  getOffers: (orderId: string) =>
    http<PriceOffer[]>(`/orders/${orderId}/offers`),
  createOffer: (data: CreateOfferDTO) =>
    http<PriceOffer>('/offers', { method: 'POST', body: data }),
  updateOffer: (id: string, data: { status: 'accepted' | 'rejected' }) =>
    http<PriceOffer>(`/offers/${id}`, { method: 'PUT', body: data }),

  // Чат
  getMessages: (orderId: string) =>
    http<Message[]>(`/orders/${orderId}/messages`),
  sendMessage: (orderId: string, text: string) =>
    http<Message>(`/orders/${orderId}/messages`, {
      method: 'POST',
      body: { text },
    }),
} as const;

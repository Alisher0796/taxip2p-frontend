import WebApp from '@twa-dev/sdk';
import { TripRequest, PriceOffer } from '@/shared/types/api';

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
    const error = await response.json().catch(() => ({ message: 'Неизвестная ошибка' }));
    throw new Error(error.message || 'Что-то пошло не так');
  }

  return response.json();
};

type CreateTripRequestDTO = Omit<TripRequest, 'id' | 'status' | 'passengerId' | 'createdAt' | 'updatedAt'>;
type CreatePriceOfferDTO = Omit<PriceOffer, 'id' | 'status' | 'createdAt'>;

export const api = {
  // Заявки
  getTripRequests: () => http<TripRequest[]>('/trip-requests'),
  createTripRequest: (data: CreateTripRequestDTO) =>
    http<TripRequest>('/trip-requests', { method: 'POST', body: data }),
  updateTripRequest: (id: number, data: Partial<TripRequest>) =>
    http<TripRequest>(`/trip-requests/${id}`, { method: 'PUT', body: data }),

  // Предложения цены
  createPriceOffer: (data: CreatePriceOfferDTO) =>
    http<PriceOffer>('/price-offers', { method: 'POST', body: data }),
  updatePriceOffer: (id: number, data: Partial<PriceOffer>) =>
    http<PriceOffer>(`/price-offers/${id}`, { method: 'PUT', body: data }),

  // Профиль водителя
  updateDriverProfile: (data: { carModel: string; licensePlate: string }) =>
    http<{ success: boolean }>('/driver/profile', { method: 'PUT', body: data }),
};

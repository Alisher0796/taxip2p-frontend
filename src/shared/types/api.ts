export type OrderStatus = 'pending' | 'negotiating' | 'accepted' | 'inProgress' | 'completed' | 'cancelled';
export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  id: string;
  username: string;
  telegramId: string;
  role: 'driver' | 'passenger' | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  fromAddress: string;
  toAddress: string;
  price?: number;
  finalPrice?: number;
  status: OrderStatus;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  passenger: User;
  driver?: User;
  offers: PriceOffer[];
  messages: Message[];
}

export interface PriceOffer {
  id: string;
  price: number;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  order: Order;
  orderId: string;
  driver: User;
  driverId: string;
}

export interface Message {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  order: Order;
  orderId: string;
  sender: User;
  senderId: string;
}

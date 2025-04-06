/** Интервал подачи машины */
export type PickupTime =
  | 'MINS_15'  // Через 15 минут
  | 'MINS_30'  // Через 30 минут
  | 'HOUR_1';  // Через 1 час

/** Статусы заказа */
export type OrderStatus = 
  | 'pending'      // Ожидает предложений
  | 'negotiating'  // Идет обсуждение цены
  | 'accepted'     // Заказ принят водителем
  | 'inProgress'   // Водитель в пути
  | 'completed'    // Заказ завершен
  | 'cancelled';   // Заказ отменен

/** Статусы предложения цены */
export type OfferStatus = 
  | 'pending'    // Ожидает ответа
  | 'accepted'   // Принято
  | 'rejected';  // Отклонено

/** Базовый профиль пользователя */
export interface Profile {
  readonly id: string;
  readonly username: string;
  readonly telegramId: string;
  role: 'driver' | 'passenger' | null;
  carModel?: string;
  carNumber?: string;
}

/** Расширенная информация о пользователе */
export interface User extends Profile {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Заказ на поездку */
export interface Order {
  readonly id: string;
  readonly fromAddress: string;
  readonly toAddress: string;
  price?: number;
  finalPrice?: number;
  status: OrderStatus;
  pickupTime: PickupTime;
  comment?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  readonly passenger: User;
  driver?: User;
  readonly offers: PriceOffer[];
  readonly messages: Message[];
}

/** Предложение цены от водителя */
export interface PriceOffer {
  readonly id: string;
  readonly price: number;
  status: OfferStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly order: Order;
  readonly orderId: string;
  readonly driver: User;
  readonly driverId: string;
}

/** Сообщение в чате заказа */
export interface Message {
  readonly id: string;
  readonly text: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly order?: Order;
  readonly orderId?: string;
  readonly sender: User;
  readonly senderId?: string;
}

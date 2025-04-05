export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type Role = 'passenger' | 'driver';

export interface User {
  id: string;
  telegramId: string;
  username: string;
  role: Role | null;
  car?: {
    model: string;
    licensePlate: string;
  };
  createdAt: string;
  updatedAt: string;
}



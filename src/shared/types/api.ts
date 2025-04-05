export interface TripRequest {
  id: number;
  passengerId: number;
  fromAddress: string;
  toAddress: string;
  desiredPrice: number;
  pickupTime: 'PT15M' | 'PT30M' | 'PT1H';
  comment?: string;
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PriceOffer {
  id: number;
  tripRequestId: number;
  driverId: number;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ActiveTrip {
  id: number;
  requestId: number;
  passengerId: number;
  driverId: number;
  finalPrice: number;
  status: 'active' | 'completed';
  startedAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: number;
  tripId: number;
  senderId: number;
  content: string;
  createdAt: string;
}

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TripRequest, PriceOffer } from '@/shared/types/api';

interface TripRequestState {
  activeRequests: TripRequest[];
  currentRequest: TripRequest | null;
  offers: PriceOffer[];
  setActiveRequests: (requests: TripRequest[]) => void;
  setCurrentRequest: (request: TripRequest | null) => void;
  setOffers: (offers: PriceOffer[]) => void;
  addOffer: (offer: PriceOffer) => void;
  updateRequestStatus: (requestId: number, status: TripRequest['status']) => void;
}

export const useTripRequestStore = create<TripRequestState>()(
  devtools((set) => ({
    activeRequests: [],
    currentRequest: null,
    offers: [],
    setActiveRequests: (requests) => set({ activeRequests: requests }),
    setCurrentRequest: (request) => set({ currentRequest: request }),
    setOffers: (offers) => set({ offers }),
    addOffer: (offer) => 
      set((state) => ({ 
        offers: [...state.offers, offer] 
      })),
    updateRequestStatus: (requestId, status) =>
      set((state) => ({
        activeRequests: state.activeRequests.map((request) =>
          request.id === requestId ? { ...request, status } : request
        ),
      })),
  }))
);

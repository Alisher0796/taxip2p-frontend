import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Order, PriceOffer } from '@/shared/types/api';

interface OrderState {
  activeOrders: Order[];
  currentOrder: Order | null;
  offers: PriceOffer[];
  setActiveOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  setOffers: (offers: PriceOffer[]) => void;
  addOffer: (offer: PriceOffer) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderState>()(
  devtools((set) => ({
    activeOrders: [],
    currentOrder: null,
    offers: [],
    setActiveOrders: (orders) => set({ activeOrders: orders }),
    setCurrentOrder: (order) => set({ currentOrder: order }),
    setOffers: (offers) => set({ offers }),
    addOffer: (offer) => 
      set((state) => ({ 
        offers: [...state.offers, offer] 
      })),
    updateOrderStatus: (orderId, status) =>
      set((state) => ({
        activeOrders: state.activeOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
        currentOrder:
          state.currentOrder?.id === orderId
            ? { ...state.currentOrder, status }
            : state.currentOrder,
      })),
  }))
);

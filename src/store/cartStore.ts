import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  discount_price?: number | null;
  image_url: string;
  category: string;
  quantity: number;
  selectedSpecs?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (item, quantity) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          };
        }
        return { items: [...state.items, { ...item, quantity }] };
      }),
      
      removeFromCart: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        ),
      })),
      
      clearCart: () => set({ items: [] }),
      
      totalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },
      
      subtotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          const effectivePrice = item.discount_price && item.discount_price > 0 ? item.discount_price : item.price;
          return total + (effectivePrice * item.quantity);
        }, 0);
      },
    }),
    {
      name: 'krishna-furniture-cart',
    }
  )
);

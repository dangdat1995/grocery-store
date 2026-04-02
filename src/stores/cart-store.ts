import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, buyMode?: "retail" | "bulk") => void;
  removeItem: (productId: string, buyMode?: "retail" | "bulk") => void;
  updateQuantity: (productId: string, quantity: number, buyMode?: "retail" | "bulk") => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

function cartKey(id: string, mode?: string) {
  return `${id}_${mode || "retail"}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, buyMode = "retail") =>
        set((state) => {
          const key = cartKey(product.id, buyMode);
          const existing = state.items.find(
            (item) => cartKey(item.product.id, item.buyMode) === key
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                cartKey(item.product.id, item.buyMode) === key
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1, buyMode }] };
        }),

      removeItem: (productId, buyMode = "retail") =>
        set((state) => ({
          items: state.items.filter((item) => cartKey(item.product.id, item.buyMode) !== cartKey(productId, buyMode)),
        })),

      updateQuantity: (productId, quantity, buyMode = "retail") =>
        set((state) => {
          const key = cartKey(productId, buyMode);
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) => cartKey(item.product.id, item.buyMode) !== key
              ),
            };
          }
          return {
            items: state.items.map((item) =>
              cartKey(item.product.id, item.buyMode) === key ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, item) => {
          const price = item.buyMode === "bulk" && item.product.bulk_price
            ? item.product.bulk_price
            : item.product.price;
          return sum + price * item.quantity;
        }, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "grocery-cart",
    }
  )
);

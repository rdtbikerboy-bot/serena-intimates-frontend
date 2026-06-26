// src/store/useCartStore.ts
"use client";

import { create } from "zustand";
import { serenaLogger } from "@/core/logger";
import { trackAddToCart, trackRemoveFromCart, trackClearCart } from "./useCartEvents";
import { loadCart as persistLoadCart, saveCart as persistSaveCart, clearCartStorage as persistClearCartStorage } from "./cartPersistence";

/**
 * Estructura de Item del Carrito alineada con los tipos inmutables del Dominio de la Orden.
 */
export interface CartItem {
  id: string; // ID del producto
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  quantity: number;
}

interface CartState {
  _hasHydrated: boolean;
  cartItems: CartItem[];
  loadCart: () => Promise<void>;
  addItem: (item: { id: string; title: string; imageUrl: string }, size: string, price: number) => void;
  removeItem: (itemId: string, size: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

/**
 * Zustand Store: Gestión del estado global del Carrito de Compras en la UI.
 * Totalmente desacoplado de bases de datos externas y sincronizado mediante el local storage.
 */
export const useCartStore = create<CartState>((set, get) => ({
  _hasHydrated: false,
  cartItems: [],

  loadCart: async () => {
    const persisted = await persistLoadCart();
    set({ cartItems: persisted, _hasHydrated: true });
  },

  addItem: (item, size, price) => {
    const { cartItems } = get();
    const existing = cartItems.find((i) => i.id === item.id && i.size === size);
    let nextItems: CartItem[];

    if (existing) {
      nextItems = cartItems.map((i) =>
        i.id === item.id && i.size === size
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
    } else {
      nextItems = [
        ...cartItems,
        {
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          size,
          price,
          quantity: 1,
        },
      ];
    }

    set({ cartItems: nextItems });
    serenaLogger.info(`[UI Store] Añadido al carro: ${item.title} (Talle ${size})`);

    trackAddToCart(item.id, undefined);
    persistSaveCart(get().cartItems);
  },

  removeItem: (itemId, size) => {
    const { cartItems } = get();
    const existing = cartItems.find((i) => i.id === itemId && i.size === size);
    let nextItems: CartItem[];

    if (existing && existing.quantity > 1) {
      nextItems = cartItems.map((i) =>
        i.id === itemId && i.size === size
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    } else {
      nextItems = cartItems.filter((i) => !(i.id === itemId && i.size === size));
    }

    set({ cartItems: nextItems });
    serenaLogger.info(`[UI Store] Removido del carro: ID=${itemId} (Talle ${size})`);

    trackRemoveFromCart(itemId, undefined);
    persistSaveCart(get().cartItems);
  },

  clearCart: () => {
    set({ cartItems: [] });
    serenaLogger.info("[UI Store] Carrito de compras vaciado completamente.");

    trackClearCart();
    persistClearCartStorage();
  },

  getSubtotal: () => {
    const { cartItems } = get();
    return cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  },
}));
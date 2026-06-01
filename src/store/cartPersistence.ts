// src/store/cartPersistence.ts

import { get, set, del } from "idb-keyval";
import { CartItem } from "@/core/types";
import { serenaLogger } from "@/core/logger";

/**
 * Key used to store the cart items in IndexedDB via idb-keyval.
 */
const CART_STORAGE_KEY = "serena_cart_items";

/**
 * Load the persisted cart items from IndexedDB.
 * Returns an empty array if no data is found.
 */
export async function loadCart(): Promise<CartItem[]> {
  try {
    const stored = await get<CartItem[]>(CART_STORAGE_KEY);
    if (Array.isArray(stored)) {
      serenaLogger.info("Cart loaded from IndexedDB", { count: stored.length });
      return stored;
    }
    return [];
  } catch (error) {
    serenaLogger.error("Error loading cart from IndexedDB", { error });
    return [];
  }
}

/**
 * Persist the current cart items to IndexedDB.
 */
export async function saveCart(cart: CartItem[]): Promise<void> {
  try {
    await set(CART_STORAGE_KEY, cart);
    serenaLogger.info("Cart saved to IndexedDB", { count: cart.length });
  } catch (error) {
    serenaLogger.error("Error saving cart to IndexedDB", { error });
  }
}

/**
 * Remove the persisted cart from IndexedDB.
 */
export async function clearCartStorage(): Promise<void> {
  try {
    await del(CART_STORAGE_KEY);
    serenaLogger.info("Cart storage cleared from IndexedDB");
  } catch (error) {
    serenaLogger.error("Error clearing cart storage from IndexedDB", { error });
  }
}

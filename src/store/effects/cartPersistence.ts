"use client";

import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import { useCartStore } from "@/store/useCartStore";
import { serenaLogger } from "@/core/logger";
import { CartItem } from "@/core/types";

const CART_KEY = "serena_cart_idb";

let alreadyInitialized = false;
let isHydrating = false;
let unsub: (() => void) | null = null;

export async function initCartPersistence() {
  if (typeof window === "undefined" || alreadyInitialized) return;
  alreadyInitialized = true;
  isHydrating = true;

  try {
    const saved = await idbGet<CartItem[]>(CART_KEY);
    if (saved) {
      useCartStore.setState({ cartItems: saved, _hasHydrated: true });
    } else {
      // Fallback backward compatibility to localStorage
      const legacy = localStorage.getItem("serena_cart");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        useCartStore.setState({ cartItems: parsed, _hasHydrated: true });
        await idbSet(CART_KEY, parsed);
        localStorage.removeItem("serena_cart"); // Migrate
      } else {
        useCartStore.setState({ _hasHydrated: true });
      }
    }
  } catch (e) {
    serenaLogger.error("Error al hidratar el carrito desde IDB.", e);
    useCartStore.setState({ _hasHydrated: true });
  } finally {
    isHydrating = false;
  }

  // Subscribe to store changes for reactive persistence
  unsub = useCartStore.subscribe((state, prevState) => {
    // Skip persistence during hydration or if store not yet hydrated
    if (!state._hasHydrated || isHydrating) return;

    if (state.cartItems !== prevState.cartItems) {
      if (state.cartItems.length === 0) {
        idbDel(CART_KEY).catch(e => serenaLogger.error("Error vaciando IDB (Cart)", e));
      } else {
        idbSet(CART_KEY, state.cartItems).catch(e => serenaLogger.error("Error guardando en IDB (Cart)", e));
      }
    }
  });
}

export function cleanupCartPersistence() {
  if (unsub) {
    unsub();
    unsub = null;
  }
  alreadyInitialized = false;
}

// src/store/useCartEvents.ts

import { useFunnelStore } from "./useFunnelStore";
import { FunnelEventType } from "@/core/types";

/**
 * Track a cart add-to-cart event.
 * Uses the FunnelEventType 'CTL_ADD_TO_CART'.
 */
export function trackAddToCart(productId: string, clientId?: string) {
  const store = useFunnelStore.getState();
  const eventType: FunnelEventType = "ADD_TO_CART" as FunnelEventType;
  store.trackEvent(eventType, productId, clientId);
}

/**
 * Track a cart remove-from-cart event.
 * Uses the FunnelEventType 'CTL_CLICK' with metadata indicating removal.
 */
export function trackRemoveFromCart(productId: string, clientId?: string) {
  const store = useFunnelStore.getState();
  const eventType: FunnelEventType = "REMOVE_FROM_CART" as FunnelEventType;
  store.trackEvent(eventType, productId, clientId, { action: "remove_from_cart" });
}

/**
 * Track a cart clear event.
 * Uses the FunnelEventType 'CTL_CLICK' with metadata indicating clear.
 */
export function trackClearCart() {
  const store = useFunnelStore.getState();
  const eventType: FunnelEventType = "CLEAR_CART" as FunnelEventType;
  store.trackEvent(eventType, undefined, undefined, { action: "clear_cart" });
}

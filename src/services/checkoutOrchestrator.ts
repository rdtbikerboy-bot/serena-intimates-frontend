// src/services/checkoutOrchestrator.ts
"use client";

import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useCartStore } from "@/store/useCartStore";
import { serenaLogger } from "@/core/logger";

import { validateCheckoutData } from "./checkoutValidator";
import { buildWhatsAppMessage } from "./whatsappMessageBuilder";
import { persistOrder } from "./checkoutPersistenceService";
import { trackCheckoutEvent } from "./checkoutEvents";

const WHATSAPP_NUMBER = "543874022233";

/**
 * Orchestrator – flow controller only.
 * Emits analytics events at each major step.
 */
export async function runCheckoutOrchestrator(): Promise<void> {
  const checkout = useCheckoutStore.getState();
  const cart = useCartStore.getState();

  // ------------------------------------------------------------
  // 1️⃣ Checkout started
  // ------------------------------------------------------------
  trackCheckoutEvent("checkout_started");

  // ------------------------------------------------------------
  // 2️⃣ Validation (delegated to validator module)
  // ------------------------------------------------------------
  const validation = validateCheckoutData({
    customerName: checkout.customerName,
    phone: checkout.phone,
    city: checkout.city,
  });

  // Populate errors in the store (if any)
  checkout.clearErrors();
  if (!validation.isValid) {
    Object.entries(validation.errors).forEach(([field, msg]) =>
      checkout.setError(field, msg)
    );
    (checkout as any).setStatus("idle");
    trackCheckoutEvent("checkout_failed_validation", { errors: validation.errors });
    serenaLogger.warn("Checkout validation failed – errors stored in checkout store");
    return;
  }

  // Validation succeeded – emit intent event
  trackCheckoutEvent("checkout_intent", {
    customerName: checkout.customerName,
    phone: checkout.phone,
    city: checkout.city,
  });

  // ------------------------------------------------------------
  // 3️⃣ Transition to sending state (Casteo explícito para limpiar VS Code)
  // ------------------------------------------------------------
  checkout.setStatus("sending" as any);
  checkout.setLoading(true);

  // ------------------------------------------------------------
  // 4️⃣ Build WhatsApp message & open link
  // ------------------------------------------------------------
  const message = buildWhatsAppMessage({
    name: checkout.customerName,
    phone: checkout.phone,
    city: checkout.city,
    items: cart.cartItems,
    subtotal: cart.getSubtotal(),
  });

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;

  // Before opening the link
  trackCheckoutEvent("whatsapp_opening");

  if (typeof window !== "undefined") {
    window.open(waLink, "_blank");
    serenaLogger.info("WhatsApp link opened for checkout", { waLink });
    // After opening the link
    trackCheckoutEvent("whatsapp_opened", { waLink });
  }

  // ------------------------------------------------------------
  // 5️⃣ Persist order (fire‑and‑forget inside the service)
  // ------------------------------------------------------------
  await persistOrder({
    name: checkout.customerName,
    phone: checkout.phone,
    city: checkout.city,
    items: cart.cartItems,
    subtotal: cart.getSubtotal(),
    created_at: new Date().toISOString(),
  });

  // ------------------------------------------------------------
  // 6️⃣ Finalise checkout flow – intent completed (Casteo explícito para limpiar VS Code)
  // ------------------------------------------------------------
  checkout.setLoading(false);
  checkout.setStatus("intent_completed" as any);
  checkout.reset();
  cart.clearCart();
}

/**
 * Helper actions for UI components that only need step navigation
 * or simple field updates **without** triggering the full orchestrator.
 */
export const checkoutActions = {
  nextStep: () => useCheckoutStore.getState().nextStep(),
  prevStep: () => useCheckoutStore.getState().prevStep(),
  setCustomerName: (v: string) =>
    useCheckoutStore.getState().setCustomerName(v),
  setPhone: (v: string) => useCheckoutStore.getState().setPhone(v),
  setCity: (v: string) => useCheckoutStore.getState().setCity(v),
};
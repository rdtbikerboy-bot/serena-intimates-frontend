// src/services/checkoutOrchestrator.ts
"use client";

import { CreateOrderCommand } from "@/application/order/createOrder.command";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useCartStore } from "@/store/useCartStore";
import { serenaLogger } from "@/core/logger";
import { validateCheckoutData } from "./checkoutValidator";
import { buildWhatsAppMessage } from "./whatsappMessageBuilder";
import { createOrder } from "./orderService";
import { trackCheckoutEvent } from "./checkoutEvents";
import { orderStatusService } from "./orderStatusService";
import { BrowserWhatsappGateway } from "@/infrastructure/whatsapp/BrowserWhatsappGateway";

const WHATSAPP_NUMBER = "543874022233";

/**
 * Orquestador de Checkout (Capa UI Component Service/Adapter).
 * Controla el flujo secuencial sin lógica de negocio incrustada y despacha eventos analíticos.
 */
export async function runCheckoutOrchestrator(): Promise<void> {
  const checkout = useCheckoutStore.getState();
  const cart = useCartStore.getState();

  // 1️⃣ Inicio del Checkout
  trackCheckoutEvent("checkout_started");

  // 2️⃣ Validación del Formulario en UI
  const validation = validateCheckoutData({
    customerName: checkout.customerName,
    phone: checkout.phone,
    city: checkout.city,
  });

  checkout.clearErrors();

  if (!validation.isValid) {
    Object.entries(validation.errors).forEach(([field, msg]) =>
      checkout.setError(field, msg)
    );

    checkout.setStatus("idle");

    trackCheckoutEvent("checkout_failed_validation", {
      errors: validation.errors,
    });

    serenaLogger.warn("Validación de checkout fallida - Errores mapeados en Store");
    return;
  }

  // Validación exitosa
  trackCheckoutEvent("checkout_intent", {
    customerName: checkout.customerName,
    phone: checkout.phone,
    city: checkout.city,
  });

  // 3️⃣ Transición visual de procesamiento
  checkout.setStatus("sending");
  checkout.setLoading(true);

  // 4️⃣ Construcción de Command para la Capa de Aplicación
  const orderPayload: CreateOrderCommand = {
    customer: {
      name: checkout.customerName,
      phone: checkout.phone,
      address: checkout.city,
      deliveryMethod: "delivery",
    },
    items: cart.cartItems,
  };

  let order;

  try {
    order = await createOrder(orderPayload);

    trackCheckoutEvent("order_created", {
      orderId: order.id,
    });
  } catch (error) {
    serenaLogger.error("Error en la creación de la orden", { error });

    checkout.setLoading(false);
    checkout.setStatus("idle");

    trackCheckoutEvent("checkout_failed_order_creation", { error });
    return;
  }

  // 5️⃣ Integración Gateway Canales (WhatsApp Link Injection)
  const message = buildWhatsAppMessage({
    orderId: order.commercialOrderCode,
    name: checkout.customerName,
    phone: checkout.phone,
    deliveryMethod: "delivery",
    address: checkout.city,
    items: cart.cartItems,
    total: cart.getSubtotal(),
  });

  const whatsappGateway = new BrowserWhatsappGateway(WHATSAPP_NUMBER);

  trackCheckoutEvent("whatsapp_opening");
  whatsappGateway.open(message);

  serenaLogger.info("Gateway WhatsApp abierto para Checkout", { message });

  trackCheckoutEvent("whatsapp_opened", { message });

  // Registro asíncrono persistente de la transición
  try {
    await orderStatusService.markWhatsappOpened(order.id);
  } catch (e) {
    serenaLogger.error("No se pudo marcar la orden como WHATSAPP_OPENED", { error: e });
  }

  // 6️⃣ Finalización y limpieza de estados locales
  checkout.setLoading(false);
  checkout.setStatus("intent_completed");

  checkout.reset();
  cart.clearCart();
}

/**
 * Acciones directas para mapeo de componentes atómicos UI
 */
export const checkoutActions = {
  nextStep: () => useCheckoutStore.getState().nextStep(),
  prevStep: () => useCheckoutStore.getState().prevStep(),
  setCustomerName: (v: string) => useCheckoutStore.getState().setCustomerName(v),
  setPhone: (v: string) => useCheckoutStore.getState().setPhone(v),
  setCity: (v: string) => useCheckoutStore.getState().setCity(v),
};
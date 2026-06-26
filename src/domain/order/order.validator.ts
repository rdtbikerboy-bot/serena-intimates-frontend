// src/domain/order/order.validator.ts
import { Order } from "./order.entity";
import { OrderStatus } from "./order.valueObjects";

/**
 * Valida los invariantes esenciales del Agregado de Órdenes que aplican a cualquier estado.
 */
export function validateOrderAggregate(order: Order): void {
  // ---- CUSTOMER ----
  const { name, phone, deliveryMethod } = order.customer;
  if (!name || name.trim() === "") {
    throw new Error("[Domain Validation] El nombre de la clienta es requerido.");
  }
  if (!phone || phone.trim() === "") {
    throw new Error("[Domain Validation] El teléfono de la clienta es requerido.");
  }
  if (deliveryMethod !== "delivery" && deliveryMethod !== "pickup") {
    throw new Error("[Domain Validation] El método de entrega debe ser 'delivery' o 'pickup'.");
  }

  // ---- ITEMS ----
  if (!order.items || order.items.length === 0) {
    throw new Error("[Domain Validation] El pedido debe contener al menos un producto.");
  }
  for (const item of order.items) {
    if (!item.id || item.id.trim() === "") {
      throw new Error("[Domain Validation] El ID del producto es requerido.");
    }
    if (!item.title || item.title.trim() === "") {
      throw new Error("[Domain Validation] El título del producto es requerido.");
    }
    if (!item.size || item.size.trim() === "") {
      throw new Error("[Domain Validation] El talle del producto es requerido.");
    }
    if (item.quantity <= 0) {
      throw new Error(`[Domain Validation] La cantidad debe ser mayor a 0 (ID: ${item.id}).`);
    }
    if (item.price <= 0) {
      throw new Error(`[Domain Validation] El precio debe ser mayor a 0 (ID: ${item.id}).`);
    }
  }

  // ---- TOTALS ----
  const recalculatedSubtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (Math.abs(recalculatedSubtotal - order.subtotal) > 1e-6) {
    throw new Error(`[Domain Validation] Desajuste de subtotal: esperado ${recalculatedSubtotal}, obtenido ${order.subtotal}`);
  }
  if (order.total < order.subtotal) {
    throw new Error("[Domain Validation] El total de la orden no puede ser menor al subtotal.");
  }

  // ---- CURRENCY ----
  if (order.currency !== "ARS") {
    throw new Error("[Domain Validation] La moneda oficial del mercado soportado debe ser 'ARS'.");
  }

  // ---- TIMELINE ----
  if (!order.timeline || order.timeline.length === 0) {
    throw new Error("[Domain Validation] El historial de eventos (timeline) no puede estar vacío.");
  }
}

/**
 * Validaciones exclusivas para órdenes nuevas en proceso de creación.
 */
export function validateNewOrder(order: Order): void {
  validateOrderAggregate(order);

  if (order.status !== OrderStatus.PendingWhatsapp) {
    throw new Error(`[Domain Validation] El estado inicial de un pedido nuevo debe ser ${OrderStatus.PendingWhatsapp}`);
  }
}

export function validateOrder(order: Order): void {
  validateNewOrder(order);
}
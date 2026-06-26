// src/domain/order/order.validator.ts
import { Order } from "./order.entity";
import { OrderStatus } from "./order.valueObjects";

/**
 * Validate the core aggregate invariants that apply to any persisted Order.
 * This checks customer fields, items, totals, currency and timeline consistency.
 * It does NOT enforce creation‑only rules such as initial status or timeline length.
 */
export function validateOrderAggregate(order: Order): void {
  // ---- CUSTOMER ----
  const { name, phone, deliveryMethod } = order.customer;
  if (!name || name.trim() === "") {
    throw new Error("Customer name is required");
  }
  if (!phone || phone.trim() === "") {
    throw new Error("Customer phone is required");
  }
  if (deliveryMethod !== "delivery" && deliveryMethod !== "pickup") {
    throw new Error("Customer deliveryMethod must be either 'delivery' or 'pickup'");
  }

  // ---- ITEMS ----
  if (!order.items || order.items.length === 0) {
    throw new Error("Order must contain at least one item");
  }
  for (const item of order.items) {
    if (!item.id || item.id.trim() === "") {
      throw new Error("Item id is required");
    }
    if (!item.title || item.title.trim() === "") {
      throw new Error("Item title is required");
    }
    if (!item.size || item.size.trim() === "") {
      throw new Error("Item size is required");
    }
    if (item.quantity <= 0) {
      throw new Error(`Item quantity must be > 0 (item id: ${item.id})`);
    }
    if (item.price <= 0) {
      throw new Error(`Item price must be > 0 (item id: ${item.id})`);
    }
  }

  // ---- TOTALS ----
  const recalculatedSubtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (Math.abs(recalculatedSubtotal - order.subtotal) > 1e-6) {
    throw new Error(`Order subtotal mismatch: expected ${recalculatedSubtotal}, got ${order.subtotal}`);
  }
  if (order.total < order.subtotal) {
    throw new Error("Order total must be greater than or equal to subtotal");
  }

  // ---- CURRENCY ----
  if (order.currency !== "ARS") {
    throw new Error("Order currency must be 'ARS'");
  }

  // ---- TIMELINE CONSISTENCY ----
  if (!order.timeline) {
    throw new Error("Order timeline must be defined");
  }
  for (const ev of order.timeline) {
    if (ev.status === undefined) {
      throw new Error("Timeline event missing status");
    }
    if (!(ev.timestamp instanceof Date)) {
      throw new Error("Timeline event timestamp must be a Date");
    }
  }
  // Ensure timeline is ordered chronologically (optional, defensive)
  for (let i = 1; i < order.timeline.length; i++) {
    if (order.timeline[i].timestamp < order.timeline[i - 1].timestamp) {
      throw new Error("Timeline events must be in chronological order");
    }
  }
}

/**
 * Creation‑only validation. Enforces that a brand‑new Order starts in the
 * PendingWhatsapp status and contains exactly one timeline event matching that
 * status.
 */
export function validateNewOrder(order: Order): void {
  // Run the generic aggregate validation first.
  validateOrderAggregate(order);

  // ---- CREATION‑ONLY RULES ----
  if (order.status !== OrderStatus.PendingWhatsapp) {
    throw new Error(`Order initial status must be ${OrderStatus.PendingWhatsapp}`);
  }
  if (!order.timeline || order.timeline.length !== 1) {
    throw new Error("Order timeline must contain exactly one event");
  }
  if (order.timeline[0].status !== order.status) {
    throw new Error("First timeline event status must match order status");
  }
}

/**
 * Backward‑compatible wrapper kept for any legacy imports.
 */
export function validateOrder(order: Order): void {
  // Historically validateOrder performed full creation validation.
  // Keep this behaviour by delegating to validateNewOrder.
  validateNewOrder(order);
}

// src/domain/order/order.stateMachine.ts

import { OrderStatus } from "./order.valueObjects";

/**
 * Matriz de transición de estados determinista para el flujo comercial de Serena Intimates.
 */
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PendingWhatsapp]: [OrderStatus.WhatsappOpened, OrderStatus.Cancelled],
  [OrderStatus.WhatsappOpened]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
  [OrderStatus.Confirmed]: [OrderStatus.Preparing, OrderStatus.Cancelled],
  [OrderStatus.Preparing]: [OrderStatus.ReadyForPickup, OrderStatus.Shipped, OrderStatus.Cancelled],
  [OrderStatus.ReadyForPickup]: [OrderStatus.Shipped, OrderStatus.Cancelled],
  [OrderStatus.Shipped]: [OrderStatus.Delivered, OrderStatus.Cancelled],
  [OrderStatus.Delivered]: [],
  [OrderStatus.Cancelled]: []
};

/**
 * Evalúa si el cambio de estado solicitado es lícito.
 */
export function canTransition(current: OrderStatus, next: OrderStatus): boolean {
  const allowed = allowedTransitions[current] || [];
  return allowed.includes(next);
}

/**
 * Aplica aserción de negocio lanzando excepciones controladas de dominio ante violaciones de flujo.
 */
export function assertTransition(current: OrderStatus, next: OrderStatus): void {
  if (!canTransition(current, next)) {
    throw new Error(`[Domain Exception] Transición inválida de estado: Imposible pasar de ${current} a ${next}`);
  }
}
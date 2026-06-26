// src/infrastructure/order/order.mapper.ts

import { Order } from '@/domain/order/order.entity';
import { OrderStatus, OrderEvent, OrderItem } from '@/domain/order/order.valueObjects';

/**
 * Representación relacional exacta en snake_case para la tabla `orders` de Supabase.
 */
export type SupabaseOrderRecord = {
  id: string;
  commercial_order_code: string;
  created_at: string;
  expires_at: string;
  reserved_until: string;
  future_cancellation_reason?: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  delivery_method: "delivery" | "pickup";
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  confirmation_date?: string;
  shipping_date?: string;
  delivery_date?: string;
  cancel_date?: string;
  last_status_update?: string;
  whatsapp_opened_date?: string;
  timeline?: string; // Serialización estructurada JSON string de la colección OrderEvent[]
};

/**
 * Mapeador de Infraestructura: Traduce la Entidad pura de Dominio a Registros Relacionales.
 */
export function toSupabase(order: Order): SupabaseOrderRecord {
  return {
    id: order.id,
    commercial_order_code: order.commercialOrderCode,
    created_at: order.createdAt.toISOString(),
    expires_at: order.expiresAt.toISOString(),
    reserved_until: order.reservedUntil.toISOString(),
    future_cancellation_reason: order.futureCancellationReason,
    status: order.status,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    customer_address: order.customer.address,
    delivery_method: order.customer.deliveryMethod,
    items: order.items,
    subtotal: order.subtotal,
    total: order.total,
    currency: order.currency,
    confirmation_date: order.confirmationDate?.toISOString(),
    shipping_date: order.shippingDate?.toISOString(),
    delivery_date: order.deliveryDate?.toISOString(),
    cancel_date: order.cancelDate?.toISOString(),
    last_status_update: order.lastStatusUpdate?.toISOString(),
    whatsapp_opened_date: order.whatsappOpenedDate?.toISOString(),
    timeline: order.timeline && order.timeline.length > 0 ? JSON.stringify(order.timeline) : undefined,
  };
}

/**
 * Mapeador de Infraestructura: Reconstruye de forma segura la Entidad de Dominio con su historial intacto.
 */
export function fromSupabase(record: SupabaseOrderRecord): Order {
  const parsedTimeline: OrderEvent[] = record.timeline
    ? JSON.parse(record.timeline).map((e: any) => ({
      status: e.status as OrderStatus,
      timestamp: new Date(e.timestamp),
      note: e.note,
      origin: e.origin ?? "SYSTEM"
    }))
    : [];

  return new Order({
    id: record.id,
    commercialOrderCode: record.commercial_order_code,
    createdAt: new Date(record.created_at),
    expiresAt: new Date(record.expires_at),
    reservedUntil: new Date(record.reserved_until),
    futureCancellationReason: record.future_cancellation_reason,
    status: record.status,
    customer: {
      name: record.customer_name,
      phone: record.customer_phone,
      address: record.customer_address,
      deliveryMethod: record.delivery_method,
    },
    items: record.items,
    subtotal: record.subtotal,
    total: record.total,
    currency: record.currency,
    confirmationDate: record.confirmation_date ? new Date(record.confirmation_date) : undefined,
    shippingDate: record.shipping_date ? new Date(record.shipping_date) : undefined,
    deliveryDate: record.delivery_date ? new Date(record.delivery_date) : undefined,
    cancelDate: record.cancel_date ? new Date(record.cancel_date) : undefined,
    lastStatusUpdate: record.last_status_update ? new Date(record.last_status_update) : undefined,
    whatsappOpenedDate: record.whatsapp_opened_date ? new Date(record.whatsapp_opened_date) : undefined,
    timeline: parsedTimeline,
  });
}
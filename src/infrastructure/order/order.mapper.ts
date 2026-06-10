// src/infrastructure/order/order.mapper.ts

/**
 * Mapper responsible for converting between the domain `Order` entity
 * and the plain object representation stored in Supabase.
 *
 * Supabase uses snake_case column names, while the domain model
 * uses camelCase. This mapper isolates that transformation.
 */
import { Order } from '@/domain/order/order.entity';
import { OrderStatus, Customer, OrderItem } from '@/domain/order/order.valueObjects';

/**
 * Plain JavaScript object that matches the `orders` table columns in Supabase.
 */
export type SupabaseOrderRecord = {
  id: string;
  created_at: string; // ISO string
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  delivery_method: "delivery" | "pickup";
  items: OrderItem[]; // stored as JSON array
  subtotal: number;
  total: number;
  currency: string;
};

/** Convert a domain Order into a Supabase‑compatible record. */
export function toSupabase(order: Order): SupabaseOrderRecord {
  const { id, createdAt, status, customer, items, subtotal, total, currency } = order;
  return {
    id,
    created_at: createdAt.toISOString(),
    status,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_address: customer.address,
    delivery_method: customer.deliveryMethod,
    items,
    subtotal,
    total,
    currency,
  };
}

/** Convert a Supabase record back into the domain Order entity. */
export function fromSupabase(record: SupabaseOrderRecord): Order {
  const {
    id,
    created_at,
    status,
    customer_name,
    customer_phone,
    customer_address,
    delivery_method,
    items,
    subtotal,
    total,
    currency,
  } = record;
  return new Order({
    id,
    createdAt: new Date(created_at),
    status,
    customer: {
      name: customer_name,
      phone: customer_phone,
      address: customer_address,
      deliveryMethod: delivery_method,
    },
    items,
    subtotal,
    total,
    currency,
  });
}

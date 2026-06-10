// src/infrastructure/order/localOrder.repository.ts
import { Order } from '@/domain/order/order.entity';
import { OrderRepository } from '@/domain/order/order.repository';
import { serenaLogger } from '@/core/logger';

/**
 * Offline repository that persists orders to localStorage.
 * No Supabase involvement.
 */
export class LocalOrderRepository implements OrderRepository {
  private readonly storageKey = 'serena_orders_offline';

  async save(order: Order): Promise<Order> {
    try {
      const existingRaw = typeof window !== 'undefined' ? localStorage.getItem(this.storageKey) : null;
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.push(order);
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(existing));
      }
      serenaLogger.info('Order saved to localStorage (offline)', { orderId: order.id });
    } catch (e) {
      serenaLogger.error('Failed to persist order locally', e as Error);
    }
    return order;
  }
}

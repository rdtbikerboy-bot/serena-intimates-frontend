// src/infrastructure/order/localOrder.repository.ts
import { Order } from '@/domain/order/order.entity';
import { OrderRepository } from '@/domain/order/order.repository';
import { OrderStatus } from '@/domain/order/order.valueObjects';
import { serenaLogger } from '@/core/logger';
import { OrderReconstructor } from '@/infrastructure/order/reconstruction/orderReconstructor';

/**
 * Offline repository that persists orders to localStorage.
 * No Supabase involvement.
 */
export class LocalOrderRepository implements OrderRepository {
  private readonly storageKey = 'serena_orders_offline';

  async insert(order: Order): Promise<Order> {
    try {
      const existingRaw = typeof window !== 'undefined' ? localStorage.getItem(this.storageKey) : null;
      const existing: Order[] = existingRaw ? JSON.parse(existingRaw) : [];
      existing.push(order);
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(existing));
      }
      serenaLogger.info('Order inserted to localStorage (offline)', { orderId: order.id });
    } catch (e) {
      serenaLogger.error('Failed to insert order locally', e as Error);
    }
    return order;
  }
  // Deprecated save method removed

  private async loadAll(): Promise<Order[]> {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(this.storageKey);
    const plain = raw ? JSON.parse(raw) : [];
    
    // Use reconstructor to hydrate domain entities
    const reconstructor = new OrderReconstructor();
    return plain.map((obj: any) => reconstructor.fromPlainObject(obj));
  }
  async update(order: Order): Promise<Order> {
    const existingRaw = typeof window !== 'undefined' ? localStorage.getItem(this.storageKey) : null;
    const existing: Order[] = existingRaw ? JSON.parse(existingRaw) : [];
    const index = existing.findIndex(o => o.id === order.id);
    if (index === -1) {
      throw new Error(`Order ${order.id} not found`);
    }
    existing[index] = order;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    }
    serenaLogger.info('Order updated in localStorage (offline)', { orderId: order.id });
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const all = await this.loadAll();
    return all.find(o => o.id === id) ?? null;
  }

  async findByCommercialCode(code: string): Promise<Order | null> {
    const all = await this.loadAll();
    return all.find(o => o.commercialOrderCode === code) ?? null;
  }

  async list(): Promise<Order[]> {
    return this.loadAll();
  }

  async listByStatus(status: OrderStatus): Promise<Order[]> {
    const all = await this.loadAll();
    return all.filter(o => o.status === status);
  }


}

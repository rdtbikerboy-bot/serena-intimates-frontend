// src/infrastructure/order/supabaseOrder.repository.ts
import { supabase } from '@/services/supabase';
import { Order } from '@/domain/order/order.entity';
import { OrderRepository } from '@/domain/order/order.repository';
import { serenaLogger } from '@/core/logger';
import { toSupabase, fromSupabase } from './order.mapper';
import { OrderStatus } from '@/domain/order/order.valueObjects';

/**
 * Infrastructure implementation that persists an Order to Supabase.
 * No fallback, no business logic – just a raw insert.
 */
export class SupabaseOrderRepository implements OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      serenaLogger.error('SupabaseOrderRepository findById error', error);
      return null;
    }
    if (!data) return null;
    return fromSupabase(data as any);
  }

  async findByCommercialCode(code: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('commercial_order_code', code)
      .single();
    if (error) {
      serenaLogger.error('SupabaseOrderRepository findByCommercialCode error', error);
      return null;
    }
    if (!data) return null;
    return fromSupabase(data as any);
  }

  async list(): Promise<Order[]> {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      serenaLogger.error('SupabaseOrderRepository list error', error);
      return [];
    }
    return (data as any[]).map((rec) => fromSupabase(rec));
  }

  async listByStatus(status: OrderStatus): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status);
    if (error) {
      serenaLogger.error('SupabaseOrderRepository listByStatus error', error);
      return [];
    }
    return (data as any[]).map((rec) => fromSupabase(rec));
  }

  async insert(order: Order): Promise<Order> {
    // Map domain Order to Supabase compatible record
    const supabaseRecord = toSupabase(order);
    const { error } = await supabase
      .from('orders')
      .insert([supabaseRecord]);
    if (error) {
      serenaLogger.error('SupabaseOrderRepository failed to insert order', error);
      throw error;
    }
    return order;
  }

  async update(order: Order): Promise<Order> {
    const supabaseRecord = toSupabase(order);
    const { error } = await supabase
      .from('orders')
      .update(supabaseRecord)
      .eq('id', order.id);
    if (error) {
      serenaLogger.error(`SupabaseOrderRepository failed to update order ${order.id}`, error);
      throw error;
    }
    return order;
  }
}

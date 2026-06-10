// src/infrastructure/order/supabaseOrder.repository.ts
import { supabase } from '@/services/supabase';
import { Order } from '@/domain/order/order.entity';
import { OrderRepository } from '@/domain/order/order.repository';
import { serenaLogger } from '@/core/logger';
import { toSupabase } from './order.mapper';

/**
 * Infrastructure implementation that persists an Order to Supabase.
 * No fallback, no business logic – just a raw insert.
 */
export class SupabaseOrderRepository implements OrderRepository {
  async save(order: Order): Promise<Order> {
    // Map domain Order to Supabase compatible record
    const supabaseRecord = toSupabase(order);
    const { error } = await supabase
      .from('orders')
      .insert([supabaseRecord]);
      
    if (error) {
      serenaLogger.error('SupabaseOrderRepository failed to insert order', error);
      throw error;
    }
    
    // Return original order as RLS policies prevent selecting for 'anon' role
    return order;
  }
}

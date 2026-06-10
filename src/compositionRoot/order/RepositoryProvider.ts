// src/compositionRoot/order/RepositoryProvider.ts
import { OrderRepository } from '@/domain/order/order.repository';
import { SupabaseOrderRepository } from '@/infrastructure/order/supabaseOrder.repository';
import { LocalOrderRepository } from '@/infrastructure/order/localOrder.repository';
import { isSupabaseConfigured } from '@/services/supabase';

/**
 * Composition‑root factory that decides which concrete OrderRepository to use.
 * It encapsulates the only place where the infrastructure decision is made.
 */
export function provideOrderRepository(): OrderRepository {
  return isSupabaseConfigured()
    ? new SupabaseOrderRepository()
    : new LocalOrderRepository();
}

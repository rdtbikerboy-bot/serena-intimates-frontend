// src/application/order/createOrder.usecase.ts
import { Order } from '@/domain/order/order.entity';
import { OrderRepository } from '@/domain/order/order.repository';
// Removed direct repository imports – repository will be injected via constructor
import { serenaLogger } from '@/core/logger';

/**
 * Application use‑case that decides which repository to use based on Supabase configuration.
 * No business logic, no fallback – the repository itself encapsulates its storage strategy.
 */
export class CreateOrderUseCase {
  constructor(private readonly repository: OrderRepository) {
    serenaLogger.info('CreateOrderUseCase initialized with', {
      repository: this.repository.constructor.name,
    });
  }

  /**
   * Executes the use‑case – simply delegates to the selected repository.
   */
  async execute(order: Order): Promise<Order> {
    return await this.repository.save(order);
  }
}

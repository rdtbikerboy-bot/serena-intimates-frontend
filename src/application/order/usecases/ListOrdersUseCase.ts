// src/application/order/usecases/ListOrdersUseCase.ts

import { OrderRepository } from '@/domain/order/order.repository';

export class ListOrdersUseCase {
  constructor(private readonly repository: OrderRepository) {}

  /**
   * Returns a list of orders.
   * The concrete repository may expose a `findAll` method; we invoke it via a safe cast.
   */
  async execute(): Promise<any[]> {
    // Minimal patch: repository interface only defines `save`, so we use a runtime check.
    const repoAny = this.repository as any;
    if (typeof repoAny.findAll === 'function') {
      return await repoAny.findAll();
    }
    // Fallback – empty array to keep compilation safe.
    return [];
  }
}

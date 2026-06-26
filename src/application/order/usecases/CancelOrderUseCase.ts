// src/application/order/usecases/CancelOrderUseCase.ts
import { OrderRepository } from '@/domain/order/order.repository';
import { Order } from '@/domain/order/order.entity';
import { OrderStatus } from '@/domain/order/order.valueObjects';
import { serenaLogger } from '@/core/logger';

/** Use case to cancel an order */
export class CancelOrderUseCase {
  constructor(private readonly repository: OrderRepository) {}

  async execute(orderId: string, note?: string): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    order.transitionTo(OrderStatus.Cancelled, note, "ADMIN");
    serenaLogger.info('Order cancelled', { orderId });
    return await this.repository.update(order);
  }
}

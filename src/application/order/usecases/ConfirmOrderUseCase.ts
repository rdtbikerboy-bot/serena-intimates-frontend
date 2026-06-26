// src/application/order/usecases/ConfirmOrderUseCase.ts
import { OrderRepository } from '@/domain/order/order.repository';
import { Order } from '@/domain/order/order.entity';
import { OrderStatus } from '@/domain/order/order.valueObjects';
import { serenaLogger } from '@/core/logger';

/** Use case to confirm an order */
export class ConfirmOrderUseCase {
  constructor(private readonly repository: OrderRepository) {}

  async execute(orderId: string, note?: string): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    order.transitionTo(OrderStatus.Confirmed, note, "ADMIN");
    serenaLogger.info('Order confirmed', { orderId });
    return await this.repository.update(order);
  }
}

// src/application/order/usecases/ShipOrderUseCase.ts
import { OrderRepository } from '@/domain/order/order.repository';
import { Order } from '@/domain/order/order.entity';
import { OrderStatus } from '@/domain/order/order.valueObjects';
import { serenaLogger } from '@/core/logger';

/** Use case to ship an order */
export class ShipOrderUseCase {
  constructor(private readonly repository: OrderRepository) {}

  async execute(orderId: string, note?: string): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    order.transitionTo(OrderStatus.Shipped, note, "ADMIN");
    serenaLogger.info('Order shipped', { orderId });
    return await this.repository.update(order);
  }
}

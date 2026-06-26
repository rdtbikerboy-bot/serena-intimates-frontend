// src/application/order/usecases/ReadyForPickupUseCase.ts
import { OrderRepository } from '@/domain/order/order.repository';
import { Order } from '@/domain/order/order.entity';
import { OrderStatus } from '@/domain/order/order.valueObjects';
import { serenaLogger } from '@/core/logger';

/** Use case to mark order as ready for pickup */
export class ReadyForPickupUseCase {
  constructor(private readonly repository: OrderRepository) {}

  async execute(orderId: string, note?: string): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    order.transitionTo(OrderStatus.ReadyForPickup, note, "ADMIN");
    serenaLogger.info('Order ready for pickup', { orderId });
    return await this.repository.update(order);
  }
}

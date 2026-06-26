// src/services/orderService.ts
"use client";

import { CreateOrderUseCase } from "@/application/order/createOrder.usecase";
import { CreateOrderCommand } from "@/application/order/createOrder.command";
import { serenaLogger } from "@/core/logger";
import { provideOrderRepository } from "@/compositionRoot/order/RepositoryProvider";
import { Order } from "@/domain/order/order.entity";

/**
 * Thin adapter – maps raw payload to domain Order via use‑case.
 */
export async function createOrder(payload: CreateOrderCommand): Promise<Order> {
  try {
    const repository = provideOrderRepository();
    const useCase = new CreateOrderUseCase(repository);
    return await useCase.execute(payload);
  } catch (err) {
    serenaLogger.error("CreateOrderUseCase failed", err as Error);
    throw err;
  }
}

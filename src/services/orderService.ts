// src/services/orderService.ts
"use client";

import { Order } from "@/domain/order/order.entity";
import { OrderStatus, Customer, OrderItem } from "@/domain/order/order.valueObjects";
import { CreateOrderUseCase } from "@/application/order/createOrder.usecase";
import { serenaLogger } from "@/core/logger";
import { provideOrderRepository } from "@/compositionRoot/order/RepositoryProvider";

/**
 * Thin adapter – maps raw payload to domain Order and delegates to the use‑case.
 * No persistence logic, no fallback, no ID generation elsewhere.
 */
export async function createOrder(payload: any): Promise<any> {
  // Minimal defensive defaults (validation is handled elsewhere)
  const id = crypto.randomUUID();
  const createdAt = new Date();

  const customer: Customer = {
    name: payload?.customer?.name ?? "",
    phone: payload?.customer?.phone ?? "",
    address: payload?.customer?.address,
    deliveryMethod: payload?.customer?.deliveryMethod ?? "delivery",
  };

  const items: OrderItem[] = payload?.items ?? [];

  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const total = subtotal;
  const currency = "ARS";
  const order = new Order({
    id,
    createdAt,
    status: OrderStatus.PendingLocal,
    customer,
    items,
    subtotal,
    total,
    currency,
  });

  try {
    const repository = provideOrderRepository();
    const useCase = new CreateOrderUseCase(repository);
    return await useCase.execute(order);
  } catch (err) {
    serenaLogger.error("CreateOrderUseCase failed", err as Error);
    throw err;
  }
}

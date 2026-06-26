// src/application/order/createOrder.usecase.ts

import { Order } from '@/domain/order/order.entity';
import { OrderRepository } from '@/domain/order/order.repository';
import { OrderStatus, Customer, OrderItem } from '@/domain/order/order.valueObjects';
import { generateOrderCode } from '@/domain/order/orderCodeGenerator';
import { serenaLogger } from '@/core/logger';
import { validateNewOrder } from '@/domain/order/order.validator';
import { CreateOrderCommand } from '@/application/order/createOrder.command';

/**
 * Caso de Uso de Aplicación: Orquestador inmutable para la creación de pedidos.
 * Procesa la lógica comercial primaria, valida restricciones y delega la persistencia al repositorio.
 */
export class CreateOrderUseCase {
  constructor(private readonly repository: OrderRepository) {
    serenaLogger.info('CreateOrderUseCase inicializado con éxito', {
      repository: this.repository.constructor.name,
    });
  }

  async execute(payload: CreateOrderCommand): Promise<Order> {
    const id = crypto.randomUUID();
    const createdAt = new Date();

    const commercialOrderCode = generateOrderCode(createdAt);

    // Regla de negocio: Expiración estándar y reserva de inventario de 24 horas hábiles
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const reservedUntil = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    const customer: Customer = {
      name: payload.customer.name,
      phone: payload.customer.phone,
      address: payload.customer.address,
      deliveryMethod: payload.customer.deliveryMethod as "delivery" | "pickup",
    };

    const items: OrderItem[] = payload.items ?? [];
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal; // Expandible en fases posteriores para lógicas de cupones o envíos (Fase 2 / Fase 8)
    const currency = 'ARS';

    // Instanciación limpia delegando la autogestión de auditoría a la Entidad
    const order = new Order({
      id,
      commercialOrderCode,
      createdAt,
      expiresAt,
      reservedUntil,
      status: OrderStatus.PendingWhatsapp,
      customer,
      items,
      subtotal,
      total,
      currency,
    });

    // Validación del estado invariante del Dominio
    validateNewOrder(order);

    // Persistencia inmutable en Infraestructura
    const savedOrder = await this.repository.insert(order);

    // TODO: En Fase 15 / Fase 5 se inyectará aquí el Event Dispatcher para despachar los eventos asíncronos acumulados:
    // const events = savedOrder.getDomainEvents();
    // this.eventDispatcher.dispatch(events);
    // savedOrder.clearDomainEvents();

    return savedOrder;
  }
}
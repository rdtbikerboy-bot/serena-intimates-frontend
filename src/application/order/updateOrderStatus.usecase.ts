// src/application/order/updateOrderStatus.usecase.ts

import { Order } from '@/domain/order/order.entity';
import { OrderRepository } from '@/domain/order/order.repository';
import { OrderStatus } from '@/domain/order/order.valueObjects';
import { serenaLogger } from '@/core/logger';

/**
 * Caso de Uso de Aplicación: Actualizador de Estados de Órdenes (Uso Administrativo / Automatizaciones).
 * Invoca las reglas de transición inmutables de la entidad y las persiste en la infraestructura.
 */
export class UpdateOrderStatusUseCase {
  constructor(private readonly repository: OrderRepository) {
    serenaLogger.info('UpdateOrderStatusUseCase inicializado', {
      repository: this.repository.constructor.name,
    });
  }

  /**
   * Ejecuta de forma segura la transición de estado de una orden.
   * @param order Entidad de dominio Order existente.
   * @param newStatus Nuevo estado comercial objetivo.
   * @param note Comentario aclaratorio o justificación de auditoría.
   */
  async execute(order: Order, newStatus: OrderStatus, note?: string): Promise<Order> {
    try {
      // Delegación al comportamiento puro de dominio y registro de origen 'ADMIN'
      order.transitionTo(newStatus, note, 'ADMIN');

      serenaLogger.info('Estado de orden actualizado con éxito en Dominio', {
        orderId: order.id,
        newStatus,
        note,
      });

      return await this.repository.update(order);
    } catch (error) {
      serenaLogger.error('Fallo crítico al actualizar el estado de la orden', {
        error,
        orderId: order.id
      });
      throw error;
    }
  }
}
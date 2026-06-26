// src/application/order/usecases/ListOrdersUseCase.ts

import { OrderRepository } from '@/domain/order/order.repository';
import { Order } from '@/domain/order/order.entity';

/**
 * Caso de Uso de Aplicación: Recuperación integral del historial de órdenes.
 * Garantiza contratos fuertemente tipados eliminando casteos de tipo 'any'.
 */
export class ListOrdersUseCase {
  constructor(private readonly repository: OrderRepository) { }

  async execute(): Promise<Order[]> {
    // Nota: El contrato en order.repository debe exponer `findAll()` oficialmente para evitar deuda técnica.
    return await this.repository.findAll();
  }
}
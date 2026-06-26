// src/domain/order/order.repository.ts

import { Order } from "./order.entity";

/**
 * Contrato Oficial del Dominio para la Persistencia de Pedidos.
 * Define los comportamientos permitidos sin acoplarse a tecnologías específicas.
 */
export interface OrderRepository {
  insert(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;

  /**
   * Recupera la colección completa de órdenes registradas en el sistema (Backoffice/Historial).
   */
  findAll(): Promise<Order[]>;
}
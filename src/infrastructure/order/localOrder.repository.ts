// src/infrastructure/order/localOrder.repository.ts

import { OrderRepository } from "@/domain/order/order.repository";
import { Order } from "@/domain/order/order.entity";
import { fromSupabase, toSupabase } from "./order.mapper";

/**
 * Repositorio de Infraestructura Local (Fallback/Mocks de almacenamiento).
 * Almacena las órdenes temporalmente en memoria o localStorage para pruebas ágiles.
 * Implementa estrictamente el contrato OrderRepository para respetar SOLID.
 */
export class LocalOrderRepository implements OrderRepository {
  private memoryStorage: Map<string, any> = new Map();

  async insert(order: Order): Promise<Order> {
    const record = toSupabase(order);
    this.memoryStorage.set(order.id, record);
    if (typeof window !== "undefined") {
      localStorage.setItem(`serena_order_${order.id}`, JSON.stringify(record));
    }
    return order;
  }

  async update(order: Order): Promise<Order> {
    const record = toSupabase(order);
    this.memoryStorage.set(order.id, record);
    if (typeof window !== "undefined") {
      localStorage.setItem(`serena_order_${order.id}`, JSON.stringify(record));
    }
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    let record = this.memoryStorage.get(id);
    if (!record && typeof window !== "undefined") {
      const persisted = localStorage.getItem(`serena_order_${id}`);
      if (persisted) record = JSON.parse(persisted);
    }
    return record ? fromSupabase(record) : null;
  }

  /**
   * Satisface el contrato unificado recuperando todos los registros locales persistidos.
   */
  async findAll(): Promise<Order[]> {
    const orders: Order[] = [];

    // Recuperar elementos en memoria volátil
    for (const record of this.memoryStorage.values()) {
      orders.push(fromSupabase(record));
    }

    // Si la memoria está vacía, intentar hidratar desde localStorage del navegador
    if (orders.length === 0 && typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("serena_order_")) {
          const persisted = localStorage.getItem(key);
          if (persisted) {
            orders.push(fromSupabase(JSON.parse(persisted)));
          }
        }
      }
    }

    // Retornar ordenados por fecha de creación (los más recientes primero)
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
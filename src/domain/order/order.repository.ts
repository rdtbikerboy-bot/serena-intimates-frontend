// src/domain/order/order.repository.ts
import { Order } from '@/domain/order/order.entity';
import { OrderStatus } from '@/domain/order/order.valueObjects';

export interface OrderRepository {
  /**
   * Persists a newly created Order.
   */
  insert(order: Order): Promise<Order>;

  /**
   * Updates an existing Order. Must throw if the Order does not exist.
   */
  update(order: Order): Promise<Order>;

  /** Find an order by its UUID */
  findById(id: string): Promise<Order | null>;

  /** Find an order by its commercial code */
  findByCommercialCode(code: string): Promise<Order | null>;

  /** List all orders */
  list(): Promise<Order[]>;

  /** List orders filtered by status */
  listByStatus(status: OrderStatus): Promise<Order[]>;
}

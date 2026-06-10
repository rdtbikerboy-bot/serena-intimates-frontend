// src/domain/order/order.repository.ts
export interface OrderRepository {
  /**
   * Persists an Order DB row and returns the stored row (including any DB‑generated fields).
   */
  save(order: any): Promise<any>;
}

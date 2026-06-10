// src/domain/order/order.valueObjects.ts

/**
 * Enum representing the lifecycle status of an Order.
 */
export enum OrderStatus {
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
  PendingLocal = "pending_local",
}

/** Customer value object used inside an Order entity */
export interface Customer {
  name: string;
  phone: string;
  address?: string;
  deliveryMethod: "delivery" | "pickup";
}

/** Individual item inside an Order */
export interface OrderItem {
  id: string; // product id
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  quantity: number;
}

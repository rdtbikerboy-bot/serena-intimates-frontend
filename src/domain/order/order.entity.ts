// src/domain/order/order.entity.ts
import { OrderStatus, Customer, OrderItem } from "./order.valueObjects";

/**
 * Pure domain entity – no knowledge of Supabase, localStorage, or UI.
 */
export class Order {
  public readonly id: string; // UUID generated at creation
  public readonly createdAt: Date;
  public readonly status: OrderStatus;
  public readonly customer: Customer;
  public readonly items: OrderItem[];
  public readonly subtotal: number;
  public readonly total: number;
  public readonly currency: string;

  constructor(params: {
    id: string;
    createdAt: Date;
    status: OrderStatus;
    customer: Customer;
    items: OrderItem[];
    subtotal: number;
    total: number;
    currency: string;
  }) {
    this.id = params.id;
    this.createdAt = params.createdAt;
    this.status = params.status;
    this.customer = params.customer;
    this.items = params.items;
    this.subtotal = params.subtotal;
    this.total = params.total;
    this.currency = params.currency;
  }
}

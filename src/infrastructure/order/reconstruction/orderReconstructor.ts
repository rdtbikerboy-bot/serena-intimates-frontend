// src/infrastructure/order/reconstruction/orderReconstructor.ts

/**
 * Generic reconstructor for Order aggregates.
 * It lives in the infrastructure layer so it can depend on domain types
 * but the domain layer never imports anything from here.
 * The class is deliberately simple and deterministic – no logging, no side‑effects.
 */
import { Order } from '@/domain/order/order.entity';
import { OrderEvent } from '@/domain/order/order.valueObjects';

export class OrderReconstructor {
  /** Reconstruct an Order from a Supabase record (snake_case). */
  fromSupabase(record: any): Order {
    // Reuse the existing mapper logic for consistency.
    // The mapper already converts timestamps to Date objects.
    // To avoid a direct import cycle we delegate to the mapper here.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { fromSupabase } = require('../order.mapper');
    return fromSupabase(record);
  }

  /** Reconstruct an Order from a plain object (e.g., stored in localStorage). */
  fromPlainObject(obj: any): Order {
    const timeline: OrderEvent[] = (obj.timeline ?? []).map((e: any) => ({
      status: e.status,
      timestamp: new Date(e.timestamp),
      note: e.note,
    }));
    return new Order({
      id: obj.id,
      commercialOrderCode: obj.commercialOrderCode,
      createdAt: new Date(obj.createdAt),
      expiresAt: new Date(obj.expiresAt),
      reservedUntil: new Date(obj.reservedUntil),
      futureCancellationReason: obj.futureCancellationReason,
      status: obj.status,
      customer: obj.customer,
      items: obj.items,
      subtotal: obj.subtotal,
      total: obj.total,
      currency: obj.currency,
      confirmationDate: obj.confirmationDate ? new Date(obj.confirmationDate) : undefined,
      shippingDate: obj.shippingDate ? new Date(obj.shippingDate) : undefined,
      deliveryDate: obj.deliveryDate ? new Date(obj.deliveryDate) : undefined,
      cancelDate: obj.cancelDate ? new Date(obj.cancelDate) : undefined,
      whatsappOpenedDate: obj.whatsappOpenedDate ? new Date(obj.whatsappOpenedDate) : undefined,
      lastStatusUpdate: obj.lastStatusUpdate ? new Date(obj.lastStatusUpdate) : undefined,
      timeline,
      paymentInfo: obj.paymentInfo,
      deliveryInfo: obj.deliveryInfo,
      stockReservation: obj.stockReservation,
      metadata: obj.metadata,
      commercialInfo: obj.commercialInfo,
    });
  }
}

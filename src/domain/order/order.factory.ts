import { Order } from '@/domain/order/order.entity';
import { OrderStatus, Customer, OrderItem } from '@/domain/order/order.valueObjects';
import { generateOrderCode } from '@/domain/order/orderCodeGenerator';
import { CreateOrderCommand } from '@/application/order/createOrder.command';

/**
 * Factory responsible for creating a fully-initialized Order aggregate.
 * It centralises all domain‑level generation logic (ids, dates, timeline, etc.).
 */
export class OrderFactory {
  static create(payload: CreateOrderCommand): Order {
    // 1️⃣ Generate identifiers and timestamps
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const commercialOrderCode = generateOrderCode(createdAt);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const reservedUntil = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    // 2️⃣ Build customer value object
    const customer: Customer = {
      name: payload.customer.name,
      phone: payload.customer.phone,
      address: payload.customer.address,
      deliveryMethod: payload.customer.deliveryMethod as 'delivery' | 'pickup',
    };

    // 3️⃣ Build items and pricing
    const items: OrderItem[] = payload.items ?? [];
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal;
    const currency = 'ARS';

    // 4️⃣ Construct the Order entity with its initial status
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

    // 5️⃣ Initialise timeline and lastStatusUpdate (legacy behaviour preserved)
    const initialEvent = {
      status: order.status,
      timestamp: new Date(),
      note: 'Order created with status PendingWhatsapp',
    } as const;
    order.timeline = [initialEvent];
    order.lastStatusUpdate = initialEvent.timestamp;

    return order;
  }
}

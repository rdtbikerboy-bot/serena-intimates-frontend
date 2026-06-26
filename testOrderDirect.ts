// testOrderDirect.ts
import { SupabaseOrderRepository } from "./src/infrastructure/order/supabaseOrder.repository";
import { Order } from "./src/domain/order/order.entity";
import { OrderStatus, Customer, OrderItem } from "./src/domain/order/order.valueObjects";
import { toSupabase, fromSupabase } from "./src/infrastructure/order/order.mapper";

(async () => {
  const payload = {
    customer: {
      name: "Juan Pérez",
      phone: "+54 9 11 1234-5678",
      address: "Calle Falsa 123",
      deliveryMethod: "delivery" as const,
    },
    items: [
      { id: "p1", title: "Camiseta", imageUrl: "", size: "M", price: 1200, quantity: 2 },
      { id: "p2", title: "Pantalón", imageUrl: "", size: "L", price: 2500, quantity: 1 },
    ],
  };

  const customer: Customer = payload.customer;
  const items: OrderItem[] = payload.items;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;
  const currency = "ARS";

  const createdAt = new Date();
  const year = createdAt.getFullYear().toString().slice(-2);
  const month = (createdAt.getMonth() + 1).toString().padStart(2, "0");
  const day = createdAt.getDate().toString().padStart(2, "0");
  const randomId = Math.floor(Math.random() * 90000) + 10000;
  const commercialOrderCode = `SER-${year}${month}${day}-${randomId}`;

  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const reservedUntil = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

  // Inicialización corregida bajo el tipo unificado PENDING_WHATSAPP
  const order = new Order({
    id: crypto.randomUUID(),
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

  const repo = new SupabaseOrderRepository();
  try {
    const saved = await repo.insert(order);
    console.log("✅ Saved order (domain object):", saved);

    // Verificación del ciclo completo de mapeo
    const record = toSupabase(saved);
    console.log("💾 Supabase record inserted:", record);

    const recreated = fromSupabase(record);
    console.log("🔁 Recreated domain from record:", recreated);
  } catch (e) {
    console.error("❌ Error during save:", e);
  }
})();
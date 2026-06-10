// testOrderDirect.ts – end‑to‑end verification without TS‑path aliases
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

  const order = new Order({
    id: crypto.randomUUID(),
    createdAt: new Date(),
    status: OrderStatus.PendingLocal,
    customer,
    items,
    subtotal,
    total,
    currency,
  });

  const repo = new SupabaseOrderRepository();
  try {
    const saved = await repo.save(order);
    console.log("✅ Saved order (domain object):", saved);
    // Verify mapping round‑trip
    const record = toSupabase(saved);
    console.log("💾 Supabase record inserted:", record);
    const recreated = fromSupabase(record);
    console.log("🔁 Recreated domain from record:", recreated);
  } catch (e) {
    console.error("❌ Error during save:", e);
  }
})();

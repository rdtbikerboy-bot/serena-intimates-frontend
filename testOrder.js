// testOrder.js – end‑to‑end verification script
import { createOrder } from "./src/services/orderService";

(async () => {
  const payload = {
    customer: {
      name: "Juan Pérez",
      phone: "+54 9 11 1234-5678",
      address: "Calle Falsa 123",
      deliveryMethod: "delivery",
    },
    items: [
      { id: "p1", title: "Camiseta", imageUrl: "", size: "M", price: 1200, quantity: 2 },
      { id: "p2", title: "Pantalón", imageUrl: "", size: "L", price: 2500, quantity: 1 },
    ],
  };
  try {
    const result = await createOrder(payload);
    console.log("✅ Order saved:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("❌ Error saving order", e);
  }
})();

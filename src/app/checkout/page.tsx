import React, { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";
import { createOrder } from "@/services/orderService";

export default function CheckoutPage() {
  const cartItems = useCartStore((state) => state.cartItems);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("delivery"); // "delivery" or "pickup"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || (deliveryMethod === "delivery" && !address)) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
    const order = await createOrder({
      items: cartItems.map((i) => ({
        id: i.id,
        title: i.title,
        imageUrl: i.imageUrl,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
      })),
      customer: { name, phone, address, deliveryMethod },
    });
    // Post‑checkout actions
    clearCart();
    setCartOpen(false);
    router.replace(`/order-success?id=${order.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resumen de Compra</h1>
      <ul className="space-y-2 mb-4">
        {cartItems.map((item) => (
          <li key={`${item.id}-${item.size}`} className="flex justify-between items-center">
            <span>{item.title} (Talle {item.size}) x {item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString("es-AR")}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-bold mb-4">
        <span>Subtotal</span>
        <span>${subtotal.toLocaleString("es-AR")}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Nombre completo</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-2 py-1" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">Teléfono</label>
          <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded px-2 py-1" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="deliveryMethod">Método de entrega</label>
          <select id="deliveryMethod" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="delivery">Envío</option>
            <option value="pickup">Retiro</option>
          </select>
        </div>
        {deliveryMethod === "delivery" && (
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="address">Dirección de entrega</label>
            <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded px-2 py-1" rows={3} required />
          </div>
        )}
        <button type="submit" className="w-full bg-serena-gold text-white py-2 rounded-2xl hover:opacity-90 transition-colors">
          Confirmar pedido
        </button>
      </form>
    </div>
  );
}

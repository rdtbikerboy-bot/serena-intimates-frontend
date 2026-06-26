"use client";

// SSR Guard: client-only component that accesses Zustand stores. Must not be imported by Server Components.

import React, { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";
import { createOrder } from "@/services/orderService";

import { buildWhatsAppMessage } from "@/services/whatsappMessageBuilder";

export default function CheckoutClient() {
  const cartItems = useCartStore((state) => state.cartItems);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery"); // "delivery" or "pickup"
  const [paymentMethod, setPaymentMethod] = useState("whatsapp");

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
    
    // WhatsApp redirect
    const msg = buildWhatsAppMessage({
      orderId: order.commercialOrderCode,
      name,
      phone,
      deliveryMethod,
      address,
      items: cartItems,
      total: subtotal,
    });
    const whatsappUrl = `https://wa.me/543874022233?text=${encodeURIComponent(msg)}`;
    
    // Fallback: save to session storage for the success page
    sessionStorage.setItem("lastWaUrl", whatsappUrl);
    
    // Attempt to open in a new tab (might be blocked by popup blockers after async)
    const newWindow = window.open(whatsappUrl, "_blank");

    if (newWindow) {
      // Clear cart only if WhatsApp opened successfully
      clearCart();
    }

    // Post‑checkout actions
    setCartOpen(false);
    router.replace(`/order-success?id=${order.commercialOrderCode}`);
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
          <select id="deliveryMethod" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as "delivery" | "pickup")} className="w-full border rounded px-2 py-1">
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
        
        <div className="space-y-2 pt-2 border-t mt-4 border-gray-200">
          <label className="block text-sm font-medium">Continuar mediante:</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="paymentMethod" value="whatsapp" checked={paymentMethod === "whatsapp"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-serena-gold accent-serena-gold" />
              <span>WhatsApp</span>
            </label>
            <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
              <input type="radio" name="paymentMethod" value="online" disabled className="w-4 h-4 text-serena-gold accent-serena-gold" />
              <span>Pago Online (Próximamente)</span>
            </label>
          </div>
        </div>

        <button type="submit" className="w-full bg-serena-gold text-white py-3 mt-4 rounded-2xl hover:opacity-90 transition-colors font-bold uppercase tracking-wider">
          Confirmar pedido
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  id: string; // unique ID generated on addition
  productId: string;
  title: string;
  size: string;
  price: number;
  imageUrl: string;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar estado inicial desde localStorage en cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_cart");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing cart", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    if (typeof window !== "undefined") {
      localStorage.setItem("serena_cart", JSON.stringify(newItems));
    }
  };

  const addItem = (product: { id: string; title: string; imageUrl: string }, size: string, price: number) => {
    const newItem: CartItem = {
      id: `${product.id}-${size}-${Date.now()}`,
      productId: product.id,
      title: product.title,
      size: size,
      price: price,
      imageUrl: product.imageUrl
    };
    const updated = [...items, newItem];
    saveCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getSubtotal = () => {
    return items.reduce((acc, item) => acc + item.price, 0);
  };

  // Formatea y abre el checkout por WhatsApp
  const checkoutViaWhatsApp = () => {
    const phone = "543874022233"; // Teléfono oficial Serena
    const subtotal = getSubtotal();
    
    if (items.length === 0) return;

    let orderDetails = "";
    items.forEach((item, index) => {
      orderDetails += `${index + 1}. 🩰 *${item.title}* (Talle: ${item.size}) - $${item.price.toLocaleString("es-AR")}\n`;
    });

    const message = `✨ ¡Hola Serena Intimates! Me encantó el look que armé en la plataforma:\n\n${orderDetails}\n💰 *Total Estimado:* $${subtotal.toLocaleString("es-AR")} ARS\n📦 *Requisito:* Solicito el Envío 100% Discreto (Empaque neutro)\n📍 *Ubicación:* Salta, Argentina\n\n¿Me confirman disponibilidad para coordinar el envío de mis prendas? ¡Muchas gracias! ✨`;
    
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
  };

  return {
    items,
    isLoaded,
    addItem,
    removeItem,
    clearCart,
    getSubtotal,
    checkoutViaWhatsApp
  };
}

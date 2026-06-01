// src/components/ui-premium/CartDrawer.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/core/types";

/**
 * CartDrawer component – premium drawer UI for the shopping cart.
 * Mirrors the verified ProductDrawer layout and styling conventions.
 */
export function CartDrawer() {
  // UI store – drawer open state
  const isCartOpen = useUIStore((state) => state.isCartOpen);
  const setCartOpen = useUIStore((state) => state.setCartOpen);

  // Cart store – items and actions
  const { cartItems, removeItem, clearCart } = useCartStore((state) => ({
    cartItems: state.cartItems,
    removeItem: state.removeItem,
    clearCart: state.clearCart,
  }));

  const subtotal = useCartStore(state => state.getSubtotal());

  // Close drawer helper
  const closeDrawer = () => setCartOpen(false);

  // Empty state UI
  if (!isCartOpen) return null;
  if (cartItems.length === 0) {
    return (
      <div className="absolute inset-x-0 bottom-0 h-[750px] bg-serena-cream rounded-t-[30px] shadow-[0_-15px_40px_rgba(26,21,18,0.15)] border-t border-serena-blush/30 z-40 flex flex-col translate-y-0">
        {/* Header */}
        <div className="w-full flex justify-between items-center px-6 py-5 border-b border-serena-blush/20 shrink-0">
          <span className="text-xs font-bold tracking-widest text-serena-gold uppercase font-ui">Tu Carrito</span>
          <button onClick={closeDrawer} className="w-8 h-8 flex items-center justify-center bg-serena-charcoal/5 rounded-full text-serena-charcoal hover:bg-serena-charcoal/10 transition-colors">
            ✕
          </button>
        </div>
          {/* Empty message */}
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <p className="text-serena-charcoal/70 mb-4">El carrito está vacío.</p>
            <button onClick={closeDrawer} className="bg-serena-gold text-white text-xs font-bold py-2 px-4 rounded-2xl hover:opacity-90 transition-colors">
              Cerrar
            </button>
          </div>
      </div>
    );
  }

  // Filled state UI
  return (
    <div className="absolute inset-x-0 bottom-0 h-[750px] bg-serena-cream rounded-t-[30px] shadow-[0_-15px_40px_rgba(26,21,18,0.15)] border-t border-serena-blush/30 z-40 flex flex-col translate-y-0">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 py-5 border-b border-serena-blush/20 shrink-0">
        <span className="text-xs font-bold tracking-widest text-serena-gold uppercase font-ui">Tu Carrito</span>
        <button onClick={closeDrawer} className="w-8 h-8 flex items-center justify-center bg-serena-charcoal/5 rounded-full text-serena-charcoal hover:bg-serena-charcoal/10 transition-colors">
          ✕
        </button>
      </div>

      {/* Cart items list */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
        {cartItems.map((item) => (
          <div key={`${item.id}-${item.size}`} className="flex items-center gap-4 border-b pb-2 border-serena-blush/20">
            <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <p className="font-medium text-serena-charcoal">{item.title}</p>
              <p className="text-xs text-serena-charcoal/60">Talle: {item.size}</p>
              <p className="text-xs text-serena-charcoal/60">Cant.: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-serena-gold">${(item.price * item.quantity).toLocaleString("es-AR")}</p>
              <button
                onClick={() => removeItem(item.id, item.size)}
                className="text-xs text-serena-charcoal/70 hover:text-serena-charcoal transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals and actions */}
      <div className="p-4 border-t border-serena-blush/20">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-serena-charcoal/70">Subtotal</span>
          <span className="text-lg font-bold text-serena-gold">${subtotal.toLocaleString("es-AR")}</span>
        </div>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full bg-serena-gold text-white text-xs font-bold py-3 rounded-2xl hover:opacity-90 transition-colors mb-2"
          >
            Continuar compra
          </button>
        <button
          onClick={() => {
            clearCart();
            closeDrawer();
          }}
          className="w-full bg-serena-charcoal/5 text-serena-charcoal border border-serena-charcoal/20 py-3 rounded-2xl hover:bg-serena-charcoal/10 transition-colors"
        >
          Vaciar carrito
        </button>
      </div>
    </div>
  );
}

// src/app/checkout/page.tsx
"use client"; // 👈 Directiva Mandatoria para habilitar hooks de cliente

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { serenaLogger } from "@/core/logger";

/**
 * Página de Checkout Sanada (Bloque 1 / Bloque 4 Estabilización).
 * Limpia las viejas dependencias anémicas y habilita el flujo seguro de Turbopack.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulación inmutable del flujo de checkout adaptada a Clean Architecture
  const handleConfirmCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    serenaLogger.info("[Checkout] Iniciando procesamiento de orden premium.");

    try {
      // Aquí se orquestará en el futuro el llamado al CreateOrderUseCase de aplicación
      setTimeout(() => {
        setIsProcessing(false);
        serenaLogger.info("[Checkout] Orden procesada con éxito. Redireccionando.");
        router.push("/order-success");
      }, 1500);
    } catch (error) {
      setIsProcessing(false);
      serenaLogger.error("[Checkout] Error procesando la orden", { error });
    }
  };

  return (
    <div className="min-h-screen bg-serena-silk flex flex-col items-center justify-center p-6 font-ui text-serena-charcoal">
      <div className="w-full max-w-[420px] bg-serena-cream rounded-2xl p-6 border border-serena-blush/30 shadow-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-editorial text-xl font-bold">Confirmar Mi Pedido</h1>
          <p className="text-[10px] uppercase tracking-widest text-serena-gold font-bold">Serena Intimates · Salta</p>
        </div>

        {/* Resumen Simulado */}
        <div className="bg-white rounded-xl p-4 border border-serena-blush/20 space-y-2 text-xs">
          <span className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/40 block">Resumen de Selección</span>
          <div className="flex justify-between font-medium">
            <span>Lencería Premium (Item Seleccionado)</span>
            <span className="font-semibold text-serena-gold">Calce Verificado ✨</span>
          </div>
        </div>

        {/* Acción */}
        <form onSubmit={handleConfirmCheckout}>
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-serena-charcoal text-white text-xs font-bold py-4 rounded-xl uppercase tracking-wider hover:opacity-90 smooth-transition disabled:opacity-50"
          >
            {isProcessing ? "Procesando Orden..." : "Finalizar Compra"}
          </button>
        </form>
      </div>
    </div>
  );
}
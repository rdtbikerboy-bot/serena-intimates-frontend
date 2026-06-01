// src/services/whatsappMessageBuilder.ts
"use client";

/**
 * Build the WhatsApp pre‑filled message used in the assisted checkout flow.
 *
 * The function is deliberately pure – no side effects, just string formatting.
 * Future variants (different copy, emojis, localisation) can be added by
 * extending this module without touching the orchestrator.
 */
export interface WhatsAppMessageParams {
  name: string;
  phone: string;
  city: string;
  items: Array<{
    id: string;
    title: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
}

export function buildWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { name, phone, city, items, subtotal } = params;
  const lines: string[] = [];
  lines.push("*¡Hola! 👋*\n");
  lines.push("Quiero iniciar mi compra con los siguientes datos:");
  lines.push(`*Nombre:* ${name}`);
  lines.push(`*Teléfono:* ${phone}`);
  lines.push(`*Ciudad:* ${city}`);
  lines.push("\n*Productos:*\n");
  items.forEach((it) => {
    const lineTotal = (it.price * it.quantity).toFixed(2);
    lines.push(`- ${it.title} (talle ${it.size}) x${it.quantity}: $${lineTotal}`);
  });
  lines.push(`\n*Subtotal:* $${subtotal.toFixed(2)}`);
  lines.push("\nPor favor, indícame los pasos para completar la transferencia bancaria. Gracias!");
  return lines.join("\n");
}

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
  orderId: string;
  name: string;
  phone: string;
  deliveryMethod: string;
  address?: string;
  items: Array<{
    id: string;
    title: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

export function buildWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { orderId, name, phone, deliveryMethod, address, items, total } = params;
  const lines: string[] = [];
  
  const separator = "━━━━━━━━━━━━━━━━━━";
  const dateStr = new Date().toLocaleString("es-AR");

  const totalProducts = items.length;
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  lines.push(separator);
  lines.push("🌸 SERENA INTIMATES");
  lines.push("Solicitud de compra");
  lines.push(separator);
  
  lines.push("🛍 RESUMEN");
  lines.push(`Cantidad de productos: ${totalProducts}`);
  lines.push(`Cantidad total de unidades: ${totalUnits}`);
  lines.push(separator);

  lines.push("Detalle completo:\n");
  items.forEach((it) => {
    const lineTotal = (it.price * it.quantity).toLocaleString("es-AR");
    lines.push(`• Producto: ${it.title}`);
    lines.push(`• Talle: ${it.size}`);
    lines.push(`• Cantidad: ${it.quantity}`);
    lines.push(`• Precio: $${it.price.toLocaleString("es-AR")}`);
    lines.push(`• Subtotal: $${lineTotal}\n`);
  });

  lines.push(separator);
  lines.push(`💰 TOTAL: $${total.toLocaleString("es-AR")}`);
  lines.push(separator);
  lines.push(`🚚 Entrega: ${deliveryMethod === "pickup" ? "Retiro en sucursal" : "Envío a domicilio"}`);
  lines.push(separator);
  
  if (address) {
    lines.push("📍 Dirección completa:");
    lines.push(address); // We don't have separate fields for locality/province/zip code yet, so just print the address string.
    lines.push(separator);
  }

  lines.push(`👤 Cliente: ${name}`);
  lines.push(`📱 Teléfono: ${phone}`);
  lines.push(`🆔 Pedido Serena: ${orderId}`);
  lines.push(`🟡 Estado:\nPendiente de Confirmación`);
  lines.push(`🕒 Fecha: ${dateStr}`);
  lines.push(`🌐 Origen Web: SERENA INTIMATES`);
  lines.push(separator);
  lines.push("Hola! Acabo de realizar este pedido desde la tienda SERENA INTIMATES y me gustaría coordinar el pago y la entrega. Muchas gracias ❤️");

  return lines.join("\n");
}

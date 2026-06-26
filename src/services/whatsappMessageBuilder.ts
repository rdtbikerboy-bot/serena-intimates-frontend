// src/services/whatsappMessageBuilder.ts
"use client";

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

/**
 * Formateador Puro de Mensajes para el Enlace Asistido de WhatsApp.
 * Genera una plantilla visualmente limpia y estructurada para facilitar el procesamiento al vendedor.
 */
export function buildWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { orderId, name, phone, deliveryMethod, address, items, total } = params;
  const lines: string[] = [];

  const separator = "━━━━━━━━━━━━━━━━━━━━━━";
  const dateStr = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Salta" });

  const totalProducts = items.length;
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  lines.push(separator);
  lines.push("🌸 *SERENA INTIMATES* 🌸");
  lines.push("       _Solicitud de Compra Web_");
  lines.push(separator);

  lines.push("🛍️ *RESUMEN DEL PEDIDO*");
  lines.push(`• Tipos de producto: ${totalProducts}`);
  lines.push(`• Prendas totales: ${totalUnits}`);
  lines.push(separator);

  lines.push("*DETALLE COMPLETO:*");
  items.forEach((it) => {
    const lineTotal = (it.price * it.quantity).toLocaleString("es-AR");
    lines.push(`• *${it.title}*`);
    lines.push(`  Talle: ${it.size} | Cantidad: ${it.quantity}`);
    lines.push(`  Precio: $${it.price.toLocaleString("es-AR")} c/u`);
    lines.push(`  Subtotal: $${lineTotal}\n`);
  });

  lines.push(separator);
  lines.push(`💰 *TOTAL A COORDINAR: $${total.toLocaleString("es-AR")}*`);
  lines.push(separator);
  lines.push(`🚚 *Método de Entrega:* ${deliveryMethod === "pickup" ? "Retiro en Local" : "Envío a Domicilio"}`);

  if (address && deliveryMethod !== "pickup") {
    lines.push(`📍 *Dirección:* ${address}`);
  }
  lines.push(separator);

  lines.push("👤 *DATOS DE LA CLIENTA:*");
  lines.push(`• Nombre: ${name}`);
  lines.push(`• Teléfono: ${phone}`);
  lines.push(`• Código Único: \`${orderId}\``);
  lines.push(`• Fecha de Solicitud: ${dateStr}`);
  lines.push(separator);
  lines.push("¡Hola! Acabo de realizar este pedido desde la tienda virtual de SERENA INTIMATES y me gustaría coordinar el pago y el método de entrega. Muchas gracias. ❤️");

  return lines.join("\n");
}
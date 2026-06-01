/**
 * Serena Intimates — Utilidades para Curation, Modo Vendedora & Compartido Orgánico
 * Motores conceptuales ligeros para deep-linking y generación de copys de WhatsApp.
 */

// Genera un enlace de curaduría personalizado para Modo Vendedora
export function generateVendedoraLink(selectedIds: string[], asesoraName: string = "Asesora"): string {
  if (selectedIds.length === 0) return "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const selectionStr = encodeURIComponent(selectedIds.join(","));
  const nameStr = encodeURIComponent(asesoraName);
  return `${baseUrl}/?vendedora=true&selection=${selectionStr}&asesora=${nameStr}`;
}

// Genera el texto del mensaje para enviar la curaduría por WhatsApp
export function generateVendedoraWhatsAppText(selectedIds: string[], subtotal: number, asesoraName: string = "Asesora"): string {
  const link = generateVendedoraLink(selectedIds, asesoraName);
  return `✨ ¡Hola! Te armé una selección exclusiva de Serena Intimates según lo que buscábamos. Podés ver tus prendas sugeridas ingresando a tu catálogo personalizado en el siguiente link:\n\n🔗 ${link}\n\n💰 *Total Estimado:* $${subtotal.toLocaleString("es-AR")} ARS\n📍 Disponible para entrega inmediata o encargo directo en Salta. ¿Cuáles te gustaron más? 💕✨`;
}

// Genera un enlace para compartir la Wishlist (Favoritos) de una clienta
export function generateSharedWishlistLink(favoriteIds: string[]): string {
  if (favoriteIds.length === 0) return "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const wishlistStr = encodeURIComponent(favoriteIds.join(","));
  return `${baseUrl}/?shared_wishlist=${wishlistStr}`;
}

// Genera el texto de WhatsApp para compartir favoritos con amigas
export function generateSharedWishlistWhatsAppText(favoriteIds: string[]): string {
  const link = generateSharedWishlistLink(favoriteIds);
  return `¡Hola! 🩰 Te comparto mi selección de favoritos que acabo de guardar en Serena Intimates. Mirá lo hermosos que quedan ingresando en este link:\n\n🔗 ${link}\n\n¿Cuál es tu favorito? ✨💕`;
}

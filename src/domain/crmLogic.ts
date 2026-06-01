import { CRMClient, CRMInteraction } from "@/core/types";

// =====================================================================
// CRM COMERCIAL - FASE 13
// Generador de Templates de WhatsApp (Humano y Cercano)
// =====================================================================

export const whatsappTemplates = {
  seguimiento: (clientName: string) => 
    `¡Hola ${clientName}! ✨ Te escribimos de Serena Intimates 🩰.\n\nQueríamos saber cómo sentiste el calce del último look que te llevaste. Para nosotras es súper importante que te sientas cómoda y segura.\n\nCualquier cosita, estamos a un mensajito de distancia. 🤍`,

  reserva: (clientName: string, product: string, size: string) => 
    `¡Hola ${clientName}! ✨ Separamos con éxito tu ${product} (Talle ${size}) 🩰.\n\nTe lo guardamos en nuestro showroom. Avisanos si preferís pasar a retirarlo o si coordinamos un envío discreto en Salta.\n\n¡Gracias por elegir Serena! 🤍`,

  abandono: (clientName: string, product: string) => 
    `¡Hola ${clientName}! ✨ Vimos que estuviste chusmeando el ${product} 🩰.\n\nQueríamos avisarte que nos quedan poquitas unidades de ese ingreso de Brasil. Si te quedó alguna duda con el talle o el calce, preguntanos con confianza.\n\nTe mandamos un beso grande. 🤍`,

  reingreso: (clientName: string, product: string, size: string) => 
    `¡Hola ${clientName}! ✨ Te escribimos de Serena Intimates 🩰.\n\nQueríamos avisarte con alegría que acaba de reingresar el look que estabas esperando:\n💖 *${product}* (Talle *${size}*).\n\n¿Te reservamos una unidad? Avisanos rápido que vuelan. ✨`,

  preventa: (clientName: string, brand: string) => 
    `¡Hola ${clientName}! ✨ Tenemos un adelanto exclusivo para vos 🩰.\n\nComo sabemos que te encanta la línea de ${brand}, queríamos contarte que el viernes lanzamos una nueva colección de Brasil y estamos abriendo preventa hoy para clientas vip.\n\n¿Te gustaría ver el catálogo antes que nadie? 🤍`,
};

// =====================================================================
// Auto-Etiquetado Orgánico (Lógica Simple y Humana)
// =====================================================================

export const crmLogic = {
  /**
   * Analiza un cliente y sus interacciones para asignarle etiquetas orgánicas.
   */
  generateAutoTags(client: CRMClient, interactions: CRMInteraction[]): string[] {
    const tags = new Set<string>(client.tags);

    // 1. Preferencias de Marca
    if (client.preferredBrands.includes("Valisere") || client.preferredBrands.includes("Darling")) {
      tags.add("premium brasil");
    }

    // 2. Talles
    if (client.preferredSizes.includes("95") || client.preferredSizes.includes("100")) {
      tags.add("curvy fit");
    }

    // 3. Moods
    if (client.preferredMoods.includes("sensual-delicado") || client.preferredMoods.includes("noche-especial")) {
      tags.add("ama encaje");
    }
    if (client.preferredMoods.includes("dia-a-dia") || client.preferredMoods.includes("comodo-y-suave")) {
      tags.add("comfort diario");
    }
    if (client.preferredMoods.includes("bridal")) {
      tags.add("bridal");
    }

    // 4. Comportamiento (Basado en Interacciones)
    const checkouts = interactions.filter(i => i.type === "checkout_iniciado").length;
    if (checkouts >= 3) {
      tags.add("recompra alta");
    }
    
    const shares = interactions.filter(i => i.type === "share").length;
    if (shares >= 2) {
      tags.add("embajadora natural");
    }

    return Array.from(tags);
  }
};

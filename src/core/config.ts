// =====================================================================
// CONFIG.TS — CONSTANTES Y VARIABLES CONFIGURABLES DE SERENA
// =====================================================================
// Centraliza las variables operativas críticas, claves de almacenamiento,
// tipo de cambio por defecto para importaciones y configuraciones de WhatsApp.
// =====================================================================

export const SERENA_CONFIG = {
  // Configuración de Comunicación Oficial
  whatsappNumber: "543874022233",
  whatsappBaseUrl: "https://wa.me",

  // Fase 15: Acceso Editorial (Soft Launch privado)
  editorialAccessMode: true,

  // Seguridad & Acceso Administrativo
  adminPasscode: "2233", // Clave de soporte oficial de 4 dígitos

  // Claves de Almacenamiento Local (Local Storage)
  keys: {
    systemLogs: "serena_system_logs",
    favorites: "serena_favorites",
    fitState: "serena_fit_state",
    analyticsMetrics: "serena_analytics_metrics",
    customCatalog: "serena_products_catalog",
    syncQueue: "serena_sync_queue",
    vendedoraSelection: "serena_vendedora_selection",
    vendedoraMode: "serena_vendedora_mode_active",
  },

  // Coeficientes y Datos por Defecto para la Importadora
  pricing: {
    defaultExchangeRate: 1400, // Cotización ARS por 1 USD
    defaultMargin: 2.2,        // Multiplicador de margen (120% ganancia)
    defaultCountry: "Brasil",
    defaultProvider: "Distribuidor Oficial São Paulo",
  },

  // Configuración del Probador Sizing Guide
  sizing: {
    bustSizes: ["85", "90", "95", "100", "105", "110"] as const,
    bombachaSizes: ["XS", "S", "M", "L", "XL", "XXL"] as const,
  }
};

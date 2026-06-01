/**
 * CORE: Feature Flags
 * Permite la habilitación/deshabilitación táctica de módulos comerciales
 * sin requerir redeploys. Orientado al soft-launch y escalabilidad.
 */

export const FEATURE_FLAGS = {
  // Activa el Drawer inferior de panel de administración y el Modo Vendedora táctil
  ENABLE_SELLER_MODE: true,

  // Activa el algoritmo 70/30 y memoria dinámica local
  ENABLE_MEMORY_SERENA: true,

  // Activa la visualización de Drops Editoriales programados
  ENABLE_DROPS: true,

  // Activa las listas de espera automatizadas y notificaciones de stock
  ENABLE_WAITLISTS: true,

  // Activa módulos experimentales de contenido (ej: stories estilo Instagram)
  ENABLE_STORIES: false,

  // Fuerzo métricas locales a volcar a Supabase inmediatamente en vez de por baches
  FORCE_IMMEDIATE_TELEMETRY: false,
};

export function isFeatureEnabled(flagName: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flagName] ?? false;
}

/**
 * RATE-LIMITER.TS — PROTECCIÓN ANTI-SPAM & RATE LIMITING EN EL CLIENTE
 * Previene múltiples clicks accidentales, spam de checkout por WhatsApp
 * y ráfagas involuntarias de envío de eventos de analítica.
 */

const cooldowns: Record<string, number> = {};

export const clientRateLimiter = {
  /**
   * Evalúa si una acción táctil tiene permitido ejecutarse.
   * @param actionKey Identificador único de la acción (ej: 'whatsapp_checkout', 'add_to_cart').
   * @param cooldownMs Tiempo mínimo en milisegundos requerido entre disparos (por defecto 1800ms).
   * @returns true si la acción es válida, false si está bloqueada por cooldown.
   */
  canTrigger(actionKey: string, cooldownMs = 1800): boolean {
    const now = Date.now();
    const lastExecution = cooldowns[actionKey] || 0;

    if (now - lastExecution < cooldownMs) {
      console.warn(`⚠️ [Anti-Spam] Acción '${actionKey}' bloqueada preventivamente.`);
      return false;
    }

    cooldowns[actionKey] = now;
    return true;
  }
};

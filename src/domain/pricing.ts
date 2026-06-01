// =====================================================================
// PRICING.TS — MOTOR DE PRECIOS E IMPORTACIÓN (PURA REGLA DE NEGOCIO)
// =====================================================================
// Calcula precios sugeridos en Pesos Argentinos (ARS) anclados al costo USD
// de origen, aplicando coeficientes de importación y redondeo premium.
// =====================================================================

import { SERENA_CONFIG } from "@/core/config";

/**
 * Redondea un precio a un valor elegante, legible y cómodo para cobro en pesos.
 * Evita decimales y números incómodos.
 * - Si es mayor a $10,000: Redondea a los $100 o $500 más cercanos.
 * - Si es menor a $10,000: Redondea a los $50 más cercanos.
 */
export function roundToBoutiquePrice(rawPrice: number): number {
  if (rawPrice <= 0) return 0;

  if (rawPrice > 20000) {
    // Redondear al millar o a las centenas altas (ej. $33,243 -> $33,200)
    return Math.round(rawPrice / 500) * 500;
  } else if (rawPrice > 10000) {
    return Math.round(rawPrice / 100) * 100;
  } else {
    return Math.round(rawPrice / 50) * 50;
  }
}

/**
 * Calcula el precio sugerido en Pesos Argentinos (ARS) en base al costo en USD,
 * la cotización del dólar de referencia y el multiplicador de margen.
 */
export function calculateSuggestedPrice(
  costUsd: number,
  exchangeRate?: number,
  margin?: number
): number {
  const rate = exchangeRate || SERENA_CONFIG.pricing.defaultExchangeRate;
  const mult = margin || SERENA_CONFIG.pricing.defaultMargin;

  const rawSuggested = costUsd * rate * mult;
  return roundToBoutiquePrice(rawSuggested);
}

/**
 * Valida si un precio de venta final es razonable comparado con su costo neto.
 * Retorna la rentabilidad proyectada (ROI o Margen Neto en %).
 */
export function calculateNetProfitPercent(
  costUsd: number,
  exchangeRate: number,
  retailPrice: number
): number {
  const costArs = costUsd * exchangeRate;
  if (costArs <= 0) return 0;
  
  const profit = retailPrice - costArs;
  return parseFloat(((profit / retailPrice) * 100).toFixed(1));
}

import { Product } from "@/core/types";
import { FitState } from "@/store/fitProfileStore";
import { inferItemType } from "./completeTheLook";

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface ConfidenceResult {
  level: ConfidenceLevel;
  recommendedSize?: string;
  reason: string;
}

/**
 * Fit Confidence Engine
 * Evalúa la confianza del talle basado en el perfil y stock.
 * Reglas:
 * - HIGH: Perfil completo + Match exacto de talle en stock > 0
 * - MEDIUM: Perfil completo + Talle en array genérico (sin control de stock fuerte)
 * - LOW: Talle sin stock o no disponible para este producto
 * - NONE: Sin perfil de fit guardado
 */
export function getFitConfidence(product: Product, fitState: FitState | null): ConfidenceResult {
  if (!fitState) return { level: 'NONE', reason: 'No profile' };
  
  const type = inferItemType(product.title);
  
  // Panty usa bombacha, el resto asume upper body (busto) por defecto.
  const userSize = type === 'panty' ? fitState.bombacha : fitState.busto;
  
  if (!userSize) {
    return { level: 'NONE', reason: 'Profile missing relevant dimension' };
  }

  // Verificar en stockMap (fuente de verdad fuerte)
  const hasStockMap = product.stockMap && Object.keys(product.stockMap).length > 0;
  
  if (hasStockMap) {
    const stockForSize = product.stockMap![userSize];
    if (stockForSize !== undefined && stockForSize > 0) {
      return { level: 'HIGH', recommendedSize: userSize, reason: 'Exact size match in stock' };
    } else if (stockForSize !== undefined && stockForSize === 0) {
      return { level: 'LOW', recommendedSize: userSize, reason: 'Exact size out of stock' };
    }
  }

  // Verificar en variants o sizes fallback
  const hasSizesArray = (product as any).sizes && Array.isArray((product as any).sizes);
  if (hasSizesArray) {
    const sizes = (product as any).sizes as string[];
    if (sizes.includes(userSize)) {
      return { level: 'MEDIUM', recommendedSize: userSize, reason: 'Size match but stock unknown' };
    } else {
      return { level: 'LOW', reason: 'Size not available for product' };
    }
  }
  
  return { level: 'LOW', reason: 'Unable to verify size compatibility' };
}

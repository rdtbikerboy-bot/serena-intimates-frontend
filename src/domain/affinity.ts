// =====================================================================
// AFFINITY ENGINE — BEHAVIORAL PERSONALIZATION
// =====================================================================
// Responsible for weighting, scoring, affinity derivation, 
// recommendation generation, and novelty balancing.
// 
// Distinct from raw Signals (store) and Presentation (UI).
// =====================================================================

import { Product, ClientFit } from "@/core/types";

export type UserConfidence = "COLD" | "WARM" | "HIGH";

export interface AffinityBreakdown {
  affinity: number;
  exploration: number;
  surprise: number;
}

export interface AffinityResult {
  totalScore: number;
  breakdown: AffinityBreakdown;
  editorialReason?: string;
}

/**
 * Genera un valor pseudo-aleatorio estable (0 a 1) en base a un string (id de producto)
 * y una semilla numérica cambiante.
 */
function getDeterministicSurprise(productId: string, seed: number): number {
  let hash = 0;
  const combo = productId + String(seed);
  for (let i = 0; i < combo.length; i++) {
    const char = combo.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convertir a entero de 32 bits
  }
  return Math.abs(hash % 1000) / 1000;
}

/**
 * Determines the user's personalization confidence based on total signals.
 */
function getUserConfidence(
  viewedBrands: Record<string, number>,
  viewedCategories: Record<string, number>,
  favoritesCount: number,
  hasFitProfile: boolean
): UserConfidence {
  let totalSignals = 0;
  totalSignals += Object.values(viewedBrands).reduce((a, b) => a + b, 0);
  totalSignals += Object.values(viewedCategories).reduce((a, b) => a + b, 0);
  totalSignals += favoritesCount * 5; // Favorites are strong signals
  totalSignals += hasFitProfile ? 10 : 0; // Fit profile is a strong signal

  if (totalSignals < 5) return "COLD";
  if (totalSignals < 20) return "WARM";
  return "HIGH";
}

/**
 * Returns the weighting distribution based on user confidence.
 */
function getNoveltyWeights(confidence: UserConfidence) {
  switch (confidence) {
    case "COLD": return { affinity: 0.50, exploration: 0.40, surprise: 0.10 };
    case "WARM": return { affinity: 0.70, exploration: 0.20, surprise: 0.10 };
    case "HIGH": return { affinity: 0.80, exploration: 0.15, surprise: 0.05 };
  }
}

/**
 * Calculates raw affinity score (0-100) based on direct matches.
 */
function calculateRawAffinity(
  product: Product,
  favoritesList: string[],
  fitState: ClientFit | null,
  viewedBrands: Record<string, number>,
  viewedCategories: Record<string, number>
): { score: number, strongestSignal: string | null } {
  let score = 0;
  let strongestSignal = null;
  let maxPoints = 0;

  // 1. Fit Match (max 40)
  if (fitState?.busto) {
    const sizeNum = parseInt(fitState.busto) || 90;
    let fitPoints = 0;
    if (sizeNum >= 95 && product.supportLevel === "alto") fitPoints = 40;
    else if (sizeNum < 95 && product.supportLevel === "medio") fitPoints = 30;
    else fitPoints = 15;
    
    score += fitPoints;
    if (fitPoints > maxPoints) { maxPoints = fitPoints; strongestSignal = "FIT"; }
  }

  // 2. Favorites Match (max 30)
  if (favoritesList.includes(product.title)) {
    score += 30;
    if (30 > maxPoints) { maxPoints = 30; strongestSignal = "FAVORITE"; }
  }

  // 3. Brand Views (max 15)
  const brandViews = viewedBrands[product.brand] || 0;
  const brandPoints = Math.min(brandViews * 5, 15);
  if (brandPoints > 0) {
    score += brandPoints;
    if (brandPoints > maxPoints) { maxPoints = brandPoints; strongestSignal = "BRAND"; }
  }

  // 4. Category Views (max 15)
  const categoryViews = viewedCategories[product.category] || 0;
  const categoryPoints = Math.min(categoryViews * 5, 15);
  if (categoryPoints > 0) {
    score += categoryPoints;
    if (categoryPoints > maxPoints) { maxPoints = categoryPoints; strongestSignal = "CATEGORY"; }
  }

  return { score: Math.min(score, 100), strongestSignal };
}

/**
 * Calculates raw exploration score (0-100) based on adjacent/novel attributes.
 */
function calculateRawExploration(
  product: Product,
  viewedBrands: Record<string, number>,
  viewedCategories: Record<string, number>
): number {
  const brandKnown = (viewedBrands[product.brand] || 0) > 0;
  const categoryKnown = (viewedCategories[product.category] || 0) > 0;

  // If both known, no exploration points
  if (brandKnown && categoryKnown) return 0;
  // If one known and one new, highly explorative (adjacent)
  if (brandKnown || categoryKnown) return 100;
  // If totally new, moderate exploration (pure novelty)
  return 50;
}

/**
 * Derives a premium editorial reason for the recommendation.
 */
function deriveEditorialReason(
  strongestSignal: string | null,
  isExploration: boolean,
  isSurprise: boolean
): string | undefined {
  if (isSurprise) return "Descubrimiento premium";
  
  if (isExploration) return "Elegido para tu estilo";

  switch (strongestSignal) {
    case "FIT": return "Selección Serena";
    case "FAVORITE": return "Inspirado en tus favoritos";
    case "BRAND": return "Para vos";
    case "CATEGORY": return "Para vos";
    default: return undefined;
  }
}

/**
 * Calculates the comprehensive AffinityResult for a product.
 */
export function calculateProductAffinity(
  product: Product,
  favoritesList: string[],
  fitState: ClientFit | null,
  viewedBrands: Record<string, number> = {},
  viewedCategories: Record<string, number> = {},
  surpriseSeed: number = 42
): AffinityResult {
  const confidence = getUserConfidence(viewedBrands, viewedCategories, favoritesList.length, !!fitState);
  const weights = getNoveltyWeights(confidence);

  const { score: rawAffinity, strongestSignal } = calculateRawAffinity(product, favoritesList, fitState, viewedBrands, viewedCategories);
  const rawExploration = calculateRawExploration(product, viewedBrands, viewedCategories);
  const rawSurprise = getDeterministicSurprise(product.id, surpriseSeed) * 100;

  const weightedAffinity = rawAffinity * weights.affinity;
  const weightedExploration = rawExploration * weights.exploration;
  const weightedSurprise = rawSurprise * weights.surprise;

  const totalScore = parseFloat((weightedAffinity + weightedExploration + weightedSurprise).toFixed(2));

  // Determine dominant factor for explainability
  let editorialReason: string | undefined;
  if (totalScore >= 30) {
    const isSurprise = weightedSurprise > Math.max(weightedAffinity, weightedExploration);
    const isExploration = weightedExploration > Math.max(weightedAffinity, weightedSurprise);
    editorialReason = deriveEditorialReason(strongestSignal, isExploration, isSurprise);
  }

  return {
    totalScore,
    breakdown: {
      affinity: parseFloat(weightedAffinity.toFixed(2)),
      exploration: parseFloat(weightedExploration.toFixed(2)),
      surprise: parseFloat(weightedSurprise.toFixed(2))
    },
    editorialReason
  };
}

/**
 * Sorts and prioritizes a feed of products applying the Affinity Engine.
 * Note: Use the `useStableRanking` hook in UI instead of calling this directly on render.
 */
export function sortProductsBySerenaMemory(
  products: Product[],
  favoritesList: string[],
  fitState: ClientFit | null,
  viewedBrands: Record<string, number> = {},
  viewedCategories: Record<string, number> = {},
  surpriseSeed: number = 42
): (Product & { _affinity?: AffinityResult })[] {
  return products.map(product => {
    const affinity = calculateProductAffinity(
      product,
      favoritesList,
      fitState,
      viewedBrands,
      viewedCategories,
      surpriseSeed
    );
    return { ...product, _affinity: affinity };
  }).sort((a, b) => (b._affinity?.totalScore || 0) - (a._affinity?.totalScore || 0));
}

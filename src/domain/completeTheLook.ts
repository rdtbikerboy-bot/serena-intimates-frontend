import { Product } from "@/core/types";
import { calculateProductAffinity } from "./affinity";

type ItemType = 'bra' | 'panty' | 'robe' | 'babydoll' | 'pijama' | 'corset' | 'body' | 'unknown';

export function inferItemType(title: string): ItemType {
  const normalized = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (/\b(bra|corpino|bustier|sutia|top)\b/.test(normalized)) return 'bra';
  if (/\b(panty|bombacha|cola-less|vedetina|bikini|tanga|culotte|bragas|calcinha|less)\b/.test(normalized)) return 'panty';
  if (/\b(robe|bata)\b/.test(normalized)) return 'robe';
  if (/\b(babydoll|camisolin)\b/.test(normalized)) return 'babydoll';
  if (/\b(pijama)\b/.test(normalized)) return 'pijama';
  if (/\b(corset)\b/.test(normalized)) return 'corset';
  if (/\b(body)\b/.test(normalized)) return 'body';
  return 'unknown';
}

function getComplementaryTypes(type: ItemType): ItemType[] {
  switch (type) {
    case 'bra': return ['panty'];
    case 'panty': return ['bra', 'corset'];
    case 'babydoll': return ['robe'];
    case 'robe': return ['babydoll', 'pijama', 'body'];
    case 'pijama': return ['robe'];
    case 'corset': return ['panty'];
    case 'body': return ['robe'];
    default: return []; // Si no sabemos qué es, no forzamos complementos estrictos
  }
}

function isColorHarmonious(color1: string | undefined, color2: string | undefined): boolean {
  if (!color1 || !color2) return true;
  const c1 = color1.toLowerCase();
  const c2 = color2.toLowerCase();
  if (c1 === c2) return true;
  const neutrals = ['nude', 'negro', 'blanco', 'almendra', 'noir', 'black', 'white', 'marfil soft', 'nude serena', 'noir intense'];
  if (neutrals.includes(c1) || neutrals.includes(c2)) return true;
  return false;
}

function passesQualityFilters(candidate: Product, currentProduct: Product): boolean {
  // 1. Active product check
  if (!candidate || !candidate.id || candidate.id === currentProduct.id) return false;
  
  // 2. Visibility check
  if (candidate.price <= 0) return false;

  // 3. Size availability check
  const hasStockMap = candidate.stockMap && Object.values(candidate.stockMap).some(stock => stock > 0);
  const hasSizesArray = (candidate as any).sizes && (candidate as any).sizes.length > 0;
  const hasStockVariants = (candidate as any).stockVariants && Object.values((candidate as any).stockVariants).some(stock => (stock as number) > 0);
  if (!hasStockMap && !hasSizesArray && !hasStockVariants) return false;

  // 4. Color harmony check
  if (!isColorHarmonious(currentProduct.color, candidate.color)) return false;

  return true;
}

/**
 * Complete The Look Engine
 * Evaluates current product and catalog to return ordered recommendation candidates.
 * Follows 3 levels of priority. Limits output to exactly max 2.
 */
export function getCompleteTheLookRecommendations(currentProduct: Product, catalog: Product[]): Product[] {
  const currentType = inferItemType(currentProduct.title);
  
  if (currentType === 'unknown') return [];

  const complementaryTypes = getComplementaryTypes(currentType);
  
  const validCandidates = catalog.filter(p => passesQualityFilters(p, currentProduct));
  if (validCandidates.length === 0) return [];

  // LEVEL 1: Exact collection or Exact drop + Complementary Category
  let level1 = validCandidates.filter(p => {
    const pType = inferItemType(p.title);
    if (pType === 'unknown') return false;

    const isComplementary = complementaryTypes.includes(pType);
    const sameDrop = currentProduct.drop && p.drop === currentProduct.drop;
    const sameCollection = currentProduct.collections?.some(c => p.collections?.includes(c));
    return isComplementary && (sameDrop || sameCollection);
  });

  if (level1.length >= 2) return level1.slice(0, 2);

  // LEVEL 2: Same brand + Compatible category
  let level2 = validCandidates.filter(p => {
    const pType = inferItemType(p.title);
    if (pType === 'unknown') return false;

    const isComplementary = complementaryTypes.includes(pType);
    return isComplementary && p.brand === currentProduct.brand;
  });

  // Deduplicate
  level2 = level2.filter(p => !level1.some(l1 => l1.id === p.id));
  
  const combined = [...level1, ...level2];
  if (combined.length >= 2) return combined.slice(0, 2);

  // LEVEL 3: Affinity fallback (uses existing affinity logic)
  const remaining = validCandidates.filter(p => !combined.some(c => c.id === p.id));
  
  const scoredRemaining = remaining.map(p => ({
    product: p,
    score: calculateProductAffinity(p, [], null, {}, {}, 42).totalScore
  })).sort((a, b) => b.score - a.score);

  const fallback = scoredRemaining.map(s => s.product);

  const finalRecommendations = [...combined, ...fallback];
  return finalRecommendations.slice(0, 2);
}

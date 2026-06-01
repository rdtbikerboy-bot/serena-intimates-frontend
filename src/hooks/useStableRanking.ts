import { useState, useEffect, useRef } from 'react';
import { Product } from '@/core/types';
import { useRecommendationSignalsStore } from '@/store/recommendationSignalsStore';
import { useFitProfileStore } from '@/store/fitProfileStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { sortProductsBySerenaMemory, AffinityResult } from '@/domain/affinity';

export function useStableRanking(products: Product[]) {
  const [rankedProducts, setRankedProducts] = useState<(Product & { _affinity?: AffinityResult })[]>([]);
  
  // We subscribe to fitState to detect explicit profile changes
  const fitState = useFitProfileStore((state) => state.fitState);
  const _hasHydratedFit = useFitProfileStore((state) => state._hasHydrated);
  const _hasHydratedSignals = useRecommendationSignalsStore((state) => state._hasHydrated);

  const prevFitState = useRef(fitState);

  // Generates a frozen recommendation snapshot
  const applyRanking = () => {
    if (products.length === 0) return;

    // Capture the current state of all signals (Snapshot)
    const signals = useRecommendationSignalsStore.getState();
    const currentFitState = useFitProfileStore.getState().fitState;
    const currentFavorites = useFavoritesStore.getState().favoritesList;

    const ranked = sortProductsBySerenaMemory(
      products,
      currentFavorites,
      currentFitState ? { busto: currentFitState.busto || "", bombacha: currentFitState.bombacha || "", stylePreferences: [] } : null,
      signals.viewedBrands,
      signals.viewedCategories,
      signals.surpriseSeed
    );
    setRankedProducts(ranked);
  };

  // Re-rank when core product data arrives or hydration finishes
  useEffect(() => {
    if (_hasHydratedFit && _hasHydratedSignals) {
      applyRanking();
    }
  }, [products, _hasHydratedFit, _hasHydratedSignals]);

  // Re-rank only on explicit fit profile change
  useEffect(() => {
    if (JSON.stringify(fitState) !== JSON.stringify(prevFitState.current)) {
      applyRanking();
      prevFitState.current = fitState;
    }
  }, [fitState]);

  return { rankedProducts, refreshRanking: applyRanking };
}

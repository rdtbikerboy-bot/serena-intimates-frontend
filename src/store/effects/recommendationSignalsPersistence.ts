// recommendationSignalsPersistence.ts
// External persistence pipeline for recommendation signals.
// Follows the same conventions as all other persistence pipelines.

import { useRecommendationSignalsStore } from '@/store/recommendationSignalsStore';

const STORAGE_KEY = 'serena_recommendation_signals';

let alreadyInitialized = false;
let unsub: (() => void) | null = null;

export function initRecommendationSignalsPersistence() {
  if (typeof window === "undefined" || alreadyInitialized) return;
  alreadyInitialized = true;

  // 1. Load saved signals from localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      useRecommendationSignalsStore.getState().hydrateSignals({
        viewedBrands: parsed.viewedBrands || {},
        viewedCategories: parsed.viewedCategories || {},
        surpriseSeed: parsed.surpriseSeed || Date.now() % 10000,
      });
    } else {
      // No saved data — just mark as hydrated with defaults
      useRecommendationSignalsStore.setState({ _hasHydrated: true });
    }
  } catch {
    // Corrupted data — start fresh, still mark hydrated
    useRecommendationSignalsStore.setState({ _hasHydrated: true });
  }

  // 2. Subscribe to changes and persist
  unsub = useRecommendationSignalsStore.subscribe((state) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          viewedBrands: state.viewedBrands,
          viewedCategories: state.viewedCategories,
          surpriseSeed: state.surpriseSeed,
        })
      );
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  });
}

export function cleanupRecommendationSignalsPersistence() {
  if (unsub) {
    unsub();
    unsub = null;
  }
  alreadyInitialized = false;
}

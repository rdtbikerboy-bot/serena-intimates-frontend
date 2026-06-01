import { create } from 'zustand';

export interface RecommendationSignalsState {
  _hasHydrated: boolean;
  viewedBrands: Record<string, number>;
  viewedCategories: Record<string, number>;
  surpriseSeed: number;

  incrementBrandView: (brand: string) => void;
  incrementCategoryView: (category: string) => void;
  refreshSurpriseSeed: () => void;
  hydrateSignals: (data: {
    viewedBrands: Record<string, number>;
    viewedCategories: Record<string, number>;
    surpriseSeed: number;
  }) => void;
}

export const useRecommendationSignalsStore = create<RecommendationSignalsState>((set, get) => ({
  _hasHydrated: false,
  viewedBrands: {},
  viewedCategories: {},
  surpriseSeed: Date.now() % 10000,

  incrementBrandView: (brand: string) => {
    const current = get().viewedBrands;
    set({ viewedBrands: { ...current, [brand]: (current[brand] || 0) + 1 } });
  },

  incrementCategoryView: (category: string) => {
    const current = get().viewedCategories;
    set({ viewedCategories: { ...current, [category]: (current[category] || 0) + 1 } });
  },

  refreshSurpriseSeed: () => {
    set({ surpriseSeed: Date.now() % 10000 });
  },

  hydrateSignals: (data) => {
    set({
      viewedBrands: data.viewedBrands,
      viewedCategories: data.viewedCategories,
      surpriseSeed: data.surpriseSeed,
      _hasHydrated: true,
    });
  },
}));

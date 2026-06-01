import { create } from 'zustand';

export interface CatalogPreferencesState {
  _hasHydrated: boolean;
  selectedCategory: string;
  selectedBrand: string;
  activeDrop: string | null;

  setSelectedCategory: (category: string) => void;
  setSelectedBrand: (brand: string) => void;
  setActiveDrop: (drop: string | null) => void;
  
  hydratePreferences: (payload: {
    selectedCategory: string;
    selectedBrand: string;
    activeDrop: string | null;
  }) => void;
}

export const useCatalogPreferencesStore = create<CatalogPreferencesState>((set) => ({
  _hasHydrated: false,
  selectedCategory: 'all',
  selectedBrand: 'all',
  activeDrop: null,

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
  setActiveDrop: (drop) => set({ activeDrop: drop }),

  hydratePreferences: ({ selectedCategory, selectedBrand, activeDrop }) =>
    set({ selectedCategory, selectedBrand, activeDrop, _hasHydrated: true })
}));

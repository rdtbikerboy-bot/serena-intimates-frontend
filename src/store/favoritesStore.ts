import { create } from 'zustand';

export interface FavoritesState {
  _hasHydrated: boolean;
  favoritesList: string[];
  // Toggle a product ID in favorites
  toggleFavorite: (productId: string) => void;
  // Hydrate the store with an array of favorites (used by persistence pipeline)
  hydrateFavorites: (favorites: string[]) => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  _hasHydrated: false,
  favoritesList: [],
  toggleFavorite: (productId: string) => {
    const current = get().favoritesList;
    const next = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];
    set({ favoritesList: next });
  },
  hydrateFavorites: (favorites: string[]) => {
    set({ favoritesList: favorites, _hasHydrated: true });
  },
}));

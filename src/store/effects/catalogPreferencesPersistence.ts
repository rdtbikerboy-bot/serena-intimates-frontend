import { useCatalogPreferencesStore } from '@/store/catalogPreferencesStore';

let initialized = false;

export const initCatalogPreferencesPersistence = () => {
  if (initialized) return;
  initialized = true;

  useCatalogPreferencesStore.getState().hydratePreferences({
    selectedCategory: 'all',
    selectedBrand: 'all',
    activeDrop: null,
  });
};

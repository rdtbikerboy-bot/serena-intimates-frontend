import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import { useFavoritesStore } from '@/store/favoritesStore';
import { serenaLogger } from '@/core/logger';

const FAVORITES_KEY = 'serena_favorites_idb';
let alreadyInitialized = false;
let isHydrating = false;
let unsub: (() => void) | null = null;

export async function initFavoritesPersistence() {
  if (typeof window === 'undefined' || alreadyInitialized) return;
  alreadyInitialized = true;
  isHydrating = true;

  try {
    const saved = await idbGet<string[]>(FAVORITES_KEY);
    if (saved) {
      useFavoritesStore.getState().hydrateFavorites(saved);
    } else {
      // Legacy fallback to localStorage
      const legacy = localStorage.getItem('serena_favorites');
      if (legacy) {
        const parsed = JSON.parse(legacy) as string[];
        useFavoritesStore.getState().hydrateFavorites(parsed);
        await idbSet(FAVORITES_KEY, parsed);
        localStorage.removeItem('serena_favorites'); // Migrate
      } else {
        // No persisted data; mark as hydrated with empty list
        useFavoritesStore.getState().hydrateFavorites([]);
      }
    }
  } catch (e) {
    serenaLogger.error('Error hydrating favorites from IndexedDB.', e);
    useFavoritesStore.getState().hydrateFavorites([]);
  } finally {
    isHydrating = false;
  }

  // Subscribe to store changes for reactive persistence
  unsub = useFavoritesStore.subscribe((state, prevState) => {
    // Skip persistence during hydration or if store not yet hydrated
    if (!state._hasHydrated || isHydrating) return;

    if (state.favoritesList !== prevState.favoritesList) {
      if (state.favoritesList.length === 0) {
        idbDel(FAVORITES_KEY).catch(e => serenaLogger.error('Error clearing favorites IDB.', e));
      } else {
        idbSet(FAVORITES_KEY, state.favoritesList).catch(e => serenaLogger.error('Error persisting favorites to IDB.', e));
      }
    }
  });
}

export function cleanupFavoritesPersistence() {
  if (unsub) {
    unsub();
    unsub = null;
  }
  alreadyInitialized = false;
}

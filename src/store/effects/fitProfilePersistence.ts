import { useFitProfileStore } from '@/store/fitProfileStore';
import { get as idbGet, set as idbSet } from 'idb-keyval';

let alreadyInitialized = false;
let isHydrating = false;
let unsub: (() => void) | null = null;

export async function initFitProfilePersistence() {
  if (typeof window === 'undefined' || alreadyInitialized) return;
  alreadyInitialized = true;
  isHydrating = true;

  try {
    const saved = await idbGet<any>('serena_fit_state_idb');
    if (saved !== undefined) {
      useFitProfileStore.getState().hydrateFitState(saved);
    } else {
      const legacy = localStorage.getItem('serena_fit_state');
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          useFitProfileStore.getState().hydrateFitState(parsed);
          idbSet('serena_fit_state_idb', parsed).catch(console.error);
        } catch (e) {
          useFitProfileStore.getState().hydrateFitState(null);
        }
      } else {
        useFitProfileStore.getState().hydrateFitState(null);
      }
    }
  } catch (e) {
    console.error('Error hydrating fit state from IDB', e);
    useFitProfileStore.getState().hydrateFitState(null);
  } finally {
    isHydrating = false;
  }

  unsub = useFitProfileStore.subscribe((state, prev) => {
    if (!state._hasHydrated || isHydrating) return;
    
    const fitState = state.fitState;
    const prevFitState = prev ? prev.fitState : undefined;
    if (JSON.stringify(fitState) === JSON.stringify(prevFitState)) return;
    
    if (fitState) {
      idbSet('serena_fit_state_idb', fitState).catch(console.error);
      localStorage.setItem('serena_fit_state', JSON.stringify(fitState));
    } else {
      // If null, we could remove it, but idbSet handles null just fine.
      idbSet('serena_fit_state_idb', null).catch(console.error);
      localStorage.removeItem('serena_fit_state');
    }
    window.dispatchEvent(new Event('serena_fit_state_changed'));
  });
}

export function cleanupFitProfilePersistence() {
  if (unsub) {
    unsub();
    unsub = null;
  }
  alreadyInitialized = false;
}

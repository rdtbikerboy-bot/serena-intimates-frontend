import { useSellerModeStore } from '@/store/sellerModeStore';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';

let initialized = false;

const KEYS = {
  VEND_ACTIVE: 'serena_vendedora_mode_active_idb',
  VEND_SEL: 'serena_vendedora_selection_idb',
  SHOWROOM: 'serena_showroom_mode_idb',
};

export const initSellerModePersistence = () => {
  if (initialized) return;
  initialized = true;

  const hydrate = async () => {
    try {
      let vendedoraModeActive = await idbGet<boolean>(KEYS.VEND_ACTIVE);
      if (vendedoraModeActive === undefined) {
        const legacy = localStorage.getItem('serena_vendedora_mode_active');
        vendedoraModeActive = legacy === 'true';
        if (legacy) idbSet(KEYS.VEND_ACTIVE, vendedoraModeActive).catch(console.error);
      }

      let vendedoraSelection = await idbGet<string[]>(KEYS.VEND_SEL);
      if (!vendedoraSelection) {
        const legacy = localStorage.getItem('serena_vendedora_selection');
        vendedoraSelection = legacy ? JSON.parse(legacy) : [];
        if (legacy) idbSet(KEYS.VEND_SEL, vendedoraSelection).catch(console.error);
      }

      let showroomMode = false;
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('showroom') === 'true') {
        showroomMode = true;
      } else {
        const savedShowroom = await idbGet<boolean>(KEYS.SHOWROOM);
        if (savedShowroom !== undefined) {
          showroomMode = savedShowroom;
        }
      }

      useSellerModeStore.getState().hydrateSellerMode({
        vendedoraModeActive: !!vendedoraModeActive,
        vendedoraSelection: vendedoraSelection || [],
        showroomMode: !!showroomMode,
      });
    } catch (e) {
      console.error('Error hydrating Seller Mode', e);
      useSellerModeStore.getState().hydrateSellerMode({
        vendedoraModeActive: false,
        vendedoraSelection: [],
        showroomMode: false,
      });
    }
  };

  hydrate();

  useSellerModeStore.subscribe(
    (state, prev) => {
      const slice = {
        vendedoraModeActive: state.vendedoraModeActive,
        vendedoraSelection: state.vendedoraSelection,
        showroomMode: state.showroomMode,
      };
      const prevSlice = prev ? {
        vendedoraModeActive: prev.vendedoraModeActive,
        vendedoraSelection: prev.vendedoraSelection,
        showroomMode: prev.showroomMode,
      } : undefined;

      if (JSON.stringify(slice) === JSON.stringify(prevSlice)) return;
      
      if (typeof window !== 'undefined') {
        if (!prevSlice || slice.vendedoraModeActive !== prevSlice.vendedoraModeActive) {
          idbSet(KEYS.VEND_ACTIVE, slice.vendedoraModeActive).catch(console.error);
        }
        
        if (!prevSlice || slice.vendedoraSelection !== prevSlice.vendedoraSelection) {
          if (slice.vendedoraSelection.length > 0) {
            idbSet(KEYS.VEND_SEL, slice.vendedoraSelection).catch(console.error);
          } else {
            idbDel(KEYS.VEND_SEL).catch(console.error);
          }
        }

        if (!prevSlice || slice.showroomMode !== prevSlice.showroomMode) {
          idbSet(KEYS.SHOWROOM, slice.showroomMode).catch(console.error);
        }
      }
    }
  );
};

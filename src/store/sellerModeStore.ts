import { create } from 'zustand';

export interface SellerModeState {
  _hasHydrated: boolean;
  vendedoraModeActive: boolean;
  vendedoraSelection: string[];
  showroomMode: boolean;

  setVendedoraModeActive: (active: boolean) => void;
  toggleCurationSelect: (productId: string) => void;
  clearCurationSelection: () => void;
  setShowroomMode: (active: boolean) => void;
  
  hydrateSellerMode: (payload: {
    vendedoraModeActive: boolean;
    vendedoraSelection: string[];
    showroomMode: boolean;
  }) => void;
}

export const useSellerModeStore = create<SellerModeState>((set, get) => ({
  _hasHydrated: false,
  vendedoraModeActive: false,
  vendedoraSelection: [],
  showroomMode: false,

  setVendedoraModeActive: (active) => set({ vendedoraModeActive: active }),
  
  toggleCurationSelect: (productId) => {
    const { vendedoraSelection } = get();
    if (vendedoraSelection.includes(productId)) {
      set({ vendedoraSelection: vendedoraSelection.filter(id => id !== productId) });
    } else {
      set({ vendedoraSelection: [...vendedoraSelection, productId] });
    }
  },
  
  clearCurationSelection: () => set({ vendedoraSelection: [] }),
  
  setShowroomMode: (active) => set({ showroomMode: active }),

  hydrateSellerMode: ({ vendedoraModeActive, vendedoraSelection, showroomMode }) => 
    set({ vendedoraModeActive, vendedoraSelection, showroomMode, _hasHydrated: true })
}));

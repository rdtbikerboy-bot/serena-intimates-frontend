import { create } from 'zustand';

export interface FitState {
  busto: string | null;
  bombacha: string | null;
}

export interface FitProfileState {
  _hasHydrated: boolean;
  fitState: FitState | null;
  
  updateFitState: (busto: string | null, bombacha: string | null) => void;
  hydrateFitState: (fitState: FitState | null) => void;
}

export const useFitProfileStore = create<FitProfileState>((set) => ({
  _hasHydrated: false,
  fitState: null,
  
  updateFitState: (busto, bombacha) => 
    set({ fitState: { busto, bombacha } }),
    
  hydrateFitState: (fitState) => 
    set({ fitState, _hasHydrated: true }),
}));

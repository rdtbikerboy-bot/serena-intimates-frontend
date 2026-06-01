"use client";

import { create } from "zustand";
import { Product } from "@/core/types";

interface UIState {
  // Drawers
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isSizeGuideOpen: boolean;
  isHelpOpen: boolean;
  isAdminOpen: boolean;
  isEditorialOpen: boolean;
  isPasscodeOpen: boolean;
  isTurnoOpen: boolean; // Turnos de Showroom (Fase 20)
  // New Checkout drawer state
  isCheckoutOpen: boolean;

  // Selection
  activeStory: any | null;
  selectedProduct: Product | null;
  selectedSize: string | null;

  // Actions
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setSizeGuideOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  setAdminOpen: (open: boolean) => void;
  setEditorialOpen: (open: boolean) => void;
  setPasscodeOpen: (open: boolean) => void;
  setTurnoOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;

  setActiveStory: (story: any | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedSize: (size: string | null) => void;

  closeAllDrawers: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // initial values
  isCartOpen: false,
  isWishlistOpen: false,
  isSizeGuideOpen: false,
  isHelpOpen: false,
  isAdminOpen: false,
  isEditorialOpen: false,
  isPasscodeOpen: false,
  isTurnoOpen: false,
  isCheckoutOpen: false,

  activeStory: null,
  selectedProduct: null,
  selectedSize: null,

  // setters
  setCartOpen: (open) => set({ isCartOpen: open }),
  setWishlistOpen: (open) => set({ isWishlistOpen: open }),
  setSizeGuideOpen: (open) => set({ isSizeGuideOpen: open }),
  setHelpOpen: (open) => set({ isHelpOpen: open }),
  setAdminOpen: (open) => set({ isAdminOpen: open }),
  setEditorialOpen: (open) => set({ isEditorialOpen: open }),
  setPasscodeOpen: (open) => set({ isPasscodeOpen: open }),
  setTurnoOpen: (open) => set({ isTurnoOpen: open }),
  setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

  setActiveStory: (story) => set({ activeStory: story }),
  setSelectedProduct: (product) => set({ selectedProduct: product, selectedSize: null }),
  setSelectedSize: (size) => set({ selectedSize: size }),

  closeAllDrawers: () =>
    set({
      isCartOpen: false,
      isWishlistOpen: false,
      isSizeGuideOpen: false,
      isHelpOpen: false,
      isAdminOpen: false,
      isEditorialOpen: false,
      isPasscodeOpen: false,
      isTurnoOpen: false,
      isCheckoutOpen: false,
      selectedProduct: null,
      activeStory: null,
    }),
}));

// src/services/checkoutBusinessState.ts
"use client";

import { create } from "zustand";

/**
 * Business‑level state for the checkout funnel.
 * This is separate from the UI‑only status used in the drawer.
 */
export type BusinessStatus =
  | "idle" // no interaction yet
  | "lead" // UI opened, user started checkout
  | "intent" // validation passed, intent captured
  | "processing" // WhatsApp link opened & order persisting
  | "completed"; // sale confirmed (future integration)

interface BusinessState {
  status: BusinessStatus;
  // Optional timestamps for analytics
  startedAt?: number;
  intentAt?: number;
  processedAt?: number;
  completedAt?: number;

  setStatus: (s: BusinessStatus) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  status: "idle" as BusinessStatus,
};

export const useBusinessStore = create<BusinessState>((set) => ({
  ...INITIAL_STATE,
  startedAt: undefined,
  intentAt: undefined,
  processedAt: undefined,
  completedAt: undefined,

  setStatus: (s) =>
    set((state) => {
      const now = Date.now();
      const updates: Partial<BusinessState> = { status: s };
      if (s === "lead") updates.startedAt = now;
      if (s === "intent") updates.intentAt = now;
      if (s === "processing") updates.processedAt = now;
      if (s === "completed") updates.completedAt = now;
      return updates;
    }),
  reset: () => set({ ...INITIAL_STATE, startedAt: undefined, intentAt: undefined, processedAt: undefined, completedAt: undefined }),
}));

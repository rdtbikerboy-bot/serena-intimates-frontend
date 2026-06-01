// src/store/useCheckoutStore.ts
"use client";

import { create } from "zustand";

/**
 * Checkout state machine for the assisted-checkout flow.
 *
 * // Status transitions:
 * //   idle → editing → confirming → processing
 *
 * - `idle`       : drawer closed or just opened (step 1 – summary)
 * - `editing`    : user is filling customer data (step 2)
 * - `confirming` : user reviews info message (step 3) / final confirmation (step 4)
 * - `processing` : sending WhatsApp link, persisting order, etc.
 */
export type CheckoutStatus = "idle" | "editing" | "confirming" | "processing";

interface CheckoutState {
  // Wizard step (1-4)
  step: number;

  // State machine
  status: CheckoutStatus;
  loading: boolean;
  errors: Record<string, string>;

  // Customer data
  customerName: string;
  phone: string;
  city: string;

  // Actions – step navigation
  setStep: (s: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Actions – state machine
  setStatus: (s: CheckoutStatus) => void;
  setLoading: (l: boolean) => void;

  // Actions – validation
  setError: (field: string, message: string) => void;
  clearErrors: () => void;
  clearError: (field: string) => void;

  // Actions – customer data
  setCustomerName: (v: string) => void;
  setPhone: (v: string) => void;
  setCity: (v: string) => void;

  // Actions – lifecycle
  reset: () => void;
}

const INITIAL_STATE = {
  step: 1,
  status: "idle" as CheckoutStatus,
  loading: false,
  errors: {} as Record<string, string>,
  customerName: "",
  phone: "",
  city: "",
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  ...INITIAL_STATE,

  // Step navigation
  setStep: (s) => set({ step: s }),
  nextStep: () => {
    const { step } = get();
    if (step < 4) set({ step: step + 1 });
  },
  prevStep: () => {
    const { step } = get();
    if (step > 1) set({ step: step - 1 });
  },

  // State machine
  setStatus: (s) => set({ status: s }),
  setLoading: (l) => set({ loading: l }),

  // Validation
  setError: (field, message) =>
    set((state) => ({ errors: { ...state.errors, [field]: message } })),
  clearErrors: () => set({ errors: {} }),
  clearError: (field) =>
    set((state) => {
      const next = { ...state.errors };
      delete next[field];
      return { errors: next };
    }),

  // Customer data
  setCustomerName: (v) => set({ customerName: v }),
  setPhone: (v) => set({ phone: v }),
  setCity: (v) => set({ city: v }),

  // Full reset
  reset: () => set({ ...INITIAL_STATE }),
}));

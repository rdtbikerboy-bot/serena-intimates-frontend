// src/store/checkoutUIStatus.ts
"use client";

/**
 * UI‑only status values for the checkout drawer.
 * These replace the previous `CheckoutStatus` which mixed UI and business concepts.
 *
 * - `idle`        – drawer closed or just opened (summary view).
 * - `editing`     – user is filling in customer data.
 * - `confirming`  – user is reviewing the info before sending.
 * - `processing` – orchestrator is generating the WhatsApp link and persisting data.
 */
export type CheckoutUIStatus =
  | "idle"
  | "editing"
  | "confirming"
  | "processing";

// NOTE: Existing `useCheckoutStore` still exports its own `CheckoutStatus` for backward
// compatibility. UI components should migrate to `CheckoutUIStatus` when ready.

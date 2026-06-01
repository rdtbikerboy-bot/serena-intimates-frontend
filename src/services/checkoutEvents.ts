// src/services/checkoutEvents.ts
"use client"

/**
 * Simple analytics/event tracking layer for the assisted checkout flow.
 *
 * This module now supports the full **Revenue Analytics Engine** model:
 *   Lead → Checkout Intent → WhatsApp Open → WhatsApp Engagement → Sale
 * It also tracks abandonment at two critical points.
 *
 * In production this can be swapped for a real analytics provider; for now we
 * forward everything to the central `serenaLogger`.
 */
import { serenaLogger } from "@/core/logger"

/**
 * Allowed event names for the checkout/revenue flow. Adding a new event only
 * requires extending this union – the rest of the code stays unchanged.
 */
export type CheckoutEventName =
  // Core checkout lifecycle
  | "checkout_started"
  | "checkout_intent" // intent captured after validation (lead)
  | "checkout_failed_validation"
  // WhatsApp interaction
  | "whatsapp_opening"
  | "whatsapp_opened"
  | "whatsapp_engaged" // user replies / conversation started
  // Revenue conversion (future)
  | "sale_confirmed"
  // Abandonment detection
  | "checkout_abandoned"
  | "whatsapp_abandoned"
  // Legacy (kept for backward compatibility – no‑op in new flow)
  | "checkout_validated"
  | "checkout_completed_intent"

/**
 * Record a checkout / revenue event.
 * @param name Event identifier (must be one of `CheckoutEventName`).
 * @param data Optional payload with contextual information.
 */
export function trackCheckoutEvent(
  name: CheckoutEventName,
  data?: Record<string, unknown>
): void {
  if (data) {
    serenaLogger.info(`[Checkout Event] ${name}`, data)
  } else {
    serenaLogger.info(`[Checkout Event] ${name}`)
  }
}

/**
 * Track when the user abandons the checkout flow **before** clicking the
 * WhatsApp link (e.g., closes the drawer, navigates away).
 */
export function trackCheckoutAbandoned(): void {
  trackCheckoutEvent("checkout_abandoned")
}

/**
 * Track when the WhatsApp window is opened but there is no subsequent user
 * interaction (e.g., no message sent). This can be called after a timeout
 * or a UI "blur" event on the WhatsApp tab.
 */
export function trackWhatsAppAbandoned(): void {
  trackCheckoutEvent("whatsapp_abandoned")
}

/**
 * Placeholder for future engagement detection – to be called from the UI when
 * the user replies to the pre‑filled WhatsApp message.
 */
export function trackWhatsAppEngaged(): void {
  trackCheckoutEvent("whatsapp_engaged")
}

/**
 * Placeholder for a final sale confirmation (manual or CRM‑driven).
 */
export function trackSaleConfirmed(): void {
  trackCheckoutEvent("sale_confirmed")
}

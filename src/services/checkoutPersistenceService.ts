// src/services/checkoutPersistenceService.ts
"use client";

import { supabase, isSupabaseConfigured } from "@/services/supabase";
import { serenaLogger } from "@/core/logger";

/**
 * Payload shape that will be stored in Supabase `orders` table.
 */
export interface OrderPayload {
  name: string;
  phone: string;
  city: string;
  items: Array<{
    id: string;
    title: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  created_at: string; // ISO timestamp
}

/**
 * Persist an order in Supabase.
 * This is fire‑and‑forget: errors are logged but never block the checkout flow.
 */
export async function persistOrder(payload: OrderPayload): Promise<void> {
  if (!isSupabaseConfigured()) {
    serenaLogger.warn("Supabase not configured – skipping order persistence");
    return;
  }
  try {
    await supabase.from("orders").insert([payload]);
    serenaLogger.info("Order tracking saved to Supabase", { payload });
  } catch (err) {
    // Do NOT rethrow – checkout must continue.
    serenaLogger.error("Supabase order tracking failed", err as Error);
  }
}

// src/services/checkoutPersistenceService.ts
"use client";

import { supabase } from "@/services/supabase";
import { serenaLogger } from "@/core/logger";

/**
 * Persists an order to Supabase.
 * This layer is solely responsible for the infrastructure call.
 * No ID generation, no fallback, no business validation.
 */
export async function persistOrder(payload: any): Promise<any> {
  try {
    const { data, error } = await supabase.from("orders").insert([payload]).select();
    if (error) throw error;
    serenaLogger.info("Order persisted to Supabase", { orderId: data?.[0]?.id ?? payload.id });
    return data?.[0] ?? payload;
  } catch (err) {
    serenaLogger.error("Supabase order persistence failed", err as Error);
    throw err; // let caller decide fallback
  }
}

// src/store/effects/funnelPipeline.ts
"use client";

import { SalesFunnelEvent } from "@/core/types";

import { useFunnelStore } from "@/store/useFunnelStore";
// Remove duplicate setState line at line 38
import { supabase, isSupabaseConfigured } from "@/services/supabase";
import { serenaLogger } from "@/core/logger";

const LS_KEY = "serena_sales_funnel_events";

// Module‑scoped state for the pipeline
let isHydrating = false;
let lastSyncedIndex = 0; // cursor for events already sent to Supabase
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;

// Configuration constants (from implementation plan)
const DEBOUNCE_MS = 5000; // 5 s debounce window
const MAX_QUEUE_SIZE = 50; // flush immediately when ≥ 50 pending events
const MAX_RETRIES = 3; // exponential back‑off retries
const MAX_EVENTS_STORED = 500; // cap for localStorage persistence

/**
 * Initialise the external funnel pipeline.
 * Hydrates the store from localStorage, then starts observers for
 * persistence and batched Supabase sync.
 */
export async function initFunnelPipeline() {
  if (typeof window === "undefined" || isHydrating) return;
  isHydrating = true;

  try {
    // 1️⃣ Hydration from localStorage
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      // Fixed parsing with proper type and single state update
      const parsed: SalesFunnelEvent[] = JSON.parse(saved);
      useFunnelStore.setState({ events: parsed, _hasHydrated: true });
    } else {
      useFunnelStore.setState({ _hasHydrated: true });
    }
  } catch (e) {
    serenaLogger.error("FunnelPipeline: Error during hydration", e);
    useFunnelStore.setState({ _hasHydrated: true });
  } finally {
    isHydrating = false;
  }

  // 2️⃣ Start observers
  startPersistenceObserver();
  startSyncObserver();
}

/**
 * Observer that reacts to any change in `events` after hydration and
 * persists the truncated list to localStorage.
 */
function startPersistenceObserver() {
  useFunnelStore.subscribe((state, prevState) => {
    if (!state._hasHydrated || isHydrating) return;
    if (state.events === prevState.events) return;

    try {
      // Keep only the most recent MAX_EVENTS_STORED events (FIFO)
      const toStore = state.events.slice(-MAX_EVENTS_STORED);
      localStorage.setItem(LS_KEY, JSON.stringify(toStore));
    } catch (e) {
      serenaLogger.error("FunnelPipeline: localStorage write failure", e);
    }
  });
}

/**
 * Observer that watches for new events and schedules batched uploads to Supabase.
 */
function startSyncObserver() {
  useFunnelStore.subscribe((state, prevState) => {
    if (!state._hasHydrated || isHydrating) return;
    if (state.events === prevState.events) return;
    if (!isSupabaseConfigured()) return;

    const pendingCount = state.events.length - lastSyncedIndex;

    // Immediate flush when we hit the max queue size
    if (pendingCount >= MAX_QUEUE_SIZE) {
      scheduleFlush(0);
      return;
    }

    // Debounced flush for normal operation
    scheduleFlush(DEBOUNCE_MS);
  });
}

/** Schedule a flush after `delayMs` milliseconds, cancelling any previous timer. */
function scheduleFlush(delayMs: number) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => flushToSupabase(), delayMs);
}

/** Perform the batched upload to Supabase. */
async function flushToSupabase() {
  flushTimer = null;
  if (!isSupabaseConfigured()) return;

  const { events } = useFunnelStore.getState();
  const pending = events.slice(lastSyncedIndex);
  if (pending.length === 0) return;

  const payload = pending.map(e => ({
    product_id: e.product_id || null,
    client_id: e.client_id || null,
    event_type: e.event_type,
    metadata: e.metadata,
  }));

  try {
    const { error } = await supabase.from("sales_funnel_events").insert(payload);
    if (!error) {
      lastSyncedIndex = events.length; // all pending events are now synced
      retryCount = 0;
      serenaLogger.info(`FunnelPipeline: Synced ${pending.length} events to Supabase.`);
    } else {
      handleFlushError(error);
    }
  } catch (e) {
    handleFlushError(e);
  }
}

/** Handle errors from the flush operation with exponential back‑off. */
function handleFlushError(error: any) {
  retryCount++;
  if (retryCount <= MAX_RETRIES) {
    const backoff = Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
    serenaLogger.warn(`FunnelPipeline: Retry ${retryCount}/${MAX_RETRIES} in ${backoff}ms`, error);
    scheduleFlush(backoff);
  } else {
    serenaLogger.error("FunnelPipeline: Max retries reached, events remain pending in localStorage.", error);
    retryCount = 0; // reset for future attempts
  }
}

// Optional: flush on page unload to reduce loss (uses sendBeacon if available)
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // Attempt a synchronous flush; ignore retries here
      try {
        const { events } = useFunnelStore.getState();
        const pending = events.slice(lastSyncedIndex);
        if (pending.length && isSupabaseConfigured()) {
          const payload = JSON.stringify(pending.map(e => ({
            product_id: e.product_id || null,
            client_id: e.client_id || null,
            event_type: e.event_type,
            metadata: e.metadata,
          })));
          const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "") + "/rest/v1/sales_funnel_events";
          navigator.sendBeacon(url, payload);
        }
      } catch (_) {}
    }
  });
}

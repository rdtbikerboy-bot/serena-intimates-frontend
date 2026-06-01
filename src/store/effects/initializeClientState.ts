"use client";

import { initCartPersistence } from "./cartPersistence";
import { initFavoritesPersistence } from "./favoritesPersistence";
import { initFunnelPipeline } from "./funnelPipeline";
import { initFitProfilePersistence } from "./fitProfilePersistence";
import { initSellerModePersistence } from "./sellerModePersistence";
import { initCatalogPreferencesPersistence } from "./catalogPreferencesPersistence";
import { initRecommendationSignalsPersistence } from "./recommendationSignalsPersistence";

let alreadyInitialized = false;
/**
 * Orchestrates client‑side state initialization.
 * – Lightweight, declarative, idempotent.
 * – SSR‑safe (no work on the server).
 * – Guarantees deterministic bootstrap ordering.
 */
export function initClientState() {
  if (typeof window === "undefined" || alreadyInitialized) return;
  alreadyInitialized = true;

  // Deterministic order – lower‑level stores first.
  initCartPersistence();               // independent cart state
  initFavoritesPersistence();          // UI favorites early
  initFitProfilePersistence();         // fit profile for affinity
  initSellerModePersistence();         // seller‑mode UI flags
  initCatalogPreferencesPersistence(); // filter preferences
  initRecommendationSignalsPersistence(); // depends on fit & prefs
  initFunnelPipeline();               // analytics – last
}

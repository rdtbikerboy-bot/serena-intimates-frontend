import { create } from "zustand";
import { SalesFunnelEvent, FunnelEventType } from "@/core/types";
import { attributionHelper } from "@/core/attribution";

interface FunnelState {
  events: SalesFunnelEvent[];
  _hasHydrated: boolean; // flag to avoid operations before hydration
  // Public action, synchronous and side‑effect free
  trackEvent: (
    eventType: FunnelEventType,
    productId?: string,
    clientId?: string,
    metadata?: Record<string, any>
  ) => void;
  // Maintains public signature but is delegated to external pipeline
  syncWithSupabase: () => Promise<void>;
  getProductViewsCount: (productId: string) => number;
  hydrate: () => void; // no‑op, external pipeline handles hydration
}

export const useFunnelStore = create<FunnelState>((set, get) => ({
  events: [],
  _hasHydrated: false,
  hydrate: () => {
    // No‑op: real hydration performed by external pipeline
  },
  trackEvent: (eventType, productId, clientId, metadata = {}) => {
    const attr = attributionHelper.getStored();
    const newEvent: SalesFunnelEvent = {
      product_id: productId,
      client_id: clientId,
      event_type: eventType,
      metadata: {
        ...attr,
        ...metadata,
        source: attr.utm_source || "direct",
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };
    // Pure append‑only mutation
    set(state => ({ events: [...state.events, newEvent] }));
  },
  // Stub: actual sync logic lives in external pipeline
  syncWithSupabase: async () => {},
  getProductViewsCount: productId =>
    get().events.filter(e => e.product_id === productId && e.event_type === "VIEWED").length,
}));


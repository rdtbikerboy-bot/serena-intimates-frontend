// =====================================================================
// UX LOGGER SERVICE (Fase 15)
// =====================================================================

import { supabase, isSupabaseConfigured } from "@/services/supabase";

type UXEventType = 'product_open' | 'drop_explore' | 'favorite_add' | 'reservation_start' | 'whatsapp_abandon' | 'dwell_time' | 'rage_click';

interface UXEventPayload {
  eventType: UXEventType;
  context?: Record<string, any>;
}

class UXLogger {
  private clickRecords: number[] = [];
  private sessionStart: number = Date.now();

  constructor() {
    this.initRageClickDetector();
  }

  private initRageClickDetector() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('click', () => {
      const now = Date.now();
      this.clickRecords.push(now);
      
      // Keep only clicks from the last 2 seconds
      this.clickRecords = this.clickRecords.filter(t => now - t < 2000);
      
      if (this.clickRecords.length >= 5) {
        this.logEvent('rage_click', { url: window.location.pathname });
        this.clickRecords = []; // Reset after logging
      }
    });
  }

  public async logEvent(eventType: UXEventType, context: Record<string, any> = {}) {
    if (typeof window === 'undefined') return;

    if (isSupabaseConfigured()) {
      try {
        // Ejecución "fire and forget" para no bloquear la UI
        supabase.from('ux_events').insert({
          event_type: eventType,
          context
        }).then(({ error }) => {
          if (error) console.error("UXLogger Error:", error);
        });
      } catch (e) {
        // Silencioso
      }
    } else {
      // Offline / Local Storage Fallback
      const key = "serena_ux_events_temp";
      const saved = localStorage.getItem(key);
      const list = saved ? JSON.parse(saved) : [];
      list.push({ eventType, context, timestamp: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(list));
    }
  }

  public trackDwellTime(productId: string, startTime: number) {
    const duration = Date.now() - startTime;
    if (duration > 3000) { // Solo trackea si estuvo más de 3 segundos
      this.logEvent('dwell_time', { productId, durationMs: duration });
    }
  }
}

export const uxLogger = new UXLogger();

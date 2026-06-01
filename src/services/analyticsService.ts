// =====================================================================
// ANALYTICSSERVICE.TS — MOTOR DE MÉTRICAS COMERCIALES Y PERSISTENCIA NUBE
// =====================================================================
// Sincroniza las interacciones comerciales del embudo (vistas, compartidos,
// reservas, checkout) en la tabla `interaction_analytics` de Supabase.
// =====================================================================

import { supabase, isSupabaseConfigured } from "./supabase";
import { SERENA_CONFIG } from "@/core/config";
import { serenaLogger } from "@/core/logger";

interface EventPayload {
  brand?: string;
  productId?: string;
  drop?: string;
  price?: number;
  size?: string;
  [key: string]: any;
}

export const analyticsService = {
  /**
   * Registra un evento de interacción comercial de forma local y remota.
   */
  async trackEvent(eventName: string, category?: string, payload: EventPayload = {}): Promise<void> {
    const eventTime = new Date().toISOString();
    
    // 1. Registrar localmente para visualización ultra-veloz del dashboard (localStorage)
    this.updateLocalMetrics(eventName, payload);

    // 2. Reportar a Supabase (Relational Database)
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("interaction_analytics").insert({
          event_name: eventName,
          category: category || payload.brand || "general",
          payload: {
            ...payload,
            client_timestamp: eventTime,
            platform: "mobile-web-android"
          }
        });
        if (error) throw error;
        serenaLogger.info(`KPI Registrado en la nube: '${eventName}'`, payload);
      } catch (err) {
        serenaLogger.warn(`Sincronización Diferida: Evento '${eventName}' encolado localmente.`);
        this.enqueueOfflineSync(eventName, category, payload);
      }
    } else {
      serenaLogger.info(`KPI Registrado offline: '${eventName}'`, payload);
    }
  },

  /**
   * Actualiza el agregado acumulativo en local storage para despliegues offline resilientes.
   */
  updateLocalMetrics(eventName: string, payload: EventPayload) {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(SERENA_CONFIG.keys.analyticsMetrics) || "{}";
      const metrics = JSON.parse(saved);

      if (!metrics.brandViews) metrics.brandViews = {};
      if (!metrics.productViews) metrics.productViews = {};
      if (!metrics.brandShares) metrics.brandShares = {};
      if (!metrics.productShares) metrics.productShares = {};
      if (!metrics.brandReservations) metrics.brandReservations = {};
      if (!metrics.brandCheckouts) metrics.brandCheckouts = {};

      const brand = payload.brand;
      const prodId = payload.productId;

      if (eventName === "product_detail_view" && brand) {
        metrics.brandViews[brand] = (metrics.brandViews[brand] || 0) + 1;
        if (prodId) metrics.productViews[prodId] = (metrics.productViews[prodId] || 0) + 1;
      }
      
      if (eventName === "share_wishlist" || eventName === "share_vendedora") {
        if (brand) metrics.brandShares[brand] = (metrics.brandShares[brand] || 0) + 1;
        if (prodId) metrics.productShares[prodId] = (metrics.productShares[prodId] || 0) + 1;
      }

      if (eventName === "add_to_cart" && brand) {
        metrics.brandReservations[brand] = (metrics.brandReservations[brand] || 0) + 1;
      }

      if (eventName === "whatsapp_checkout_clicked" && brand) {
        metrics.brandCheckouts[brand] = (metrics.brandCheckouts[brand] || 0) + 1;
      }

      localStorage.setItem(SERENA_CONFIG.keys.analyticsMetrics, JSON.stringify(metrics));
      
      // Emitir evento para actualizar el panel de administración
      window.dispatchEvent(new Event("serena_metrics_updated"));
    } catch (e) {
      serenaLogger.error("Error al actualizar agregación de métricas local.", e);
    }
  },

  /**
   * Cola local para sincronización en background en caso de falla de red.
   */
  enqueueOfflineSync(eventName: string, category?: string, payload: EventPayload = {}) {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(SERENA_CONFIG.keys.syncQueue) || "[]";
      const queue = JSON.parse(saved);
      queue.push({ eventName, category, payload, timestamp: new Date().toISOString() });
      localStorage.setItem(SERENA_CONFIG.keys.syncQueue, JSON.stringify(queue));
    } catch (e) {}
  },

  /**
   * Vacía las analíticas acumuladas para comenzar una nueva etapa de Soft Launch.
   */
  async resetSoftLaunchMetrics(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SERENA_CONFIG.keys.analyticsMetrics);
      window.dispatchEvent(new Event("serena_metrics_updated"));
    }

    if (isSupabaseConfigured()) {
      try {
        // En una aplicación de producción, esto limpiaría o archivaría eventos de prueba
        const { error } = await supabase.from("interaction_analytics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) throw error;
        serenaLogger.info("Métricas de prueba removidas de la base de datos Supabase.");
      } catch (err) {
        serenaLogger.warn("Error al intentar purgar métricas de Supabase.");
      }
    }
    serenaLogger.info("Métricas de Soft Launch blanqueadas.");
  }
};

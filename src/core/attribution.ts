import { AttributionParams } from "./types";

export const attributionHelper = {
  /**
   * Captura parámetros UTM y de atribución desde la URL
   */
  captureFromUrl(): AttributionParams {
    if (typeof window === "undefined") return {};
    
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const params: AttributionParams = {};

      const utmSource = searchParams.get("utm_source");
      const utmCampaign = searchParams.get("utm_campaign");
      const ref = searchParams.get("ref");
      const seller = searchParams.get("seller");
      const qr = searchParams.get("qr");

      if (utmSource) params.utm_source = utmSource;
      if (utmCampaign) params.utm_campaign = utmCampaign;
      if (ref) params.ref = ref;
      if (seller) params.seller = seller;
      if (qr) params.qr = qr;

      // Si capturó algo, lo guardamos en localStorage
      if (Object.keys(params).length > 0) {
        const stored = this.getStored();
        const updated = { ...stored, ...params };
        localStorage.setItem("serena_attribution_params", JSON.stringify(updated));
      }

      return params;
    } catch (e) {
      return {};
    }
  },

  /**
   * Obtiene los parámetros guardados en localStorage
   */
  getStored(): AttributionParams {
    if (typeof window === "undefined") return {};
    
    try {
      const raw = localStorage.getItem("serena_attribution_params");
      if (raw) {
        return JSON.parse(raw) as AttributionParams;
      }
    } catch (e) {}
    return {};
  },

  /**
   * Limpia los parámetros de atribución
   */
  clear(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("serena_attribution_params");
    } catch (e) {}
  }
};

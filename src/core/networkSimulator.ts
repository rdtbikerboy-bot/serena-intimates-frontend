// =====================================================================
// NETWORK SIMULATOR (Fase 15)
// =====================================================================

export type NetworkCondition = "optimal" | "slow_3g" | "offline";

class NetworkSimulator {
  private currentCondition: NetworkCondition = "optimal";

  public get condition(): NetworkCondition {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_network_sim");
      if (saved === "slow_3g" || saved === "offline") {
        return saved as NetworkCondition;
      }
    }
    return this.currentCondition;
  }

  public setCondition(condition: NetworkCondition) {
    this.currentCondition = condition;
    if (typeof window !== "undefined") {
      localStorage.setItem("serena_network_sim", condition);
      // Reload is required to apply the global effect immediately, or we dispatch an event
      window.dispatchEvent(new Event("network_sim_changed"));
    }
  }

  /**
   * Helper que envuelve cualquier promesa e inyecta delays artificiales
   * o lanza error de red si está en modo offline.
   */
  public async simulate<T>(promise: Promise<T>): Promise<T> {
    const c = this.condition;
    
    if (c === "offline") {
      throw new Error("Simulated Offline Mode: No internet connection.");
    }
    
    if (c === "slow_3g") {
      // Retrasar artificialmente entre 2.5s y 4s
      const delay = Math.floor(Math.random() * 1500) + 2500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return promise;
  }
}

export const networkSimulator = new NetworkSimulator();

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🔒 ErrorBoundary atrapó un error fatal en la boutique:", error, errorInfo);
    // Registrar el error de forma asíncrona si Supabase está disponible
    if (typeof window !== "undefined") {
      try {
        const payload = {
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem("serena_last_critical_error", JSON.stringify(payload));
      } catch (e) {}
    }
  }

  private handleRecovery = () => {
    if (typeof window !== "undefined") {
      try {
        // Limpiar cachés visuales no críticos para forzar estado limpio
        localStorage.removeItem("serena_products_catalog");
        window.location.reload();
      } catch (e) {
        window.location.href = "/";
      }
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-serena-cream flex flex-col justify-center items-center p-6 text-center font-sans text-serena-charcoal selection:bg-serena-blush/40 selection:text-serena-charcoal">
          <div className="max-w-md p-8 bg-white/70 backdrop-blur-md rounded-[30px] border border-serena-blush/40 shadow-[0_15px_40px_rgba(26,21,18,0.08)] flex flex-col items-center gap-6">
            
            {/* Ícono Editorial */}
            <div className="w-14 h-14 rounded-full bg-serena-blush/20 flex items-center justify-center text-serena-gold animate-pulse">
              <AlertCircle className="w-8 h-8" />
            </div>

            {/* Encabezado Satinado */}
            <div className="space-y-2">
              <h1 className="font-editorial text-2xl font-bold tracking-wide italic">
                🩰 Desajuste de Seda
              </h1>
              <p className="text-[10px] text-serena-gold uppercase tracking-widest font-bold">
                Boutique Emocional & Control de Resiliencia
              </p>
            </div>

            {/* Mensaje de seda */}
            <p className="text-xs leading-relaxed text-serena-charcoal/70">
              Ocurrió un leve desajuste técnico al procesar las prendas premium. No te preocupes, tus productos favoritos y Wishlist siguen a salvo en este dispositivo.
            </p>

            {/* Detalle técnico del error (solo admin o vendedora para auditar) */}
            <div className="w-full text-left p-3.5 bg-serena-silk/40 rounded-2xl border border-serena-blush/10 font-mono text-[9px] text-serena-charcoal/50 max-h-24 overflow-y-auto custom-scroll">
              <span className="font-bold text-red-500">[ERROR] </span>
              {this.state.error?.message || "Error indefinido en el hilo principal de React."}
            </div>

            {/* Botón de Recuperación */}
            <button
              onClick={this.handleRecovery}
              className="w-full bg-serena-gold text-white text-[10px] font-bold py-4 rounded-2xl uppercase tracking-widest active:scale-95 smooth-transition shadow-2xs hover:opacity-90 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Restaurar Catálogo de Seda
            </button>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

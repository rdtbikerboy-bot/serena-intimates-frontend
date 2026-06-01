"use client";

import React, { useState, useEffect } from "react";
import { CatalogGrid } from "@/features/catalog/CatalogGrid";
import { TabBar } from "@/components/ui-premium/TabBar";
import { ExpressSellerBar } from "@/components/ui-premium/ExpressSellerBar";
import { ProductDrawer } from "@/components/ui-premium/ProductDrawer";
import { HelpDrawer } from "@/components/ui-premium/HelpDrawer";
import { SizeGuideDrawer } from "@/components/ui-premium/SizeGuideDrawer";
import { TurnoDrawer } from "@/components/ui-premium/TurnoDrawer";
import { CartDrawer } from "@/components/ui-premium/CartDrawer";
import { useUIStore } from "@/store/useUIStore";
import { useFunnelStore } from "@/store/useFunnelStore";
import { initFunnelPipeline } from "@/store/effects/funnelPipeline";
import { initFitProfilePersistence } from "@/store/effects/fitProfilePersistence";
import { initSellerModePersistence } from "@/store/effects/sellerModePersistence";
import { initCatalogPreferencesPersistence } from "@/store/effects/catalogPreferencesPersistence";
import { useFitProfileStore } from "@/store/fitProfileStore";
import { useSellerModeStore } from "@/store/sellerModeStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { initCartPersistence } from "@/store/effects/cartPersistence";
import { useCartStore } from "@/store/useCartStore";

export default function Page() {
  const [activeTab, setActiveTab] = useState("discover");
  
  useEffect(() => {
    initFunnelPipeline();
    initCartPersistence();
    initFitProfilePersistence();
    initSellerModePersistence();
    initCatalogPreferencesPersistence();
  }, []);
  
  // UI Store para controlar los modales
  const isHelpOpen = useUIStore(s => s.isHelpOpen);
  const setHelpOpen = useUIStore(s => s.setHelpOpen);
  const isSizeGuideOpen = useUIStore(s => s.isSizeGuideOpen);
  const setSizeGuideOpen = useUIStore(s => s.setSizeGuideOpen);
  const isTurnoOpen = useUIStore(s => s.isTurnoOpen);
  const setTurnoOpen = useUIStore(s => s.setTurnoOpen);
  const selectedProduct = useUIStore(s => s.selectedProduct);
  const setSelectedProduct = useUIStore(s => s.setSelectedProduct);

  // New Domain Stores
  const fitState = useFitProfileStore((state) => state.fitState);
  const favoritesList = useFavoritesStore((state) => state.favoritesList);
  const setCartOpen = useUIStore(s => s.setCartOpen);
  const cartCount = useCartStore(state => state.cartItems.length);


  return (
    <div className="relative w-full max-w-[420px] mx-auto min-h-screen bg-serena-cream shadow-[0_0_60px_rgba(26,21,18,0.1)] overflow-hidden flex flex-col">
      
      {/* 1. Header / Navbar Principal con Branding */}
      <header className="w-full px-6 py-4 bg-serena-cream flex justify-between items-center border-b border-serena-silk z-20">
        <button onClick={() => setHelpOpen(true)} className="text-serena-charcoal/70 hover:text-serena-gold transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider font-ui">Ayuda</span>
        </button>
        
        <h1 
          onClick={() => setVendedoraModeActive(true)}
          className="font-editorial text-2xl font-bold tracking-widest text-serena-charcoal italic select-none cursor-pointer"
        >
          Serena
        </h1>
        
                <button onClick={() => setCartOpen(true)} className="relative w-8 h-8 flex items-center justify-center hover:opacity-75 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-serena-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* 2. Hero Premium Principal & 3. Contenedor Visual del Catálogo */}
      <main className="flex-1 overflow-y-auto bg-serena-silk px-4 pb-24 pt-3 scrollbar-hide">
        
        {/* Hero Area */}
        <div className="w-full pb-4 pt-1 mb-4 border-b border-serena-blush/20 text-center space-y-2">
          <p className="font-editorial text-xl italic text-serena-charcoal">Colección de Seda</p>
          <p className="text-[10px] uppercase tracking-widest text-serena-charcoal/60 font-bold">Lencería Fina · Ajuste Perfecto</p>
        </div>

        {/* Catálogo Intacto */}
        <CatalogGrid />
      </main>

      {/* 4. TabBar */}
      <TabBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isFitApplied={!!fitState} 
        favoritesCount={favoritesList.length} 
      />

      {/* 5. Drawers Globales Existentes */}
      <ProductDrawer 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
      <HelpDrawer 
        isOpen={isHelpOpen} 
        onClose={() => setHelpOpen(false)} 
      />
      <SizeGuideDrawer 
        isOpen={isSizeGuideOpen} 
        onClose={() => setSizeGuideOpen(false)} 
      />
      <CartDrawer />


      {/* 6. ExpressSellerBar (Admin access) */}
      <ExpressSellerBar />
    </div>
  );
}

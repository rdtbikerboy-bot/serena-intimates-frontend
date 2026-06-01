"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

// Mock product data used when Supabase URL is empty
const MOCK_PRODUCTS = [
  {
    id: "1",
    title: "Conjunto Encaje Noir",
    brand: "Hope",
    category: "Romántico",
    price: 45000,
    color: "Negro",
    badges: ["Nuevo"],
    stockMap: { "S": 2, "M": 3, "L": 1 },
    immediateAvailability: true,
    images: [{ imageUrl: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=400&fm=webp", isCover: true }],
    drop: "Encaje Noir",
    matchTitle: "Conjunto Encaje Noir",
  },
  {
    id: "2",
    title: "Conjunto Nude Serena",
    brand: "Valisere",
    category: "Comfort",
    price: 38000,
    color: "Nude",
    badges: ["Favorito en Salta"],
    stockMap: { "S": 1, "M": 4, "L": 2 },
    immediateAvailability: true,
    images: [{ imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&fm=webp", isCover: true }],
    drop: "Soft Cotton",
    matchTitle: "Conjunto Nude Serena",
  },
  {
    id: "3",
    title: "Set Bridal Marfil",
    brand: "Darling",
    category: "Bridal",
    price: 62000,
    color: "Marfil",
    badges: ["Premium"],
    stockMap: { "S": 2, "M": 2, "L": 1 },
    immediateAvailability: false,
    images: [{ imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&fm=webp", isCover: true }],
    drop: "Bridal Capsule",
    matchTitle: "Set Bridal Marfil",
  },
] as unknown as Product[];

const useMockData = true;

import { Card } from "./Card";
import { productsService } from "@/services/supabaseService";
import { analyticsService } from "@/services/analyticsService";
import { useFitProfileStore } from "@/store/fitProfileStore";
import { useCatalogPreferencesStore } from "@/store/catalogPreferencesStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUIStore } from "@/store/useUIStore";
import { useRecommendationSignalsStore } from "@/store/recommendationSignalsStore";
import { sortProductsBySerenaMemory } from "@/domain/affinity";
import { Product } from "@/core/types";

import { useStableRanking } from "@/hooks/useStableRanking";

export function CatalogGrid() {
  
  // 🐻 1. Suscribir a Filtros y Memoria Serena de Zustand
  const fitState = useFitProfileStore((state) => state.fitState);
  const _hasHydrated = useFitProfileStore((state) => state._hasHydrated); // Using Fit Profile's hydration status as proxy if needed, or we can just assume true since it's immediate
  
  const selectedCategory = useCatalogPreferencesStore((state) => state.selectedCategory);
  const selectedBrand = useCatalogPreferencesStore((state) => state.selectedBrand);
  const activeDrop = useCatalogPreferencesStore((state) => state.activeDrop);

  const favoritesList = useFavoritesStore((state) => state.favoritesList);

  const setSelectedProduct = useUIStore((state) => state.setSelectedProduct);

  // Fase 16: Filtros cromáticos emocionales
  const [selectedColorFilter, setSelectedColorFilter] = React.useState("all");

  const COLOR_FILTERS = [
    { name: "Todos", id: "all", hex: null },
    { name: "Nude Serena", id: "Nude Serena", hex: "#E4D3C5" },
    { name: "Noir Intense", id: "Noir Intense", hex: "#1C1A19" },
    { name: "Moka Satin", id: "Moka Satin", hex: "#7D6355" },
    { name: "Rose Blush", id: "Rose Blush", hex: "#EAC5BD" },
    { name: "Marfil Soft", id: "Marfil Soft", hex: "#F4EFEA" },
    { name: "Oliva Silk", id: "Oliva Silk", hex: "#606C5A" }
  ];

  const { data: products = [], isLoading, isError, refetch } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: useMockData ? () => Promise.resolve(MOCK_PRODUCTS as unknown as Product[]) : productsService.getProducts,
  });

  // Apply stable ranking to base products
  const { rankedProducts, refreshRanking } = useStableRanking(products);

  // 🧠 3. Filtrar Dinámicamente
  const arrangedCatalog = useMemo(() => {
    // A. Filtrar por categoría, marca y drops
    const filtered = rankedProducts.filter((p) => {
      // Si está marcado como oculto en badges, no mostrarlo en catálogo
      if (p.badges?.includes("Oculto")) return false;

      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchesBrand = selectedBrand === "all" || p.brand === selectedBrand;
      const matchesDrop = !activeDrop || p.dropId === activeDrop || p.drop === activeDrop;
      
      // Filtro cromático de la Fase 16
      const matchesColor = selectedColorFilter === "all" || p.color === selectedColorFilter || (p.color === "Nude" && selectedColorFilter === "Nude Serena") || (p.color === "Negro" && selectedColorFilter === "Noir Intense");

      
      return matchesCat && matchesBrand && matchesDrop && matchesColor;
    });

    return filtered;
  }, [rankedProducts, selectedCategory, selectedBrand, activeDrop, selectedColorFilter]);

  const incrementBrandView = useRecommendationSignalsStore((state) => state.incrementBrandView);
  const incrementCategoryView = useRecommendationSignalsStore((state) => state.incrementCategoryView);

  // Manejar click y abrir detalle con tracking
  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);

    // Track behavioral signals for recommendation engine
    incrementBrandView(product.brand);
    incrementCategoryView(product.category);

    // Reportar KPI en segundo plano a Supabase + localStorage
    analyticsService.trackEvent("product_detail_view", product.brand, {
      brand: product.brand,
      productId: product.id,
      drop: product.drop,
      price: product.price,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-serena-charcoal/40">
        <RefreshCw className="w-8 h-8 animate-spin text-serena-gold" />
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Revelando tu Catálogo de Seda...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
        <p className="text-xs text-red-500 font-bold uppercase tracking-widest">
          Hubo un problema de conexión
        </p>
        <p className="text-[10px] text-serena-charcoal/50 max-w-xs">
          No pudimos conectar con los servidores. Puedes reintentar o seguir explorando la colección local.
        </p>
        <button 
          onClick={() => refetch()}
          className="mt-2 text-[9px] font-bold bg-serena-gold text-white px-4 py-2 rounded-xl uppercase tracking-wider"
        >
          Reintentar Carga
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Fase 16: Selector Cromático Emocional de Serena */}
      <div className="bg-white/50 backdrop-blur-md p-3.5 rounded-[22px] border border-serena-blush/20 space-y-2">
        <span className="text-[9px] font-bold text-serena-charcoal uppercase tracking-widest block font-ui">
          Apreciación Cromática
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {COLOR_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedColorFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 whitespace-nowrap ${
                selectedColorFilter === f.id
                  ? "bg-serena-gold text-white border-serena-gold shadow-md scale-105"
                  : "bg-serena-cream text-serena-charcoal/70 border-serena-blush/40 hover:bg-serena-silk"
              }`}
            >
              {f.hex && (
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-white/40 block shadow-2xs" 
                  style={{ backgroundColor: f.hex }} 
                />
              )}
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Indicador Silencioso de Memoria Activa & Sorpresa */}
      {fitState && (
        <div className="flex justify-between items-center p-3 bg-serena-gold/5 rounded-2xl border border-serena-gold/10">
          <span className="text-[9px] text-serena-gold font-bold uppercase tracking-wider flex items-center gap-1.5 font-ui">
            ✨ Diseñado para tu Silueta (Talle {fitState.busto})
          </span>
        </div>
      )}

      {/* Grilla Editorial / Estado Vacío */}
      {arrangedCatalog.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-20 text-center px-6 gap-2">
          <p className="text-xs text-serena-charcoal/40 font-bold uppercase tracking-widest">
            Colección en Preparación
          </p>
          <p className="text-[9px] text-serena-charcoal/50 max-w-xs leading-relaxed">
            No encontramos looks de lencería bajo este color en la selección actual.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {arrangedCatalog.map((product) => (
            <Card 
              key={product.id}
              product={product}
              recommendedSize={fitState?.busto || null}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

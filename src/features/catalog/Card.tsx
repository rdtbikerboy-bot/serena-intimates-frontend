"use client";

import React from "react";
import { ImageLoader } from "@/components/ui-premium/ImageLoader";
import { Product } from "@/core/types";
import { AffinityResult } from "@/domain/affinity";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useSellerModeStore } from "@/store/sellerModeStore";
import { SERENA_CONFIG } from "@/core/config";
import { Heart, Sparkles } from "lucide-react";

// Mapeo aspiracional de Moods (Mejora 5)
const MOOD_DESCRIPTIONS: Record<string, string> = {
  "dia-a-dia": "Esencial para tu ritmo",
  "comodo-y-suave": "Abrazo de algodón",
  "noche-especial": "Poder y magnetismo",
  "invisible": "Segunda piel",
  "elegancia-minimalista": "Menos es más",
  "sensual-delicado": "Romance en encaje",
  "bridal": "El sí más suave",
  "lounge": "Relax premium"
};

interface CardProps {
  product: Product & { _affinity?: AffinityResult };
  recommendedSize: string | null;
  onOpenDetail: (product: Product) => void;
}

export function Card({ 
  product, 
  recommendedSize, 
  onOpenDetail,
}: CardProps) {
  
  // 🐻 Suscribir de manera reactiva al store de Memoria Serena
  const favoritesList = useFavoritesStore((state) => state.favoritesList);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  
  const vendedoraModeActive = useSellerModeStore((state) => state.vendedoraModeActive);
  const vendedoraSelection = useSellerModeStore((state) => state.vendedoraSelection);
  const toggleCurationSelect = useSellerModeStore((state) => state.toggleCurationSelect);

  // Estado del Tooltip de Mood Aspiracional
  const [showMoodTooltip, setShowMoodTooltip] = React.useState(false);

  // Fase 16: Swatches cromáticos táctiles
  const [selectedColor, setSelectedColor] = React.useState(product.color || "Nude Serena");

  const swatches = [
    { name: "Nude Serena", hex: "#E4D3C5" },
    { name: "Noir Intense", hex: "#1C1A19" },
    { name: "Rose Blush", hex: "#EAC5BD" },
    { name: "Moka Satin", hex: "#7D6355" }
  ];

  const isFavorite = favoritesList.includes(product.title);
  const isSelectedForCuration = vendedoraSelection.includes(product.id);

  const handleCardClick = () => {
    if (vendedoraModeActive) {
      toggleCurationSelect(product.id);
    } else {
      onOpenDetail(product);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previene abrir detalle
    toggleFavorite(product.title);
  };

  // Se extraen talles del stock map o del array por defecto
  const stockMap = product.costUsd ? { "85": 2, "90": 3, "95": 2 } : {}; // Variantes
  const hasRecommendedSize = recommendedSize && product.costUsd ? true : false;

  // Lógica de moderación de badges: máximo 1 badge principal
  const displayBadge = product.badges && product.badges.length > 0 ? product.badges[0] : null;

  return (
    <div 
      className={`bg-serena-cream rounded-2xl overflow-hidden shadow-xs border transition-all duration-300 flex flex-col group cursor-pointer relative ${
        isSelectedForCuration 
          ? "border-serena-gold ring-1 ring-serena-gold shadow-md scale-[0.98]" 
          : "border-serena-blush/20 hover:shadow-md"
      }`}
      onClick={handleCardClick}
    >
      {/* Indicador de Selección Modo Vendedora */}
      {vendedoraModeActive && (
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center justify-center">
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center smooth-transition ${
            isSelectedForCuration 
              ? "bg-serena-gold border-serena-gold text-white" 
              : "bg-serena-cream/90 border-serena-charcoal/30 text-transparent"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" className="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden aspect-[3/4] bg-serena-silk">
        {/* Cargador de imagen progresivo con WebP y tamaño optimizado */}
        <ImageLoader 
          src={product.images?.[0]?.imageUrl || "/placeholder-product.jpg"} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
        
        {/* Marca del Producto */}
        {!vendedoraModeActive && (
          <span className="absolute top-2 left-2 bg-serena-cream/95 text-serena-charcoal text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-serena-blush/20">
            {product.brand}
          </span>
        )}
        
        {/* Stack de Badges y Razones Editoriales */}
        <div className="absolute top-9 left-2 z-10 flex flex-col items-start gap-1.5">
          {displayBadge && (
            <span className="bg-serena-gold/90 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-white/10 backdrop-blur-[2px]">
              ✨ {displayBadge}
            </span>
          )}
          
          {!vendedoraModeActive && product._affinity?.editorialReason && (
             <span className="bg-serena-cream/95 text-serena-gold text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-serena-gold/20 backdrop-blur-[2px]">
              {product._affinity.editorialReason}
             </span>
          )}
        </div>

        {/* Tooltip Aspiracional del Mood (Mejora 5) */}
        {!vendedoraModeActive && (
          <div className="absolute top-2 right-14 z-10">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMoodTooltip(!showMoodTooltip);
                if (!showMoodTooltip) {
                  setTimeout(() => setShowMoodTooltip(false), 2500); // Auto-ocultar en móvil
                }
              }}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-serena-silk/70 hover:bg-serena-cream text-serena-gold shadow-xs border border-serena-blush/20 smooth-transition backdrop-blur-[2px]"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            
            {showMoodTooltip && (
              <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-sm border border-serena-gold/30 rounded-xl px-3 py-2 shadow-lg min-w-[120px] text-center animate-fade-in z-50">
                <p className="text-[9px] uppercase tracking-widest font-bold text-serena-gold mb-0.5">La Experiencia</p>
                <p className="font-editorial text-xs italic text-serena-charcoal">"{MOOD_DESCRIPTIONS[product.mood] || 'Pura Seda'}"</p>
                {/* Triángulo del tooltip */}
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-serena-gold/30 transform rotate-45"></div>
              </div>
            )}
          </div>
        )}

        {/* Botón de Favoritos */}
        {!vendedoraModeActive && (
          <button 
            onClick={handleFavoriteClick} 
            className="absolute top-2 right-2 w-11 h-11 rounded-full bg-serena-cream/90 flex items-center justify-center transition-colors shadow-xs z-10 text-serena-charcoal hover:text-serena-gold active:scale-95"
            aria-label="Añadir a Favoritos"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isFavorite ? "fill-serena-gold text-serena-gold" : "text-serena-charcoal"
              }`}
            />
          </button>
        )}

        {/* Disponibilidad Comercial */}
        <span className={`absolute bottom-2 right-2 text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-xs opacity-95 border backdrop-blur-[1px] ${
          product.immediateAvailability 
            ? "bg-emerald-500/10 text-emerald-800 border-emerald-500/20" 
            : "bg-serena-champagne text-serena-gold border-serena-gold/25"
        }`}>
          {product.immediateAvailability ? "Disponible hoy en Salta" : "Encargo Directo (Brasil)"}
        </span>

        {product.matchTitle && product.immediateAvailability && !vendedoraModeActive && (
          <div className="absolute bottom-2 left-2 bg-serena-cream/90 py-1 px-2 rounded-xl border border-serena-blush/35 shadow-xs flex items-center gap-1 opacity-90 transition-opacity">
            <span className="text-[8px] font-bold text-serena-gold uppercase">Look Completo 🩰</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <span className="text-[8px] font-bold text-serena-gold uppercase tracking-widest block mb-0.5 font-ui">
          {product.brand} Brasil · <span className="text-serena-charcoal/80 font-normal">{selectedColor}</span>
        </span>
        <h4 id="7wnjj8" className="font-editorial text-sm font-semibold text-serena-charcoal leading-tight line-clamp-2">
          {product.title}
        </h4>

        {/* Fase 16: Swatches visuales táctiles */}
        <div className="flex gap-1.5 my-2">
          {swatches.map((sw) => (
            <button
              key={sw.name}
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Evita abrir detalle del producto
                setSelectedColor(sw.name);
              }}
              style={{ backgroundColor: sw.hex }}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 transform active:scale-90 ${
                selectedColor === sw.name 
                  ? "ring-1 ring-serena-gold border-white scale-125 shadow-xs" 
                  : "border-serena-blush/35 hover:scale-105"
              }`}
              title={sw.name}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-baseline mt-1.5 flex-wrap gap-1">
          <span className="text-sm font-bold text-serena-gold font-ui">
            {SERENA_CONFIG.editorialAccessMode ? "Consultar disponibilidad" : `$${product.price.toLocaleString("es-AR")}`}
          </span>
          <span className="text-[9px] text-serena-charcoal/60 font-semibold font-ui uppercase">
            Talles: {product.costUsd ? "85 · 90 · 95" : "85 · 90 · 95 · 100"}
          </span>
        </div>

        {/* Dynamic Match Fit Indicator */}
        <div className="mt-2">
          {recommendedSize && (
            <div className="flex items-center gap-1 bg-serena-gold/10 border border-serena-gold/20 py-1 px-2.5 rounded-lg">
              <span className="text-[9px] font-semibold text-serena-gold font-ui uppercase">
                Talle Recomendado: {recommendedSize}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Developer Debug Mode for Recommendation Engine */}
      {process.env.NODE_ENV === "development" && product._affinity && !vendedoraModeActive && (
        <div className="absolute bottom-0 left-0 w-full bg-black/85 text-[8px] text-white p-2 font-mono flex flex-col gap-0.5 border-t border-serena-gold/30 z-50">
          <div className="flex justify-between font-bold text-serena-gold">
            <span>Score Total:</span>
            <span>{product._affinity.totalScore}</span>
          </div>
          <div className="flex justify-between">
            <span>Affinity (Fit/Fav/Views):</span>
            <span>{product._affinity.breakdown.affinity}</span>
          </div>
          <div className="flex justify-between">
            <span>Exploration (Novelty):</span>
            <span>{product._affinity.breakdown.exploration}</span>
          </div>
          <div className="flex justify-between">
            <span>Surprise (Seed):</span>
            <span>{product._affinity.breakdown.surprise}</span>
          </div>
        </div>
      )}
    </div>
  );
}

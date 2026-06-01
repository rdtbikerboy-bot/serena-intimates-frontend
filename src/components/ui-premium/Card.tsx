"use client";


import { ImageLoader } from "./ImageLoader";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Product } from "@/core/types";

interface CardProps {
  product: Product;
  recommendedSize: string | null;
  onOpenDetail: (product: Product) => void;
  vendedoraModeActive?: boolean;
  isSelectedForCuration?: boolean;
  onToggleCurationSelect?: (productId: string) => void;
}

export function Card({ 
  product, 
  recommendedSize, 
  onOpenDetail,
  vendedoraModeActive = false,
  isSelectedForCuration = false,
  onToggleCurationSelect
}: CardProps) {
  const isFavorite = useFavoritesStore(state => state.favoritesList.includes(product.id));

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir detalle
    useFavoritesStore.getState().toggleFavorite(product.id);
  };

  const handleCardClick = () => {
    if (vendedoraModeActive && onToggleCurationSelect) {
      onToggleCurationSelect(product.id);
    } else {
      onOpenDetail(product);
    }
  };

  const hasRecommendedSize = recommendedSize ? Object.keys(product.stockMap || {}).includes(recommendedSize) : false;

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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
        </div>
      )}

      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4", backgroundColor: "#F0E8E0", minHeight: "200px" }}>
        {/* Usamos cargador de imagen progresivo con placeholders satinados */}
        <ImageLoader 
          src={product.images?.find(img => img.isCover)?.imageUrl || product.images?.[0]?.imageUrl || product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
        
        {/* Marca del Producto (solo si no está el selector de vendedora cubriéndolo) */}
        {!vendedoraModeActive && (
          <span className="absolute top-2 left-2 bg-serena-cream/95 text-serena-charcoal text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-serena-blush/20">
            {product.brand}
          </span>
        )}
        
        {/* Badges Comerciales Moderados y Silenciosos (Límite Estricto: Máximo 1) */}
        {displayBadge && (
          <div className="absolute top-9 left-2 z-10">
            <span className="bg-serena-gold/90 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-white/10 backdrop-blur-[2px]">
              ✨ {displayBadge}
            </span>
          </div>
        )}

        {/* Botón de Favoritos (oculto en Modo Vendedora) */}
        {!vendedoraModeActive && (
          <button 
            onClick={toggleFavorite} 
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-serena-cream/90 flex items-center justify-center transition-colors shadow-xs z-10 text-serena-charcoal hover:text-serena-gold active:scale-95"
            aria-label="Añadir a Favoritos"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill={isFavorite ? "currentColor" : "none"} 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="w-4.5 h-4.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>
        )}

        {/* Disponibilidad Comercial Clara de Stock Real (Disponible Hoy vs Encargo Brasil) */}
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
          {product.brand} Brasil
        </span>
        <h4 className="font-editorial text-sm font-semibold text-serena-charcoal leading-tight">
          {product.title}
        </h4>
        
        <div className="flex justify-between items-baseline mt-1.5 flex-wrap gap-1">
          <span className="text-sm font-bold text-serena-gold font-ui">
            ${product.price.toLocaleString("es-AR")}
          </span>
          <span className="text-[10px] text-serena-charcoal/60 font-semibold font-ui uppercase">
            Talles: {Object.keys(product.stockMap || {}).join(" · ")}
          </span>
        </div>

        {/* Dynamic Match Fit Indicator */}
        <div className="mt-2">
          {recommendedSize ? (
            hasRecommendedSize ? (
              <div className="flex items-center gap-1 bg-serena-gold/10 border border-serena-gold/20 py-1 px-2.5 rounded-lg">
                <span className="text-[9px] font-semibold text-serena-gold font-ui uppercase">
                  Talle Recomendado: {recommendedSize}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-serena-blush/15 py-1 px-2.5 rounded-lg">
                <span className="text-[9px] font-medium text-serena-charcoal/50 font-ui uppercase">
                  Otros talles disponibles
                </span>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

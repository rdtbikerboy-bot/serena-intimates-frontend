"use client";

import React, { useState, useEffect } from "react";
import { ImageLoader } from "./ImageLoader";
import { Product } from "@/core/types";
import { useCartStore } from "@/store/useCartStore";
import { useFunnelStore } from "@/store/useFunnelStore";
import { showroomReservationsService } from "@/services/supabaseService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/store/useUIStore";
import { CompleteTheLookMiniCard } from "./CompleteTheLookMiniCard";
import { getCompleteTheLookRecommendations } from "@/domain/completeTheLook";
import { useFitProfileStore } from "@/store/fitProfileStore";
import { getFitConfidence } from "@/domain/fitConfidenceEngine";
import { FitConfidenceBadge } from "./FitConfidenceBadge";

interface ProductDrawerProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDrawer({ product, onClose }: ProductDrawerProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const queryClient = useQueryClient();
  const catalog = queryClient.getQueryData<Product[]>(["products"]) || [];
  const setSelectedProduct = useUIStore(state => state.setSelectedProduct);
  const ctlSourceRef = React.useRef<string | null>(null);

  const fitState = useFitProfileStore(state => state.fitState);
  const fitConfidence = React.useMemo(() => {
    return product ? getFitConfidence(product, fitState) : { level: 'NONE' as const, reason: '' };
  }, [product, fitState]);

  const recommendations = React.useMemo(() => {
    if (!product || catalog.length === 0) return [];
    return getCompleteTheLookRecommendations(product, catalog);
  }, [product, catalog]);

  // Track impression only when recommendations or product changes
  React.useEffect(() => {
    if (recommendations.length > 0 && product) {
      useFunnelStore.getState().trackEvent("CTL_IMPRESSION", product.id, undefined, {
        recommended: recommendations.map(r => r.id),
      });
    }
  }, [product?.id, recommendations]);

  React.useEffect(() => {
    if (!product) {
      ctlSourceRef.current = null;
    }
  }, [product]);

  // FASE 21: Usar product.images para la galería. Fallback a imageUrl si no hay imágenes o si images está vacío.
  const galleryImages = product?.images && product.images.length > 0 
    ? product.images.sort((a, b) => a.displayOrder - b.displayOrder).map(i => i.imageUrl)
    : product?.imageUrl 
      ? [product.imageUrl] 
      : [];

  if (!product) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 h-[750px] bg-serena-cream rounded-t-[30px] shadow-[0_-15px_40px_rgba(26,21,18,0.15)] border-t border-serena-blush/30 z-40 transform smooth-transition flex flex-col translate-y-0">
      {/* Header Modal */}
      <div className="w-full flex justify-between items-center px-6 py-5 border-b border-serena-blush/20 shrink-0">
        <span className="text-xs font-bold tracking-widest text-serena-gold uppercase font-ui">
          Curaduría {product.brand} Brasil
        </span>
        <button 
          onClick={onClose} 
          className="w-8 h-8 flex items-center justify-center bg-serena-charcoal/5 rounded-full text-serena-charcoal hover:bg-serena-charcoal/10 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pb-24">
        
        {/* Galería Táctil Horizontal Fluida */}
        <div className="w-full h-[380px] bg-serena-silk relative overflow-hidden shrink-0">
          <div className="flex overflow-x-auto custom-scroll snap-x snap-mandatory w-full h-full pb-4">
            {galleryImages.map((imgUrl, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                <ImageLoader 
                  src={imgUrl} 
                  alt={`${product.title} - Imagen ${idx + 1}`} 
                  className="w-full h-full object-cover"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
          
          {/* Indicadores de Galería si hay más de 1 imagen */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
              {galleryImages.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-xs backdrop-blur-sm" />
              ))}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-serena-charcoal/60 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-4 left-6 right-6 pointer-events-none">
            <h2 className="font-editorial text-2xl font-bold text-white leading-tight drop-shadow-md">
              {product.title}
            </h2>
            <p className="text-sm font-semibold text-serena-champagne font-ui mt-1 drop-shadow-md">
              ${product.price.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-serena-charcoal/70 leading-relaxed text-sm">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-3 text-[10px] bg-serena-silk/50 p-3.5 rounded-2xl border border-serena-blush/20">
            <div><strong className="text-serena-gold block mb-0.5">Tono Disponible:</strong> {product.color || "Noir Intense"}</div>
            <div><strong className="text-serena-gold block mb-0.5">Afinidad:</strong> {product.mood || "romantico"}</div>
            <div><strong className="text-serena-gold block mb-0.5">Stock Físico:</strong> {product.immediateAvailability ? "Disponible" : "A Pedido"}</div>
            <div><strong className="text-serena-gold block mb-0.5">Estilo Serena:</strong> Lujo silencioso</div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-serena-charcoal/70 uppercase mb-3">
              Seleccionar Talle Corpiño
            </label>
            <div className="flex gap-2">
              {["85", "90", "95"].map(sz => (
                <button 
                  key={sz} 
                  onClick={() => setSelectedSize(sz)}
                  className={`w-12 h-12 rounded-lg text-xs font-semibold smooth-transition border ${
                    selectedSize === sz
                      ? "bg-serena-charcoal text-white border-serena-charcoal"
                      : "border-serena-charcoal/30 text-serena-charcoal hover:bg-serena-charcoal/5"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <FitConfidenceBadge result={fitConfidence} productId={product.id} />

          <button 
            onClick={() => {
              if (!selectedSize) return toast.info("Por favor selecciona un talle.");
              addItem({ id: product.id, title: product.title, imageUrl: galleryImages[0] || product.imageUrl }, selectedSize, product.price);
              useFunnelStore.getState().trackEvent("RESERVED", product.id, undefined, { size: selectedSize });
              
              if (fitConfidence.level === 'HIGH' || fitConfidence.level === 'MEDIUM') {
                useFunnelStore.getState().trackEvent("FIT_CONFIDENCE_ACCEPTED", product.id, undefined, { 
                  level: fitConfidence.level, 
                  size: selectedSize 
                });
              }

              if (ctlSourceRef.current) {
                useFunnelStore.getState().trackEvent("CTL_ADD_TO_CART", product.id, undefined, {
                  baseProduct: ctlSourceRef.current
                });
                ctlSourceRef.current = null;
              }

              toast.success("Añadido al carrito con éxito 🩰");
              onClose();
            }}
            className="w-full bg-serena-gold text-white text-xs font-bold py-4 rounded-2xl shadow-md uppercase tracking-wider hover:opacity-90 active:scale-95 smooth-transition"
          >
            Agregar al Carrito
          </button>

          <div className="space-y-3 pt-4 border-t border-serena-blush/20">
            <span className="block text-[9px] uppercase tracking-widest text-serena-charcoal/60 font-bold mb-2">
              Acción Rápida Showroom Salta
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  const size = selectedSize || "95";
                  try {
                    await showroomReservationsService.createReservation({
                      clientName: "Clienta Showroom",
                      whatsappNumber: "WhatsApp Directo",
                      productTitle: product.title,
                      size: size,
                      notes: "Reservar para probar (1-Tap Showroom)",
                    }, "SHOWROOM");
                  } catch(e) {}
                  useFunnelStore.getState().trackEvent("RESERVED", product.id, undefined, { size, action: "probador" });
                  
                  const msg = `Hola Serena 🌷 Me encantó el look *${product.title}* en talle *${size}*. ¿Me lo reservan para probarlo en el showroom de Salta? ✨`;
                  window.open(`https://wa.me/543874022233?text=${encodeURIComponent(msg)}`, "_blank");
                  toast.success("¡Reserva iniciada! 🩰", { description: "Coordinando prueba en WhatsApp." });
                }}
                className="bg-serena-gold/10 hover:bg-serena-gold/20 text-serena-gold border border-serena-gold/20 rounded-xl p-3 text-[10px] font-bold text-center active:scale-95 smooth-transition flex flex-col items-center justify-center gap-1.5"
              >
                <span className="text-base">🩰</span>
                <span>Reservar p/ Probar</span>
              </button>

              <button
                onClick={async () => {
                  const size = selectedSize || "95";
                  try {
                    await showroomReservationsService.createReservation({
                      clientName: "Clienta Showroom",
                      whatsappNumber: "WhatsApp Directo",
                      productTitle: product.title,
                      size: size,
                      notes: "Separar para hoy (1-Tap Showroom)",
                    }, "SHOWROOM");
                  } catch(e) {}
                  useFunnelStore.getState().trackEvent("RESERVED", product.id, undefined, { size, action: "separar" });

                  const msg = `Hola Serena 🌷 Vi el look *${product.title}* en talle *${size}*. ¿Me lo separan para pasar a retirarlo hoy mismo por el showroom? 🎀`;
                  window.open(`https://wa.me/543874022233?text=${encodeURIComponent(msg)}`, "_blank");
                  toast.success("¡Separado con éxito! 🎀", { description: "Coordinando retiro hoy en Salta." });
                }}
                className="bg-serena-charcoal/5 hover:bg-serena-charcoal/10 text-serena-charcoal border border-serena-charcoal/10 rounded-xl p-3 text-[10px] font-bold text-center active:scale-95 smooth-transition flex flex-col items-center justify-center gap-1.5"
              >
                <span className="text-base">🎀</span>
                <span>Separar para Hoy</span>
              </button>
            </div>
          </div>

          {/* Complete The Look Engine - Selección Serena */}
          {recommendations.length > 0 && (
            <div className="mt-8 pt-8 border-t border-serena-blush/20">
              <div className="mb-4">
                <h3 className="font-editorial text-lg italic text-serena-charcoal">Selección Serena</h3>
                <p className="text-[10px] text-serena-charcoal/60 uppercase tracking-widest font-bold font-ui">
                  Completa tu look con estas piezas seleccionadas
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.map(rec => (
                  <CompleteTheLookMiniCard
                    key={rec.id}
                    product={rec}
                    onClick={(p) => {
                      useFunnelStore.getState().trackEvent("CTL_CLICK", p.id, undefined, {
                        baseProduct: product.id
                      });
                      ctlSourceRef.current = product.id;
                      setSelectedProduct(p);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

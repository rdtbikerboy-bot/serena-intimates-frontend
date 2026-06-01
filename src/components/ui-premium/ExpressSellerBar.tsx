"use client";

import React, { useState } from "react";
import { Sparkles, Share2, Clipboard, Bookmark, Phone, ShoppingBag, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useSellerModeStore } from "@/store/sellerModeStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsService, waitlistService } from "@/services/supabaseService";
import { Product } from "@/core/types";

import { useFunnelStore } from "@/store/useFunnelStore";

export function ExpressSellerBar() {
  const queryClient = useQueryClient();
  const _hasHydrated = useSellerModeStore(s => s._hasHydrated);
  const vendedoraModeActive = useSellerModeStore(s => s.vendedoraModeActive);
  const setVendedoraModeActive = useSellerModeStore(s => s.setVendedoraModeActive);
  const vendedoraSelection = useSellerModeStore(s => s.vendedoraSelection);
  const clearCurationSelection = useSellerModeStore(s => s.clearCurationSelection);
  const showroomMode = useSellerModeStore(s => s.showroomMode);

  const [isOpen, setIsOpen] = useState(false);

  if (showroomMode) return null;
  const [showReserveModal, setShowReserveModal] = useState(false);
  
  // QR Rápido Showroom
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [qrTitle, setQrTitle] = useState("");

  // Form de reserva express
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedProductTitle, setSelectedProductTitle] = useState("");
  const [selectedSize, setSelectedSize] = useState("95");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: productsService.getProducts,
  });

  // Mutación para agregar reserva rápida
  const createReservationMutation = useMutation({
    mutationFn: async (data: { clientName: string; whatsappNumber: string; productTitle: string; size: string }) => {
      return waitlistService.subscribe({
        variantId: `temp-variant-${Date.now()}`,
        clientName: data.clientName,
        whatsappNumber: data.whatsappNumber,
        productTitle: data.productTitle,
        size: data.size,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      toast.success("Reserva express registrada con éxito en Showroom 🎀");
      setShowReserveModal(false);
      setClientName("");
      setClientPhone("");
    },
    onError: () => {
      toast.error("Error al persistir la reserva física.");
    }
  });

  if (!_hasHydrated) return null;

  if (!vendedoraModeActive) {
    return (
      <button
        onClick={() => setVendedoraModeActive(true)}
        className="fixed bottom-24 right-4 z-40 bg-serena-gold text-white p-3 rounded-full shadow-lg border border-white/20 hover:scale-105 active:scale-95 smooth-transition flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
        Vendedora
      </button>
    );
  }

  // Copiar Book del Drop actual
  const handleCopyBookLink = () => {
    const link = typeof window !== "undefined" ? window.location.origin : "https://serena.boutique";
    navigator.clipboard.writeText(link);
    toast.success("🎀 Enlace al Catálogo Curado copiado para WhatsApp.");
  };

  // Compartir Curaduría Completa por WhatsApp
  const handleShareCuratedSelection = () => {
    if (vendedoraSelection.length === 0) {
      toast.info("Selecciona primero prendas tocando el ícono ⭐ de curaduría.");
      return;
    }

    const selectedLooks = products.filter(p => vendedoraSelection.includes(p.id));
    let text = `✨ *Tu Selección Curada en Serena Intimates* 🩰\n\n`;
    text += `Hola! Preparé esta selección exclusiva pensando especialmente en tu estilo:\n\n`;
    
    selectedLooks.forEach((p, idx) => {
      text += `${idx + 1}. *${p.title}* de ${p.brand} ($${p.price.toLocaleString("es-AR")} ARS) · ${p.color}\n`;
      // FASE 19: tracking SHARED
      useFunnelStore.getState().trackEvent("SHARED", p.id, undefined, { source: "curation" });
    });

    text += `\n¿Coordinamos tu visita al Showroom de Salta para probártelos hoy? ✨`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    toast.success("Curaduría enviada a WhatsApp 🌸");
  };

  // Generador de QR Rápido Showroom (Google Charts API, Ligero, Sin dependencias)
  const handleShowCatalogQR = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://serena.boutique";
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(origin)}`);
    setQrTitle("Catálogo General Serena");
    setShowQRModal(true);
    toast.success("QR del Catálogo Generado 🩰");
  };

  const handleShowProductQR = (title: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://serena.boutique";
    const deepLink = `${origin}?product=${id}`;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(deepLink)}`);
    setQrTitle(`Look: ${title}`);
    setShowQRModal(true);
    toast.success(`QR para "${title}" Generado 🩰`);
    // FASE 19: tracking SHARED por QR
    useFunnelStore.getState().trackEvent("SHARED", id, undefined, { qr: "true" });
  };

  // Realizar la reserva
  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !selectedProductTitle) {
      toast.error("Por favor completa los datos de la clienta.");
      return;
    }
    createReservationMutation.mutate({
      clientName,
      whatsappNumber: clientPhone,
      productTitle: selectedProductTitle,
      size: selectedSize,
    });
  };

  return (
    <>
      {/* Barra Exclusiva Vendedora Showroom */}
      <div className="fixed bottom-20 inset-x-4 z-40 bg-serena-charcoal/95 backdrop-blur-md rounded-2xl p-3 border border-serena-gold/30 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col gap-2 animate-slide-up text-white text-xs select-none">
        <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-serena-gold">
              Consola Express Vendedora 🩰
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-white/60 hover:text-white text-[8px] uppercase tracking-wider font-bold"
            >
              {isOpen ? "Contraer" : "Expandir"}
            </button>
            <button 
              onClick={() => setVendedoraModeActive(false)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Acciones principales en 1-Tap */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={handleCopyBookLink}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 smooth-transition"
          >
            <Clipboard className="w-3.5 h-3.5 text-serena-gold" />
            <span className="text-[7px] font-bold uppercase tracking-wider">Link</span>
          </button>

          <button
            onClick={handleShareCuratedSelection}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 relative smooth-transition"
          >
            <Phone className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            <span className="text-[7px] font-bold uppercase tracking-wider">WhatsApp</span>
            {vendedoraSelection.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-serena-gold text-white text-[7px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {vendedoraSelection.length}
              </span>
            )}
          </button>

          <button
            onClick={handleShowCatalogQR}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 smooth-transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-serena-gold" />
            <span className="text-[7px] font-bold uppercase tracking-wider">QR Catálogo</span>
          </button>

          <button
            onClick={() => {
              if (products.length > 0) {
                setSelectedProductTitle(products[0].title);
              }
              setShowReserveModal(true);
            }}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 smooth-transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-serena-gold" />
            <span className="text-[7px] font-bold uppercase tracking-wider">Reserva</span>
          </button>
        </div>

        {/* Información Curada Expandible */}
        {isOpen && (
          <div className="pt-2 border-t border-white/10 space-y-2 text-[9px] text-white/80 max-h-40 overflow-y-auto custom-scroll">
            <div>
              <p className="font-bold text-serena-gold uppercase tracking-wider text-[8px] mb-1">Prendas en Curaduría:</p>
              {vendedoraSelection.length === 0 ? (
                <p className="italic text-white/40">No hay looks seleccionados. Toca la estrella en las tarjetas de looks.</p>
              ) : (
                <div className="space-y-1.5">
                  {products.filter(p => vendedoraSelection.includes(p.id)).map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-white/5 p-1.5 px-2 rounded-lg gap-2">
                      <span className="truncate">🌸 {p.title} · {p.color}</span>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleShowProductQR(p.title, p.id)}
                          className="text-serena-gold font-bold hover:text-serena-gold/80 text-[8px] uppercase tracking-wider"
                        >
                          QR
                        </button>
                        <button 
                          onClick={() => useSellerModeStore.getState().toggleCurationSelect(p.id)}
                          className="text-red-400 font-bold hover:text-red-300 text-[8px]"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={clearCurationSelection}
                    className="text-[7.5px] text-red-300 uppercase tracking-widest font-bold block pt-1 hover:underline"
                  >
                    Limpiar Selección
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Reserva Express Showroom */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-serena-cream w-full max-w-[340px] rounded-[24px] p-5 border border-serena-blush/40 shadow-2xl space-y-4 text-serena-charcoal animate-scale-up">
            <div className="flex justify-between items-center border-b border-serena-blush/20 pb-2">
              <h4 className="font-editorial text-sm font-bold italic text-serena-gold">
                Reserva Express Showroom
              </h4>
              <button onClick={() => setShowReserveModal(false)} className="text-serena-charcoal/50 hover:text-serena-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReserveSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-wider font-bold text-serena-charcoal/60">Nombre Clienta</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Sofia Belgrano"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-serena-silk rounded-xl p-2 px-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-wider font-bold text-serena-charcoal/60">WhatsApp</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: +5493874556677"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-serena-silk rounded-xl p-2 px-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-wider font-bold text-serena-charcoal/60">Prenda Elegida</label>
                <select
                  value={selectedProductTitle}
                  onChange={(e) => setSelectedProductTitle(e.target.value)}
                  className="w-full bg-serena-silk rounded-xl p-2 px-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.title}>{p.title} · {p.color}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-wider font-bold text-serena-charcoal/60">Talle Coordinado</label>
                <div className="grid grid-cols-6 gap-1">
                  {["85", "90", "95", "100", "105", "110"].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-1.5 rounded-lg text-[9px] font-bold transition-all border ${
                        selectedSize === sz
                          ? "bg-serena-gold text-white border-transparent"
                          : "bg-serena-cream text-serena-charcoal/70 border-serena-blush/30"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={createReservationMutation.isPending}
                className="w-full bg-serena-gold text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-widest mt-2 hover:bg-serena-gold/90 transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                {createReservationMutation.isPending ? "Confirmando..." : "Confirmar Reserva"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de QR Rápido Showroom */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-serena-cream w-full max-w-[300px] rounded-[28px] p-6 border border-serena-blush/40 shadow-2xl flex flex-col items-center gap-4 text-center text-serena-charcoal animate-scale-up">
            <div className="w-full flex justify-between items-center border-b border-serena-blush/20 pb-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-serena-gold">
                Código QR Showroom 🩰
              </span>
              <button 
                onClick={() => setShowQRModal(false)}
                className="text-serena-charcoal/50 hover:text-serena-charcoal"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-2 bg-white rounded-2xl border border-serena-blush/20 shadow-inner">
              <img 
                src={qrUrl} 
                alt="Boutique QR" 
                className="w-44 h-44 object-contain"
              />
            </div>

            <div>
              <h5 className="font-editorial text-xs font-bold italic text-serena-charcoal">
                {qrTitle}
              </h5>
              <p className="text-[8px] text-serena-charcoal/50 uppercase tracking-widest mt-1">
                Apunta la cámara para abrir en tu celular ✨
              </p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-serena-charcoal text-white font-bold py-2 rounded-xl text-[9px] uppercase tracking-widest hover:opacity-90 smooth-transition"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}
    </>
  );
}

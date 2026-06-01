"use client";

import { useState, useEffect } from "react";
import { Product } from "@/mocks/products";
import { serenaLogger, SerenaLog } from "@/utils/logger";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SerenaLog[];
  onClearLogs: () => void;
  onExportLogs: () => void;
  isOnline: boolean;
  pendingCount: number;
  vendedoraModeActive?: boolean;
  onToggleVendedoraMode?: () => void;
  productsList: Product[];
  onUpdateProducts: (newList: Product[]) => void;
}

interface SimulatedWaitlist {
  id: string;
  name: string;
  phone: string;
  productTitle: string;
  size: string;
  brand: string;
  date: string;
}

export function AdminPanel({ 
  isOpen, 
  onClose, 
  logs, 
  onClearLogs, 
  onExportLogs, 
  isOnline, 
  pendingCount,
  vendedoraModeActive = false,
  onToggleVendedoraMode,
  productsList,
  onUpdateProducts
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "quickload" | "metrics" | "waitlist" | "logs">("catalog");
  
  // Lista de espera simulada para el Soft Launch
  const [waitlist, setWaitlist] = useState<SimulatedWaitlist[]>([
    { id: "w-1", name: "Valentina Gómez", phone: "543874123456", productTitle: "Bustier Rouge Romantique", size: "90", brand: "Valisere", date: "18 Mayo" },
    { id: "w-2", name: "Martina Solá", phone: "543875987654", productTitle: "Bralette Onyx Noir", size: "95", brand: "Darling", date: "19 Mayo" },
    { id: "w-3", name: "Sofía Leguizamón", phone: "543876111222", productTitle: "Corset Blanc de L'amour", size: "85", brand: "Liz", date: "19 Mayo" },
  ]);

  // Métricas avanzadas por marca y producto simuladas + acumuladas
  const [analytics, setAnalytics] = useState<{
    brandViews: Record<string, number>;
    brandShares: Record<string, number>;
    brandReservations: Record<string, number>;
    brandCheckouts: Record<string, number>;
    productViews: Record<string, number>;
    productShares: Record<string, number>;
  }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_analytics_metrics");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    // Semillas iniciales realistas para que el panel se vea deslumbrante al primer impacto
    return {
      brandViews: { Valisere: 142, Darling: 98, Hope: 74, Liz: 110, Sedução: 56 },
      brandShares: { Valisere: 42, Darling: 35, Hope: 20, Liz: 28, Sedução: 18 },
      brandReservations: { Valisere: 18, Darling: 12, Hope: 8, Liz: 14, Sedução: 5 },
      brandCheckouts: { Valisere: 12, Darling: 8, Hope: 5, Liz: 9, Sedução: 3 },
      productViews: { "card-1": 85, "card-2": 62, "card-3": 44, "card-4": 30, "card-5": 58, "card-6": 28 },
      productShares: { "card-1": 24, "card-2": 19, "card-3": 10, "card-4": 8, "card-5": 14, "card-6": 9 }
    };
  });

  // Persistir analíticas
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("serena_analytics_metrics", JSON.stringify(analytics));
    }
  }, [analytics]);

  // Módulo Carga Rápida State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPrice, setQuickPrice] = useState("");
  const [quickBrand, setQuickBrand] = useState<Product["brand"]>("Valisere");
  const [quickColor, setQuickColor] = useState<Product["color"]>("Negro");
  const [quickCategory, setQuickCategory] = useState<Product["category"]>("romantico");
  const [quickDrop, setQuickDrop] = useState<Product["drop"]>("encaje-noir");
  const [quickSizes, setQuickSizes] = useState<string[]>(["85", "90", "95"]);
  const [quickStock, setQuickStock] = useState<Record<string, number>>({ "85": 3, "90": 3, "95": 2 });

  // Cambiar stock de un talle rápido en el panel
  const handleStockChange = (size: string, increment: number) => {
    setQuickStock(prev => {
      const current = prev[size] || 0;
      const next = Math.max(0, current + increment);
      return { ...prev, [size]: next };
    });
  };

  const handleToggleSize = (size: string) => {
    setQuickSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
    if (!quickStock[size]) {
      setQuickStock(prev => ({ ...prev, [size]: 3 }));
    }
  };

  const handlePublishProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickPrice) {
      alert("Por favor completa el nombre de la prenda y el precio.");
      return;
    }

    const priceNum = parseFloat(quickPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("El precio debe ser un número positivo válido.");
      return;
    }

    // Foto aleatoria premium estilizada de Unsplash según categoría para demostración funcional inmediata
    const unsplashPics: Record<Product["category"], string> = {
      romantico: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
      atrevido: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop",
      novia: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop",
      comfy: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600&auto=format&fit=crop",
      minimalista: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=600&auto=format&fit=crop",
      premium: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop"
    };

    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      title: quickTitle,
      price: priceNum,
      category: quickCategory,
      sizes: quickSizes,
      imageUrl: unsplashPics[quickCategory] || unsplashPics.minimalista,
      description: `Prenda curada de la marca brasilera ${quickBrand}. Diseño de encaje y corte sofisticado. Confección premium para el mercado salteño.`,
      matchTitle: `Cola-less ${quickBrand} Satin`,
      matchPrice: Math.round(priceNum * 0.45),
      brand: quickBrand,
      color: quickColor,
      supportLevel: quickCategory === "romantico" || quickCategory === "premium" ? "alto" : "medio",
      transparency: quickCategory === "atrevido" ? "alta" : "baja",
      immediateAvailability: true,
      mood: quickCategory === "comfy" ? "comodo-y-suave" : quickCategory === "novia" ? "bridal" : "dia-a-dia",
      collections: [quickCategory],
      badges: ["Nuevo ingreso Brasil"],
      drop: quickDrop,
      stockVariants: quickStock
    };

    const updated = [newProduct, ...productsList];
    onUpdateProducts(updated);
    serenaLogger.info(`Módulo Carga Rápida: Publicada nueva prenda "${quickTitle}" ($${priceNum}) de ${quickBrand}`);

    // Feedback de éxito
    alert(`✨ ¡Prenda Publicada Exitosamente! ✨\n\n"${quickTitle}" de ${quickBrand} ha sido incorporada al feed comercial.`);

    // Resetear formulario
    setQuickTitle("");
    setQuickPrice("");
    setQuickStock({ "85": 3, "90": 3, "95": 2 });
  };

  // Edición Inline de Atributos
  const handleUpdatePriceInline = (id: string, newPriceVal: string) => {
    const priceNum = parseFloat(newPriceVal);
    if (isNaN(priceNum) || priceNum <= 0) return;
    const updated = productsList.map(p => {
      if (p.id === id) {
        return { ...p, price: priceNum };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleToggleAvailabilityInline = (id: string) => {
    const updated = productsList.map(p => {
      if (p.id === id) {
        const nextState = !p.immediateAvailability;
        serenaLogger.info(`Catálogo Inline: Cambiado stock de "${p.title}" a ${nextState ? "Disponible Hoy" : "Encargo Brasil"}`);
        return { ...p, immediateAvailability: nextState };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleToggleHideInline = (id: string) => {
    const updated = productsList.map(p => {
      if (p.id === id) {
        const isHidden = p.sizes.length === 0;
        const nextSizes = isHidden ? ["90", "95"] : [];
        serenaLogger.info(`Catálogo Inline: "${p.title}" estado visibilidad -> ${isHidden ? "Visible" : "Oculto"}`);
        return { ...p, sizes: nextSizes };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // Contactar a cliente de lista de espera
  const handleContactWaitlist = (item: SimulatedWaitlist) => {
    const text = `✨ ¡Hola ${item.name}! Te escribimos de Serena Intimates 🩰.\n\nQueríamos avisarte con alegría que acaba de reingresar en stock el look que estabas esperando:\n💖 *${item.productTitle}* (Talle *${item.size}*) de la marca *${item.brand}*.\n\n¿Te reservamos una unidad para retiro inmediato o envío discreto en Salta? ✨`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${item.phone}?text=${encoded}`, "_blank");
    serenaLogger.info(`CRM Lista de Espera: Contactada cliente Valentina Gómez por WhatsApp.`);
  };

  // Limpiar datos de Soft Launch
  const handleResetSoftLaunch = () => {
    if (confirm("¿Estás segura de vaciar las métricas de prueba para iniciar el Soft Launch de clientas reales?")) {
      const reseted = {
        brandViews: { Valisere: 0, Darling: 0, Hope: 0, Liz: 0, Sedução: 0 },
        brandShares: { Valisere: 0, Darling: 0, Hope: 0, Liz: 0, Sedução: 0 },
        brandReservations: { Valisere: 0, Darling: 0, Hope: 0, Liz: 0, Sedução: 0 },
        brandCheckouts: { Valisere: 0, Darling: 0, Hope: 0, Liz: 0, Sedução: 0 },
        productViews: {},
        productShares: {}
      };
      setAnalytics(reseted);
      localStorage.setItem("serena_analytics_metrics", JSON.stringify(reseted));
      alert("🧼 Métricas de prueba reestablecidas. Sistema listo para Soft Launch con datos 100% reales.");
      serenaLogger.info("Soft Launch: Métricas inicializadas a cero.");
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`absolute inset-x-0 bottom-0 h-[690px] bg-serena-cream rounded-t-[30px] shadow-[0_-15px_40px_rgba(26,21,18,0.25)] border-t border-serena-blush/40 z-50 transform smooth-transition flex flex-col translate-y-0`}
    >
      
      {/* Cabecera Editorial Premium */}
      <div className="w-full flex justify-between items-center px-6 py-5 border-b border-serena-blush/20 bg-serena-cream text-serena-charcoal">
        <div>
          <h3 className="font-editorial text-base font-bold tracking-wider italic">🎀 Consola de Gestión Serena</h3>
          <p className="text-[8px] text-serena-gold uppercase tracking-widest mt-0.5 font-bold">Lanzamiento Comercial & Soft Launch</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-serena-charcoal hover:opacity-60 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs Táctiles Rose Gold Mobile-First */}
      <div className="flex border-b border-serena-blush/20 bg-serena-silk/50 p-1 overflow-x-auto whitespace-nowrap custom-scroll">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "catalog" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
          }`}
        >
          📦 Inventario Inline
        </button>
        <button
          onClick={() => setActiveTab("quickload")}
          className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "quickload" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
          }`}
        >
          ✨ Carga Rápida
        </button>
        <button
          onClick={() => setActiveTab("metrics")}
          className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "metrics" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
          }`}
        >
          📈 Métricas Comerciales
        </button>
        <button
          onClick={() => setActiveTab("waitlist")}
          className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "waitlist" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
          }`}
        >
          🔔 Espera ({waitlist.length})
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "logs" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
          }`}
        >
          📋 Logs
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scroll text-xs">

        {/* 1. INVENTARIO INLINE (Edición veloz sin tablas ERP frías) */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-serena-blush/20">
              <h4 className="text-[10px] font-bold text-serena-gold uppercase tracking-widest">
                Catálogo Táctil
              </h4>
              <p className="text-[9px] text-serena-charcoal/50">{productsList.length} looks en tienda</p>
            </div>

            {/* Lista visual ágil */}
            <div className="space-y-3">
              {productsList.map(p => {
                const isHidden = p.sizes.length === 0;
                return (
                  <div key={p.id} className={`p-3 bg-serena-silk/60 rounded-2xl border border-serena-blush/20 flex flex-col gap-3 transition-opacity ${isHidden ? "opacity-50" : ""}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.title} className="w-10 h-12 object-cover rounded-lg border border-serena-blush/30" />
                        <div>
                          <h5 className="font-bold text-serena-charcoal flex items-center gap-1.5">
                            {p.title}
                            {isHidden && <span className="text-[7px] bg-red-400/20 text-red-600 px-1 py-0.5 rounded font-ui font-normal">Oculto</span>}
                          </h5>
                          <p className="text-[9px] text-serena-charcoal/50 mt-0.5">{p.brand} · Drop: {p.drop}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Disponible hoy / Encargo */}
                        <button 
                          onClick={() => handleToggleAvailabilityInline(p.id)}
                          className={`text-[8px] font-bold uppercase py-1 px-2.5 rounded-full border smooth-transition ${
                            p.immediateAvailability 
                              ? "bg-green-500/10 text-green-700 border-green-500/30" 
                              : "bg-serena-cream text-serena-charcoal/60 border-serena-blush/30"
                          }`}
                        >
                          {p.immediateAvailability ? "Disponible Hoy" : "Encargo Brasil"}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-serena-blush/10">
                      {/* Input Inline de precio */}
                      <div className="flex items-center gap-1 bg-serena-cream px-2 py-1.5 rounded-xl border border-serena-blush/20">
                        <span className="text-[9px] text-serena-charcoal/50">$</span>
                        <input 
                          type="number" 
                          value={p.price} 
                          onChange={(e) => handleUpdatePriceInline(p.id, e.target.value)}
                          className="w-16 bg-transparent outline-none font-bold text-serena-charcoal text-[10px]"
                        />
                      </div>

                      {/* Botones de acción rápida */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleToggleHideInline(p.id)}
                          className={`text-[9px] font-bold py-1.5 px-3 rounded-xl border smooth-transition ${
                            isHidden
                              ? "bg-serena-gold text-white border-transparent"
                              : "bg-serena-cream text-serena-charcoal border-serena-blush/30"
                          }`}
                        >
                          {isHidden ? "👁️ Mostrar" : "👁️ Ocultar"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. QUICKLOAD (Carga Rápida tipo Instagram/Stories) */}
        {activeTab === "quickload" && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-serena-gold uppercase tracking-widest border-b border-serena-blush/20 pb-1.5">
              Publicar Nueva Prenda (Estilo Instagram 🩰)
            </h4>

            <form onSubmit={handlePublishProduct} className="space-y-4">
              {/* Título y Precio */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Nombre Look</label>
                  <input 
                    type="text" 
                    placeholder="Bralette Lace..."
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Precio final (ARS)</label>
                  <input 
                    type="number" 
                    placeholder="25000"
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value)}
                    className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  />
                </div>
              </div>

              {/* Marca y Drop */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Marca Brasilera</label>
                  <select 
                    value={quickBrand}
                    onChange={(e) => setQuickBrand(e.target.value as any)}
                    className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  >
                    <option value="Valisere">Valisere</option>
                    <option value="Darling">Darling</option>
                    <option value="Hope">Hope</option>
                    <option value="Liz">Liz</option>
                    <option value="Sedução">Sedução</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Drop Curatoriales</label>
                  <select 
                    value={quickDrop}
                    onChange={(e) => setQuickDrop(e.target.value as any)}
                    className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  >
                    <option value="encaje-noir">Encaje Noir</option>
                    <option value="soft-cotton">Soft Cotton</option>
                    <option value="invisible-nude">Invisible Nude</option>
                    <option value="lounge-serena">Lounge Serena</option>
                    <option value="bridal-capsule">Bridal Capsule</option>
                  </select>
                </div>
              </div>

              {/* Categoría y Color */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Mood Estético</label>
                  <select 
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as any)}
                    className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  >
                    <option value="romantico">Romántico</option>
                    <option value="atrevido">Sensual Delicado</option>
                    <option value="novia">Bridal</option>
                    <option value="comfy">Suave Comfort</option>
                    <option value="minimalista">Minimalista</option>
                    <option value="premium">Edición Limitada</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Color</label>
                  <select 
                    value={quickColor}
                    onChange={(e) => setQuickColor(e.target.value as any)}
                    className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  >
                    <option value="Negro">Negro</option>
                    <option value="Rojo">Rojo</option>
                    <option value="Blanco">Blanco</option>
                    <option value="Almendra">Almendra</option>
                    <option value="Nude">Nude</option>
                    <option value="Oro">Lúrex Dorado</option>
                  </select>
                </div>
              </div>

              {/* Selección Táctil de Talles y Stock Granular en 1 toque */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60 block">Stock por Variantes (Talles)</label>
                <div className="grid grid-cols-3 gap-2">
                  {["85", "90", "95", "100", "105", "110"].map(size => {
                    const isActive = quickSizes.includes(size);
                    const units = quickStock[size] || 0;
                    return (
                      <div 
                        key={size}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 smooth-transition ${
                          isActive ? "bg-serena-silk border-serena-gold" : "bg-serena-cream border-serena-blush/20 opacity-60"
                        }`}
                      >
                        <button 
                          type="button"
                          onClick={() => handleToggleSize(size)}
                          className="font-bold text-[10px] text-serena-charcoal font-ui flex items-center gap-1"
                        >
                          <span className={isActive ? "text-serena-gold" : "text-serena-charcoal/30"}>●</span>
                          Talle {size}
                        </button>
                        
                        {isActive && (
                          <div className="flex items-center gap-2 pt-1 border-t border-serena-blush/25 w-full justify-between px-1">
                            <button 
                              type="button" 
                              onClick={() => handleStockChange(size, -1)}
                              className="w-5 h-5 bg-serena-cream rounded-full border border-serena-blush/30 font-bold flex items-center justify-center text-xs active:scale-95"
                            >
                              -
                            </button>
                            <span className="font-bold text-[10px] text-serena-charcoal">{units}u</span>
                            <button 
                              type="button" 
                              onClick={() => handleStockChange(size, 1)}
                              className="w-5 h-5 bg-serena-cream rounded-full border border-serena-blush/30 font-bold flex items-center justify-center text-xs active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Publicación Social */}
              <button 
                type="submit"
                className="w-full bg-serena-gold text-white text-[10px] font-bold py-4 rounded-2xl uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-xs"
              >
                🎀 Publicar Prenda en Feed
              </button>
            </form>
          </div>
        )}

        {/* 3. METRICAS (Analíticas por Marca y Rendimiento Comercial) */}
        {activeTab === "metrics" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-serena-blush/20">
              <h4 className="text-[10px] font-bold text-serena-gold uppercase tracking-widest">
                Rendimiento por Marca Brasilera
              </h4>
              <button 
                onClick={handleResetSoftLaunch}
                className="text-[8px] bg-serena-charcoal/10 text-serena-charcoal font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border border-transparent hover:bg-serena-charcoal/20 active:scale-95 smooth-transition"
              >
                Reset Soft Launch 🧼
              </button>
            </div>

            {/* Listado de KPIs por Marca */}
            <div className="space-y-3.5">
              {["Valisere", "Darling", "Hope", "Liz", "Sedução"].map(brand => {
                const v = analytics.brandViews[brand] || 0;
                const s = analytics.brandShares[brand] || 0;
                const r = analytics.brandReservations[brand] || 0;
                const c = analytics.brandCheckouts[brand] || 0;
                const convRate = v > 0 ? Math.round((c / v) * 100) : 0;
                return (
                  <div key={brand} className="p-4 bg-serena-silk/60 rounded-2xl border border-serena-blush/20 shadow-2xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-editorial text-xs font-bold italic tracking-wide text-serena-charcoal">{brand}</span>
                      <span className="text-[9px] font-bold text-serena-gold bg-serena-cream px-2 py-0.5 rounded-md border border-serena-blush/10">Conv. WhatsApp: {convRate}%</span>
                    </div>

                    {/* Barra de progreso CSS de views / shares */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[8px] text-serena-charcoal/50 font-bold uppercase tracking-widest">
                        <span>Exploración (Vistas)</span>
                        <span>{v} views</span>
                      </div>
                      <div className="w-full h-1 bg-serena-cream rounded-full overflow-hidden">
                        <div className="h-full bg-serena-gold smooth-transition" style={{ width: `${Math.min(100, (v / 200) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Fila de Micro-indicadores táctiles */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-serena-cream p-1.5 rounded-lg border border-serena-blush/10">
                        <span className="text-[10px] font-bold text-serena-charcoal block">{s}</span>
                        <span className="text-[6.5px] uppercase tracking-wider text-serena-charcoal/50">Compartido</span>
                      </div>
                      <div className="bg-serena-cream p-1.5 rounded-lg border border-serena-blush/10">
                        <span className="text-[10px] font-bold text-serena-charcoal block">{r}</span>
                        <span className="text-[6.5px] uppercase tracking-wider text-serena-charcoal/50">Reservado</span>
                      </div>
                      <div className="bg-serena-cream p-1.5 rounded-lg border border-serena-blush/10">
                        <span className="text-[10px] font-bold text-serena-charcoal block">{c}</span>
                        <span className="text-[6.5px] uppercase tracking-wider text-serena-charcoal/50">Comprado</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. WAITLIST (Lista de espera del Soft Launch) */}
        {activeTab === "waitlist" && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-serena-gold uppercase tracking-widest border-b border-serena-blush/20 pb-1.5">
              Lista de Espera de Reposiciones (Soft Launch)
            </h4>

            {waitlist.length === 0 ? (
              <p className="text-xs text-serena-charcoal/40 text-center py-12">No hay clientas en espera actualmente.</p>
            ) : (
              <div className="space-y-3">
                {waitlist.map(item => (
                  <div key={item.id} className="p-3 bg-serena-silk/60 rounded-2xl border border-serena-blush/20 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-serena-charcoal">{item.name}</h5>
                      <p className="text-[8px] text-serena-charcoal/50 mt-0.5">Esperando: {item.productTitle} (Talle {item.size})</p>
                      <span className="text-[7.5px] text-serena-gold uppercase font-bold tracking-widest mt-1 block">{item.brand} · Solicitado {item.date}</span>
                    </div>
                    <button 
                      onClick={() => handleContactWaitlist(item)}
                      className="bg-serena-gold text-white text-[8px] font-bold px-3 py-2 rounded-xl uppercase tracking-widest active:scale-95 smooth-transition shadow-2xs"
                    >
                      Avisar 📲
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-serena-blush/15 p-3 bg-green-500/10 rounded-2xl border border-green-500/20 text-[9px] text-green-700 leading-relaxed flex gap-2">
              <span>💡</span>
              <p>
                <strong>Acción Rápida de Conversión:</strong> Al pulsar el botón "Avisar", se abrirá automáticamente WhatsApp con un mensaje elegante pre-diseñado notificándole a la clienta sobre la reposición.
              </p>
            </div>
          </div>
        )}

        {/* 5. LOGS (Técnico de soporte) */}
        {activeTab === "logs" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-serena-gold uppercase tracking-widest">
                Consola en Tiempo Real
              </h4>
              <span className="text-[9px] text-serena-charcoal/50">Sync Offline: {pendingCount}</span>
            </div>

            <div className="flex-1 max-h-60 overflow-y-auto p-3.5 bg-serena-silk rounded-xl font-mono text-[9px] space-y-2.5 border border-serena-blush/20 custom-scroll">
              {logs.length === 0 ? (
                <p className="text-serena-charcoal/40 text-center py-8">Sin registros técnicos.</p>
              ) : (
                [...logs].reverse().slice(0, 15).map((log) => (
                  <div key={log.id} className="p-2 bg-serena-cream rounded-lg border border-serena-blush/10 shadow-2xs space-y-1">
                    <div className="flex justify-between text-[8px] text-serena-charcoal/50 font-sans font-bold">
                      <span>{log.timestamp.split("T")[1].substring(0, 8)}</span>
                      <span className={log.level === "ERROR" ? "text-red-500" : log.level === "WARN" ? "text-yellow-600" : "text-serena-gold"}>
                        [{log.level}]
                      </span>
                    </div>
                    <p className="text-serena-charcoal font-semibold">{log.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onExportLogs}
                className="flex-1 bg-serena-gold text-white text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-wider hover:opacity-90 active:scale-95 smooth-transition"
              >
                Compartir Logs WhatsApp
              </button>
              <button
                onClick={onClearLogs}
                className="px-4 bg-red-400/20 text-red-600 text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-wider hover:bg-red-400/30 smooth-transition"
              >
                Vaciar
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

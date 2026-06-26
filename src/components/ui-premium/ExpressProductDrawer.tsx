"use client";
// ExpressProductDrawer.tsx – Refactor completo
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Product, ProductImage } from "@/core/types";
import { ImageUploader, PendingImage } from "./ImageUploader";
import { toast } from "sonner";
import { X, Copy, Check } from "lucide-react";

interface ExpressProductDrawerProps {
  product: Product;
  onClose: () => void;
  onPublish: (data: Partial<Product>, pendingImages: PendingImage[]) => Promise<void>;
}

export function ExpressProductDrawer({ product, onClose, onPublish }: ExpressProductDrawerProps) {
  // ---------- Carga Continua ----------
  const [cargaContinua, setCargaContinua] = useState(() => {
    return localStorage.getItem("serena_carga_continua_enabled") === "true";
  });
  const [cargaCounter, setCargaCounter] = useState(() => {
    const cnt = localStorage.getItem("serena_carga_continua_counter");
    return cnt ? parseInt(cnt, 10) : 0;
  });
  const [cargaDate, setCargaDate] = useState(() => {
    return localStorage.getItem("serena_carga_continua_date") || new Date().toISOString().slice(0, 10);
  });

  // ---------- Form fields ----------
  const [title, setTitle] = useState(`${product.title} (Copia)`);
  const [brand, setBrand] = useState(product.brand);
  const [mood, setMood] = useState(product.mood);
  const [color, setColor] = useState(product.color);
  const [price, setPrice] = useState(product.price);
  const [stockMap, setStockMap] = useState<Record<string, number>>({
    "85": 0,
    "90": 0,
    "95": 0,
    "100": 0,
    "105": 0,
    "110": 0,
  });
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  // ---------- Draft persistence ----------
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const maxTimer = useRef<NodeJS.Timeout | null>(null);

  const saveDraft = useCallback(() => {
    const draft = { title, brand, mood, color, price, stockMap };
    localStorage.setItem(`serena_express_draft_${product.id}`, JSON.stringify(draft));
    const now = new Date();
    localStorage.setItem(`serena_express_draft_timestamp_${product.id}`, now.toISOString());
    setDraftSavedAt(now);
  }, [title, brand, mood, color, price, stockMap, product.id]);

  // debounce 2 s, flush max 10 s
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(saveDraft, 2000);
    if (!maxTimer.current) {
      maxTimer.current = setTimeout(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        saveDraft();
        maxTimer.current = null;
      }, 10000);
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [title, brand, mood, color, price, stockMap, saveDraft]);

  // Save on visibility change (app minimised)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) saveDraft();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [saveDraft]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(`serena_express_draft_${product.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTitle(parsed.title || title);
        setBrand(parsed.brand || brand);
        setMood(parsed.mood || mood);
        setColor(parsed.color || color);
        setPrice(parsed.price || price);
        if (parsed.stockMap) setStockMap(parsed.stockMap);
        toast.info("Borrador express recuperado automáticamente 🩰");
      } catch (_) {}
    }
    const ts = localStorage.getItem(`serena_express_draft_timestamp_${product.id}`);
    if (ts) setDraftSavedAt(new Date(ts));
  }, []);

  // ---------- Haptics ----------
  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(50);
  }, []);

  // ---------- Helpers ----------
  const handleStockChange = useCallback(
    (size: string, diff: number) => {
      triggerHaptic();
      setStockMap((prev) => ({ ...prev, [size]: Math.max(0, (prev[size] || 0) + diff) }));
    },
    [triggerHaptic]
  );

  const copyOriginalStock = useCallback(() => {
    triggerHaptic();
    if (product.stockMap) {
      setStockMap(product.stockMap);
      toast.success("Stock original copiado.");
    } else toast.info("El producto original no tenía stock asignado.");
  }, [product.stockMap, triggerHaptic]);

  // soft warnings (non‑blocking)
  const checkWarnings = useCallback(() => {
    const warnings: string[] = [];
    // sin portada
    if (!product.images?.length && pendingImages.length === 0) warnings.push("⚠️ Este look no tiene portada.");
    // sin stock
    const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);
    if (totalStock === 0) warnings.push("⚠️ Este look aún no tiene stock cargado.");
    // precio vacío
    if (!price || price <= 0) warnings.push("⚠️ Precio no definido o cero.");
    // demasiadas imágenes
    const totalImgs = (product.images?.length || 0) + pendingImages.length;
    if (totalImgs > 5) warnings.push(`⚠️ Se están subiendo ${totalImgs} imágenes (máx 5).`);
    // imágenes oscuras – heurística simple (omitir cálculo pesado)
    // Aquí podríamos usar la media de luminancia, pero por ligereza solo avisamos si alguna imagen es muy pequeña (< 10 KB)
    pendingImages.forEach((img) => {
      if (img.blob.size < 10240) warnings.push("⚠️ Imagen sospechosa de baja calidad.");
    });
    warnings.forEach((msg) => toast(msg, { icon: "⚠️" }));
    return warnings.length === 0; // true if no warnings (but publish still allowed)
  }, [product.images, pendingImages, price, stockMap]);

  // ---------- Publish ----------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishLocked, setPublishLocked] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const handlePublish = useCallback(async () => {
    if (publishLocked) return; // double‑tap guard
    if (!title || !price || price <= 0) {
      toast.error("El nombre y el precio son obligatorios.");
      return;
    }
    checkWarnings(); // muestra avisos, no bloquea
    triggerHaptic();
    setPublishLocked(true);
    setIsSubmitting(true);
    try {
      const payload: Partial<Product> = {
        ...product,
        id: undefined,
        title,
        brand,
        mood,
        color,
        price,
        stockMap,
        createdAt: new Date().toISOString(),
      };
      if (pendingImages.length === 0) {
        payload.imageUrl = product.imageUrl;
        payload.galleryUrls = product.galleryUrls;
      }
      // Simular progreso de upload
      if (pendingImages.length > 0) {
        const step = 100 / pendingImages.length;
        for (let i = 0; i < pendingImages.length; i++) {
          // el onPublish manejará la carga real
          // aquí solo reflejamos el avance
           
          setUploadProgress((prev) => Math.min(100, prev + step));
        }
      }
      await onPublish(payload, pendingImages);

      // Reset upload progress after publish
      setUploadProgress(0);

      // ---- Carga Continua ----
      if (cargaContinua) {
        // incrementar contador y manejar reset diario
        const today = new Date().toISOString().slice(0, 10);
        if (cargaDate !== today) {
          // nuevo día: reset counter
          setCargaCounter(1);
          localStorage.setItem("serena_carga_continua_counter", "1");
          localStorage.setItem("serena_carga_continua_date", today);
          setCargaDate(today);
        } else {
          setCargaCounter((c) => c + 1);
          localStorage.setItem("serena_carga_continua_counter", (cargaCounter + 1).toString());
        }
        // limpiar campos según spec
        setTitle("");
        setPrice(0);
        setStockMap({});
        // mantenemos brand, mood, color, images y presets (no tocados)
        setPendingImages([]);
        // NO cerrar el drawer
        toast.success(`Look publicado. ${cargaCounter + 1} cargados hoy ✨`);
      } else {
        // flujo normal: limpiar draft y cerrar
        localStorage.removeItem(`serena_express_draft_${product.id}`);
        localStorage.removeItem(`serena_express_draft_timestamp_${product.id}`);
        onClose();
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al publicar la prenda.");
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
        setPublishLocked(false);
      }
    }
  }, [publishLocked, title, price, brand, mood, color, stockMap, pendingImages, product, onPublish, onClose, triggerHaptic, cargaContinua, cargaCounter, cargaDate, checkWarnings]);

  // ---------- Mount flag ----------
  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);

  // ---------- Render ----------
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-serena-charcoal/40 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
      <div className="bg-serena-cream w-full sm:max-w-md h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[30px] sm:rounded-3xl shadow-2xl flex flex-col relative animate-in slide-in-from-bottom-full duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-serena-blush/20 bg-serena-cream rounded-t-[30px] sm:rounded-t-3xl sticky top-0 z-10">
          <div>
            <h3 className="font-editorial text-lg font-bold text-serena-charcoal leading-none">Carga Express</h3>
            <p className="text-[10px] text-serena-charcoal/60 font-bold uppercase tracking-widest mt-1">Clonando: {product.title}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-serena-silk text-serena-charcoal rounded-full flex items-center justify-center hover:opacity-70">
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-6">
          {/* Draft recovery banner */}
          {process.env.NEXT_PUBLIC_LOCAL_TESTING_MODE === "true" && (
            <div className="mb-3 p-2 bg-serena-gold/10 text-serena-gold rounded-xl text-xs font-bold text-center">
              Modo prueba local ✨
            </div>
          )}
          {/* Fotos */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-serena-charcoal/70">1. Fotos (Nuevas)</label>
            <ImageUploader onImagesSelected={setPendingImages} maxImages={4} />
            {(product.images?.length ?? 0) > 0 && pendingImages.length === 0 && (
              <p className="text-[9px] text-serena-gold font-bold bg-serena-gold/10 p-2 rounded-xl border border-serena-gold/20">
                Si no subes imágenes nuevas, se heredarán las fotos del look original automáticamente.
              </p>
            )}
          </div>
          {/* Carga Continua Toggle */}
          <div className="flex items-center space-x-2 mt-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-serena-charcoal/70">Carga continua ✨</label>
            <input type="checkbox" checked={cargaContinua} onChange={(e) => {
              setCargaContinua(e.target.checked);
              localStorage.setItem('serena_carga_continua_enabled', e.target.checked.toString());
            }} className="w-4 h-4 text-serena-gold bg-white border-gray-300 rounded" />
          </div>
          {cargaContinua && (
            <p className="text-[9px] text-serena-charcoal/60 mt-1">{cargaCounter} looks cargados hoy ✨</p>
          )}
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-serena-charcoal/70">2. Nombre</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white border border-serena-blush/30 rounded-2xl p-4 text-sm font-bold text-serena-charcoal min-h-[56px] focus:border-serena-gold outline-none smooth-transition" />
          </div>
          {/* Marca y Mood */}
          <div className="grid grid-cols-2 gap-3">
            {/* Marca */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-serena-charcoal/70">3. Marca</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-white border border-serena-blush/30 rounded-2xl p-3 text-xs font-bold text-serena-charcoal min-h-[56px] focus:border-serena-gold outline-none">
                {["Valisere", "Darling", "Hope", "Liz", "Sedução"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            {/* Mood */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-serena-charcoal/70">4. Mood</label>
              <select value={mood} onChange={(e) => setMood(e.target.value as any)} className="w-full bg-white border border-serena-blush/30 rounded-2xl p-3 text-xs font-bold text-serena-charcoal min-h-[56px] focus:border-serena-gold outline-none">
                <option value="dia-a-dia">Día a Día</option>
                <option value="comodo-y-suave">Cómodo y Suave</option>
                <option value="noche-especial">Noche Especial</option>
                <option value="invisible">Invisible</option>
                <option value="elegancia-minimalista">Elegancia Minimal</option>
                <option value="sensual-delicado">Sensual Delicado</option>
                <option value="bridal">Bridal</option>
                <option value="lounge">Lounge</option>
              </select>
            </div>
          </div>
          {/* Color */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-serena-charcoal/70">5. Color Variante</label>
            <div className="flex flex-wrap gap-2">
              {["Rojo", "Negro", "Blanco", "Almendra", "Nude", "Oro", "Azul", "Vino", "Rosa"].map((c) => (
                <button key={c} type="button" onClick={() => { triggerHaptic(); setColor(c); }} className={`min-h-[48px] px-4 rounded-2xl text-xs font-bold smooth-transition border-2 ${color === c ? "bg-serena-gold text-white border-serena-gold" : "bg-white text-serena-charcoal/70 border-serena-blush/30 hover:border-serena-gold/50"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          {/* Precio */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-serena-charcoal/70">6. Precio Final (ARS)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-serena-charcoal/50 font-bold">$</span>
              <input type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full bg-white border border-serena-blush/30 rounded-2xl py-4 pl-8 pr-4 text-lg font-bold text-serena-charcoal min-h-[64px] focus:border-serena-gold outline-none smooth-transition" />
            </div>
          </div>
          {/* Talles y Stock */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-widest text-serena-charcoal/70">7. Talles Disponibles</label>
              <button type="button" onClick={copyOriginalStock} className="text-[9px] font-bold text-serena-gold flex items-center gap-1 bg-serena-gold/10 px-2 py-1.5 rounded-lg active:scale-95 smooth-transition">
                <Copy size={12} /> Copiar Stock Anterior
              </button>
            </div>
            <div className="space-y-2">
              {Object.keys(stockMap).map((size) => {
                const qty = stockMap[size];
                return (
                  <div key={size} className="flex justify-between items-center bg-white p-2 rounded-2xl border border-serena-blush/20">
                    <span className="font-bold text-sm w-12 text-center text-serena-charcoal">T. {size}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => handleStockChange(size, -1)} disabled={qty <= 0} className="w-[52px] h-[52px] bg-serena-silk text-serena-charcoal rounded-xl flex items-center justify-center text-xl active:bg-serena-blush/30 disabled:opacity-30 smooth-transition">-</button>
                      <div className="w-[60px] text-center font-editorial text-xl font-bold text-serena-charcoal">{qty}</div>
                      <button type="button" onClick={() => handleStockChange(size, 1)} className="w-[52px] h-[52px] bg-serena-charcoal text-white rounded-xl flex items-center justify-center text-xl active:scale-95 smooth-transition shadow-md">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="p-5 border-t border-serena-blush/20 bg-serena-cream z-10 mb-2 sm:mb-0">
          <button onClick={handlePublish} disabled={isSubmitting} className="w-full bg-serena-gold text-white text-sm font-bold uppercase tracking-widest min-h-[64px] rounded-2xl shadow-[0_8px_20px_rgba(207,181,146,0.3)] active:scale-95 smooth-transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100">
            {isSubmitting ? "Publicando..." : "Publicar Look Express"}
            {!isSubmitting && <Check size={20} />}
          </button>
          {/* Upload progress bar */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="mt-2 w-full bg-serena-silk rounded-full h-2 overflow-hidden">
              <div className="bg-serena-gold h-full" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

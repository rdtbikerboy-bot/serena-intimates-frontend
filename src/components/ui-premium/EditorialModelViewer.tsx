"use client";

import { useState, useEffect } from "react";
import { ImageLoader } from "./ImageLoader";

interface EditorialModelViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialSize?: string | null;
}

// Curación editorial premium de fotos representativas de moda íntima (Unsplash editorial fashion)
const MODEL_DATABASE = [
  {
    talle: "S",
    silueta: "petite",
    tono: "clara",
    frontUrl: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600&auto=format&fit=crop",
    sideUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=600&auto=format&fit=crop",
  },
  {
    talle: "M",
    silueta: "classic",
    tono: "media",
    frontUrl: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop",
    sideUrl: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
  },
  {
    talle: "L",
    silueta: "curvy",
    tono: "oliva",
    frontUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop",
    sideUrl: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600&auto=format&fit=crop",
  },
  {
    talle: "XL",
    silueta: "soft curvy",
    tono: "morena",
    frontUrl: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
    sideUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=600&auto=format&fit=crop",
  },
];

export function EditorialModelViewer({ isOpen, onClose, initialSize }: EditorialModelViewerProps) {
  const [talle, setTalle] = useState("M");
  const [silueta, setSilueta] = useState("classic");
  const [tono, setTono] = useState("media");
  
  const [viewAngle, setViewAngle] = useState<"front" | "side">("front");
  const [currentImage, setCurrentImage] = useState(MODEL_DATABASE[1].frontUrl);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sincronizar talle inicial si viene configurado de "Mi Fit"
  useEffect(() => {
    if (initialSize) {
      if (["85", "90"].includes(initialSize)) setTalle("S");
      else if (["95"].includes(initialSize)) setTalle("M");
      else if (["100"].includes(initialSize)) setTalle("L");
      else if (["105"].includes(initialSize)) setTalle("XL");
    }
  }, [initialSize]);

  // Selección inteligente del modelo curado
  useEffect(() => {
    setIsTransitioning(true);
    const timeout = setTimeout(() => {
      // Buscar coincidencia más cercana o por defecto usar el índice medio
      const match = MODEL_DATABASE.find(m => m.talle === talle) || MODEL_DATABASE[1];
      setCurrentImage(viewAngle === "front" ? match.frontUrl : match.sideUrl);
      setIsTransitioning(false);
    }, 600); // Transición lenta cinematográfica de 600ms

    return () => clearTimeout(timeout);
  }, [talle, silueta, tono, viewAngle]);

  const tallesList = ["XS", "S", "M", "L", "XL"];
  const siluetasList = [
    { id: "petite", label: "Petite" },
    { id: "classic", label: "Classic" },
    { id: "athletic", label: "Athletic" },
    { id: "curvy", label: "Curvy" },
    { id: "soft curvy", label: "Soft Curvy" },
  ];
  const tonosList = [
    { id: "clara", label: "Clara", color: "bg-[#F7E2D4]" },
    { id: "media", label: "Media", color: "bg-[#EBC7B3]" },
    { id: "oliva", label: "Oliva", color: "bg-[#D9A384]" },
    { id: "morena", label: "Morena", color: "bg-[#B07A59]" },
    { id: "profunda", label: "Profunda", color: "bg-[#664026]" },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className={`absolute inset-x-0 bottom-0 h-[690px] bg-serena-cream rounded-t-[30px] shadow-[0_-15px_40px_rgba(26,21,18,0.2)] border-t border-serena-blush/30 z-45 transform smooth-transition flex flex-col translate-y-0`}
    >
      {/* Cabecera Editorial */}
      <div className="w-full flex justify-between items-center px-6 py-4.5 border-b border-serena-blush/20">
        <div>
          <h3 className="font-editorial text-base font-bold text-serena-charcoal flex items-center gap-1.5">
            🎀 Modelado Editorial Inclusivo
          </h3>
          <p className="text-[9px] text-serena-gold uppercase tracking-widest mt-0.5 font-bold">Pseudo-3D Studio</p>
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

      <div className="flex-1 overflow-y-auto custom-scroll flex flex-col md:flex-row">
        
        {/* Lado Izquierdo: Visualizador de Modelo con Transiciones Cinematográficas */}
        <div className="relative w-full h-[320px] bg-serena-silk flex items-center justify-center overflow-hidden border-b border-serena-blush/10">
          
          <div className={`w-full h-full transition-all duration-[600ms] ease-[cubic-bezier(0.33,1,0.68,1)] ${isTransitioning ? "opacity-0 scale-[0.985]" : "opacity-100 scale-100"}`}>
            <ImageLoader 
              src={currentImage} 
              alt={`Modelo Serena Talle ${talle}`} 
              className="w-full h-full object-cover"
              priority={true}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-serena-charcoal/50 to-transparent pointer-events-none"></div>

          {/* Toggle de Ángulo (Frente / Perfil) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex bg-serena-cream/90 p-0.5 rounded-full border border-serena-blush/20 shadow-sm z-10">
            <button
              onClick={() => setViewAngle("front")}
              className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full transition-all ${
                viewAngle === "front" ? "bg-serena-charcoal text-serena-cream" : "text-serena-charcoal/60"
              }`}
            >
              Frente
            </button>
            <button
              onClick={() => setViewAngle("side")}
              className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full transition-all ${
                viewAngle === "side" ? "bg-serena-charcoal text-serena-cream" : "text-serena-charcoal/60"
              }`}
            >
              Perfil
            </button>
          </div>

          {/* Sello de Privacidad Absoluta */}
          <div className="absolute top-3 left-3 bg-serena-charcoal/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-[8px] font-bold text-white uppercase tracking-widest flex items-center gap-1">
            <span>🛡️</span> Privacidad Serena
          </div>
        </div>

        {/* Lado Derecho: Sliders Táctiles de Configuración Editorial */}
        <div className="p-5 space-y-5 flex-shrink-0">
          
          {/* Slider 1: Talle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-serena-charcoal/70">
              <span>1. Talle de Representación</span>
              <span className="text-serena-gold font-bold">Talle {talle}</span>
            </div>
            <div className="relative pt-1">
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1"
                value={tallesList.indexOf(talle)}
                onChange={(e) => setTalle(tallesList[parseInt(e.target.value)] || "M")}
                className="w-full h-1 bg-serena-blush rounded-lg appearance-none cursor-pointer accent-serena-gold"
              />
              <div className="flex justify-between text-[8px] font-semibold text-serena-charcoal/40 px-1 mt-1">
                <span>XS</span>
                <span>S</span>
                <span>M</span>
                <span>L</span>
                <span>XL</span>
              </div>
            </div>
          </div>

          {/* Slider 2: Silueta */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-serena-charcoal/70">
              <span>2. Tipo de Silueta</span>
              <span className="text-serena-gold font-bold">
                {siluetasList.find(s => s.id === silueta)?.label}
              </span>
            </div>
            <div className="relative pt-1">
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1"
                value={siluetasList.findIndex(s => s.id === silueta)}
                onChange={(e) => setSilueta(siluetasList[parseInt(e.target.value)]?.id || "classic")}
                className="w-full h-1 bg-serena-blush rounded-lg appearance-none cursor-pointer accent-serena-gold"
              />
              <div className="flex justify-between text-[8px] font-semibold text-serena-charcoal/40 px-1 mt-1">
                {siluetasList.map(s => (
                  <span key={s.id}>{s.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Selector 3: Tonos de Piel Inclusivos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-serena-charcoal/70">
              <span>3. Tonalidad de Piel</span>
              <span className="text-serena-gold font-bold">
                {tonosList.find(t => t.id === tono)?.label}
              </span>
            </div>
            <div className="flex justify-between gap-3 pt-1">
              {tonosList.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTono(t.id)}
                  className={`w-8 h-8 rounded-full border transition-all ${t.color} ${
                    tono === t.id 
                      ? "ring-2 ring-serena-gold scale-110 border-white" 
                      : "border-serena-blush/50"
                  }`}
                  aria-label={`Piel ${t.label}`}
                />
              ))}
            </div>
          </div>

          {/* Sello de Dirección de Fotografía Unificada */}
          <div className="bg-serena-silk p-3.5 rounded-xl border border-serena-blush/20 text-[10px] text-serena-charcoal/60 leading-normal flex items-start gap-2.5">
            <span className="text-xs">✨</span>
            <p>
              <strong>Dirección Fotográfica Serena:</strong> Iluminación cinematográfica cálida y poses naturales que realzan la elegancia textil sin retoques corporales.
            </p>
          </div>

        </div>

      </div>

      {/* Botón de Aplicación de Talles */}
      <div className="p-4 border-t border-serena-blush/10 bg-serena-cream/90 flex gap-2">
        <button
          onClick={onClose}
          className="w-full bg-serena-charcoal text-white text-xs font-semibold py-3.5 rounded-xl uppercase tracking-wider hover:opacity-90 active:scale-98 smooth-transition"
        >
          Aplicar Configuración
        </button>
      </div>

    </div>
  );
}

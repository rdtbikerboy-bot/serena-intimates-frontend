"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/store/useUIStore";
import { crmService } from "@/services/supabaseService";
import { toast } from "sonner";
import { Sparkles, Calendar, Clock } from "lucide-react";


export function TurnoDrawer() {
  const isTurnoOpen = useUIStore((state) => state.isTurnoOpen);
  const setTurnoOpen = useUIStore((state) => state.setTurnoOpen);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [timeBlock, setTimeBlock] = useState("Tarde 16:00 - 18:00");
  const [preferences, setPreferences] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when drawer opens and lock body scroll
  useEffect(() => {
    if (isTurnoOpen) {
      nameInputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isTurnoOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Guardar cliente temporal en CRM
      await crmService.saveClient({
        name,
        whatsapp,
        status: "nueva_consulta",
        notes: `Turno Solicitado: ${timeBlock}. Pref: ${preferences}`,
        tags: ["Turno Showroom"],
        preferredSizes: [],
        preferredBrands: [],
        preferredMoods: []
      });

      // Reset form fields after successful save
      setName("");
      setWhatsapp("");
      setPreferences("");
      setTimeBlock("Tarde 16:00 - 18:00");

      // 2. Disparar saludo elegante a WhatsApp
      const phone = "543874022233"; // Serena Config
      const msg = `Hola Serena 🌷 Quisiera reservar un turno de visita en el Showroom de Salta.\n\n✨ *Nombre:* ${name}\n📞 *WhatsApp:* ${whatsapp}\n🕒 *Horario:* ${timeBlock}\n🎀 *Preferencia:* ${preferences || "Curaduría general"}\n\n¿Me confirman disponibilidad? Gracias 🩰`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

      toast.success("¡Tu solicitud ha sido agendada! 🩰", {
        description: "Abriendo WhatsApp para coordinar tu ingreso al showroom."
      });

      setTimeout(() => {
        window.open(url, "_blank");
        setTurnoOpen(false);
      }, 1000);
    } catch (error) {
      toast.error("Hubo un problema al agendar. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTurnoOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-serena-charcoal/20 backdrop-blur-xs z-50 flex items-end justify-center smooth-transition"
      onClick={() => setTurnoOpen(false)}
    >
      <div 
        className="w-full max-w-[420px] bg-serena-cream rounded-t-[30px] shadow-[0_-15px_40px_rgba(26,21,18,0.15)] border-t border-serena-blush/30 transform smooth-transition flex flex-col translate-y-0"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="w-full flex justify-between items-center px-6 py-5 border-b border-serena-blush/20">
          <h3 className="font-editorial text-lg font-bold text-serena-charcoal flex items-center gap-2">
            <Calendar className="w-4 h-4 text-serena-gold" />
            Reservar Cita Showroom Salta
          </h3>
          <button 
            onClick={() => setTurnoOpen(false)} 
            className="text-serena-charcoal hover:opacity-60 transition-opacity"
            aria-label="Cerrar Agenda"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scroll font-ui">
          <p className="text-[10px] text-serena-charcoal/60 leading-relaxed uppercase tracking-wider">
            Reserva una experiencia boutique personalizada de prueba en nuestro showroom físico.
          </p>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="block text-[8px] uppercase tracking-widest text-serena-charcoal/70 font-bold">
              Nombre Completo *
            </label>
            <input 
              ref={nameInputRef}
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sofía Belgrano"
              className="w-full bg-white border border-serena-blush/30 rounded-xl p-3 text-xs text-serena-charcoal outline-none focus:border-serena-gold smooth-transition min-h-[44px]"
              required
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <label className="block text-[8px] uppercase tracking-widest text-serena-charcoal/70 font-bold">
              Teléfono de Contacto *
            </label>
            <input 
              type="tel" 
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ej: +54 9 387 123456"
              className="w-full bg-white border border-serena-blush/30 rounded-xl p-3 text-xs text-serena-charcoal outline-none focus:border-serena-gold smooth-transition min-h-[44px]"
              required
            />
          </div>

          {/* Bloque Horario */}
          <div className="space-y-1.5">
            <label className="block text-[8px] uppercase tracking-widest text-serena-charcoal/70 font-bold">
              Preferencia de Horario *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                "Mañana 10:00 - 12:00",
                "Tarde 16:00 - 18:00",
                "Tarde 18:00 - 20:00"
              ].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeBlock(slot)}
                  className={`w-full text-left p-3.5 rounded-xl text-xs font-bold smooth-transition border flex items-center justify-between min-h-[48px] ${
                    timeBlock === slot
                      ? "bg-serena-charcoal text-white border-serena-charcoal shadow-2xs"
                      : "bg-white border-serena-blush/20 text-serena-charcoal hover:bg-serena-silk"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {slot}
                  </span>
                  {timeBlock === slot && <span className="text-[10px]">🩰 Selected</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Preferencias estéticas */}
          <div className="space-y-1.5">
            <label className="block text-[8px] uppercase tracking-widest text-serena-charcoal/70 font-bold">
              ¿Buscas algún talle o conjunto en especial?
            </label>
            <textarea 
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Ej: Busco corpiño talle 95 en Oliva Silk..."
              className="w-full bg-white border border-serena-blush/30 rounded-xl p-3 text-xs text-serena-charcoal outline-none focus:border-serena-gold smooth-transition min-h-[80px] resize-none"
            />
          </div>

          {/* Confirmación CTA */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-serena-gold hover:bg-serena-gold/90 text-white text-[10px] font-bold py-4 rounded-2xl shadow-md uppercase tracking-widest smooth-transition flex items-center justify-center gap-1.5 min-h-[48px] active:scale-95 duration-100"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {isSubmitting ? "Confirmando..." : "Confirmar Turno Showroom 🩰"}
          </button>
        </form>
      </div>
    </div>
  );
}

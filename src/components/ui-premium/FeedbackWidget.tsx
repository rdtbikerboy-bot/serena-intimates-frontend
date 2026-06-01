"use client";

import React, { useState } from "react";
import { Sparkles, X, MessageSquareHeart } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/services/supabase";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [visualRating, setVisualRating] = useState<number>(0);
  const [usabilityRating, setUsabilityRating] = useState<number>(0);
  const [speedRating, setSpeedRating] = useState<number>(0);
  const [likedMost, setLikedMost] = useState("");
  const [needsImprovement, setNeedsImprovement] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (visualRating === 0 || usabilityRating === 0 || speedRating === 0) {
      alert("Por favor califica todos los aspectos para ayudarnos a mejorar. 🤍");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from("editorial_feedback").insert({
          visual_experience: visualRating,
          usability: usabilityRating,
          speed: speedRating,
          liked_most: likedMost,
          needs_improvement: needsImprovement
        });
        
        if (error) throw error;
      } else {
        // Fallback local
        const saved = localStorage.getItem("serena_feedback_temp");
        const list = saved ? JSON.parse(saved) : [];
        list.push({ visualRating, usabilityRating, speedRating, likedMost, needsImprovement, date: new Date().toISOString() });
        localStorage.setItem("serena_feedback_temp", JSON.stringify(list));
      }
      
      setStep("success");
      setTimeout(() => {
        setIsOpen(false);
        setStep("form");
        setVisualRating(0);
        setUsabilityRating(0);
        setSpeedRating(0);
        setLikedMost("");
        setNeedsImprovement("");
      }, 3000);
      
    } catch (err) {
      alert("Hubo un problema al enviar tus comentarios. ¡Gracias de todos modos!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="flex flex-col gap-1.5 mb-4">
      <span className="text-[10px] font-bold text-serena-charcoal uppercase tracking-widest">{label}</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              star <= value 
                ? "bg-serena-gold text-white border-serena-gold scale-110 shadow-md" 
                : "bg-serena-cream text-serena-charcoal/30 border-serena-blush/40 hover:bg-serena-silk"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Subtle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 z-40 bg-white/80 backdrop-blur-md border border-serena-gold/30 text-serena-charcoal text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 font-ui"
      >
        <MessageSquareHeart className="w-3.5 h-3.5 text-serena-gold" />
        Tu mirada nos inspira
      </button>

      {/* Ultra Simple Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-serena-charcoal/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="bg-serena-cream w-full max-w-sm rounded-[30px] p-6 relative shadow-2xl border border-serena-blush/30 animate-fade-in z-10">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-serena-charcoal/50 hover:text-serena-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            {step === "form" ? (
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="text-center mb-6">
                  <Sparkles className="w-5 h-5 text-serena-gold mx-auto mb-2" />
                  <h3 className="font-editorial text-lg italic text-serena-charcoal font-bold">Vista Privada Serena</h3>
                  <p className="text-[10px] text-serena-charcoal/60 uppercase tracking-widest mt-1">Tu experiencia es nuestro lujo</p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-serena-blush/20 mb-4">
                  <StarRating value={visualRating} onChange={setVisualRating} label="Diseño Visual y Estética" />
                  <StarRating value={usabilityRating} onChange={setUsabilityRating} label="Facilidad de Navegación" />
                  <StarRating value={speedRating} onChange={setSpeedRating} label="Velocidad y Respuesta Táctil" />
                </div>

                <div className="space-y-3 mb-5">
                  <textarea 
                    value={likedMost}
                    onChange={(e) => setLikedMost(e.target.value)}
                    placeholder="¿Qué detalle te gustó más?"
                    className="w-full bg-white/50 border border-serena-blush/30 rounded-xl p-3 text-xs outline-none focus:border-serena-gold/50 resize-none h-16 font-ui"
                  />
                  <textarea 
                    value={needsImprovement}
                    onChange={(e) => setNeedsImprovement(e.target.value)}
                    placeholder="¿Qué sentirías que podemos pulir?"
                    className="w-full bg-white/50 border border-serena-blush/30 rounded-xl p-3 text-xs outline-none focus:border-serena-gold/50 resize-none h-16 font-ui"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-serena-gold text-white text-[11px] font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Compartir Apreciación"}
                </button>
              </form>
            ) : (
              <div className="py-10 text-center animate-fade-in flex flex-col items-center">
                <HeartIcon className="w-10 h-10 text-serena-gold mb-3 fill-serena-gold/20" />
                <h3 className="font-editorial text-xl italic text-serena-charcoal font-bold mb-2">Gracias por tu mirada</h3>
                <p className="text-xs text-serena-charcoal/70 px-4">Tus comentarios son fundamentales para refinar la experiencia final de Serena Intimates.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const HeartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

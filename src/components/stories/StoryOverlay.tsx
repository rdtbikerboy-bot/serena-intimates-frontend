"use client";

import { useEffect, useState } from "react";

export interface StoryData {
  title: string;
  avatar: string;
  image: string;
  caption: string;
  sub: string;
  actionText: string;
  onAction: () => void;
}

interface StoryOverlayProps {
  isOpen: boolean;
  story: StoryData | null;
  onClose: () => void;
}

export function StoryOverlay({ isOpen, story, onClose }: StoryOverlayProps) {
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (isOpen && story) {
      setProgressWidth(0);
      
      // Esperar un frame e iniciar progreso a 100%
      const frame = requestAnimationFrame(() => {
        setProgressWidth(100);
      });

      // Cerrar story automáticamente después de 5 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }
  }, [isOpen, story, onClose]);

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 max-w-[420px] mx-auto bg-serena-charcoal z-50 flex flex-col text-white overflow-hidden smooth-transition">
      
      {/* Header Overlaid */}
      <div className="w-full px-4 pt-8 pb-3 flex flex-col gap-2 bg-gradient-to-b from-serena-charcoal/80 to-transparent absolute top-0 inset-x-0 z-20">
        
        {/* Progress Bar Container */}
        <div className="h-1 bg-serena-cream/30 w-full rounded-full overflow-hidden">
          <div 
            className="h-full bg-serena-gold rounded-full transition-all duration-[5000ms] linear"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-serena-blush overflow-hidden bg-serena-cream">
              <img src={story.avatar} alt={story.title} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase font-ui">
              {story.title}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Cerrar Historia"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Portrait Image */}
      <div className="flex-1 w-full bg-serena-charcoal flex items-center justify-center relative">
        <img 
          src={story.image} 
          alt={story.caption} 
          className="w-full h-full object-cover"
        />
        
        {/* Editorial Overlay Footer */}
        <div className="absolute bottom-12 inset-x-6 text-center space-y-4 bg-gradient-to-t from-serena-charcoal/90 via-serena-charcoal/40 to-transparent pt-16 pb-4 z-10">
          <h3 className="font-editorial text-2xl font-bold italic leading-tight text-serena-silk">
            {story.caption}
          </h3>
          <p className="text-xs text-white/80 max-w-xs mx-auto font-ui leading-relaxed">
            {story.sub}
          </p>
          
          <button 
            onClick={story.onAction} 
            className="inline-block bg-serena-gold text-white text-xs font-bold px-6 py-3 rounded-full uppercase tracking-wider shadow-md hover:bg-serena-cream hover:text-serena-charcoal smooth-transition"
          >
            {story.actionText}
          </button>
        </div>
      </div>
    </div>
  );
}

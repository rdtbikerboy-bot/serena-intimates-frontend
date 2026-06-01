"use client";

import React, { useState, useEffect } from "react";

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Mantener la pantalla de splash por 2.5 segundos
    const timer = setTimeout(() => {
      setIsFading(true); // Iniciar transición de fade-out
      
      // Remover del DOM después de los 600ms de transición
      setTimeout(() => {
        setShowSplash(false);
      }, 600);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-serena-cream transition-opacity ease-in-out`}
          style={{ transitionDuration: "600ms", opacity: isFading ? 0 : 1 }}
        >
          <img
            src="/images/splash.jpg"
            alt="Serena Intimates Splash"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {children}
    </>
  );
}

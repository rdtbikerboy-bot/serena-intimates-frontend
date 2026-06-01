"use client";

import { useState, useEffect } from "react";

export interface FitState {
  busto: string | null;
  bombacha: string | null;
  styles: string[];
}

export function useFit() {
  const [fitState, setFitState] = useState<FitState>({
    busto: null,
    bombacha: null,
    styles: []
  });

  const [isApplied, setIsApplied] = useState(false);

  // Cargar estado inicial desde localStorage en cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_fit_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFitState(parsed);
          setIsApplied(true);
        } catch (e) {
          console.error("Error parsing fit profile", e);
        }
      }
    }
  }, []);

  const selectBusto = (val: string) => {
    setFitState(prev => {
      const updated = { ...prev, busto: val };
      return updated;
    });
  };

  const selectBombacha = (val: string) => {
    setFitState(prev => {
      const updated = { ...prev, bombacha: val };
      return updated;
    });
  };

  const toggleStyle = (style: string) => {
    setFitState(prev => {
      const isSelected = prev.styles.includes(style);
      const updatedStyles = isSelected
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style];
      const updated = { ...prev, styles: updatedStyles };
      return updated;
    });
  };

  const applyFit = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("serena_fit_profile", JSON.stringify(fitState));
    }
    setIsApplied(true);
  };

  const clearFit = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("serena_fit_profile");
    }
    setFitState({ busto: null, bombacha: null, styles: [] });
    setIsApplied(false);
  };

  return {
    fitState,
    isApplied,
    selectBusto,
    selectBombacha,
    toggleStyle,
    applyFit,
    clearFit
  };
}

"use client";

import React, { useEffect, useRef } from 'react';
import { ConfidenceResult } from '@/domain/fitConfidenceEngine';
import { useFunnelStore } from '@/store/useFunnelStore';

export function FitConfidenceBadge({ result, productId }: { result: ConfidenceResult, productId: string }) {
  const hasViewedRef = useRef(false);

  useEffect(() => {
    if ((result.level === 'HIGH' || result.level === 'MEDIUM') && !hasViewedRef.current) {
      hasViewedRef.current = true;
      useFunnelStore.getState().trackEvent("FIT_CONFIDENCE_VIEW", productId, undefined, {
        level: result.level,
        recommendedSize: result.recommendedSize
      });
    }
  }, [result.level, result.recommendedSize, productId]);

  if (result.level === 'NONE' || result.level === 'LOW') return null;

  return (
    <div className="flex items-center gap-3 mb-4 bg-serena-silk/40 border border-serena-blush/30 px-4 py-3 rounded-2xl smooth-transition">
      <div className="bg-serena-cream rounded-full p-1 border border-serena-gold/20 flex items-center justify-center shadow-xs">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-serena-gold" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div>
        {result.level === 'HIGH' ? (
          <p className="text-[11px] font-bold text-serena-charcoal uppercase tracking-widest font-ui">
            Tu talle ideal es <span className="text-serena-gold">{result.recommendedSize}</span>
          </p>
        ) : (
          <p className="text-[11px] font-bold text-serena-charcoal uppercase tracking-widest font-ui">
            Compatible con tu perfil
          </p>
        )}
        <p className="text-[10px] text-serena-charcoal/60 mt-0.5">
          {result.level === 'HIGH' ? 'Alta confianza de calce perfecto.' : 'Medida dentro de rango.'}
        </p>
      </div>
    </div>
  );
}

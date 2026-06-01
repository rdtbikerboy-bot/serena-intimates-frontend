"use client";

import { useReportWebVitals } from 'next/web-vitals';
import { serenaLogger } from '@/core/logger';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Solo monitorear métricas críticas en producción para evitar spam local,
    // o forzar si estamos probando Soft Launch (Fase 12)
    const body = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    };

    // Podríamos enviarlo a Supabase, pero por ahora lo registramos en logger de sistema local
    // En producción esto iría a `systemEventsService` o Google Analytics.
    serenaLogger.info(`[CWV] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
  });

  return null;
}

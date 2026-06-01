"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,   // 5 minutos de cache activa (stale)
            gcTime: 1000 * 60 * 30,      // 30 minutos en recolector de basura (gcTime)
            retry: 2,                    // Reintentar dos veces en caso de falla de red (Salta móvil)
            retryDelay: (attempt) => Math.min(attempt * 1500, 5000), // Retardo exponencial para mitigar microcortes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

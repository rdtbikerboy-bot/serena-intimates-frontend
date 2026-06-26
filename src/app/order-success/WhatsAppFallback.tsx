"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function WhatsAppFallback() {
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const url = sessionStorage.getItem("lastWaUrl");
    if (url) {
      setWaUrl(url);
    }
  }, []);

  if (!waUrl) return null;

  return (
    <div className="mt-6">
      <a 
        href={waUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={() => clearCart()}
        className="inline-block bg-green-500 text-white font-bold py-3 px-6 rounded-2xl hover:bg-green-600 transition-colors"
      >
        Abrir WhatsApp nuevamente
      </a>
    </div>
  );
}

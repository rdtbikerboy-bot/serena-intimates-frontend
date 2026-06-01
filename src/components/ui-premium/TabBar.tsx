"use client";

import { useFavoritesStore } from "@/store/favoritesStore";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isFitApplied: boolean;
  favoritesCount: number;
}

export function TabBar({ activeTab, onTabChange, isFitApplied, favoritesCount }: TabBarProps) {
  const _hasHydrated = useFavoritesStore(s => s._hasHydrated);

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-20 bg-serena-cream/95 border-t border-serena-blush/30 flex justify-around items-center px-4 pb-2 z-20 shadow-[0_-5px_15px_rgba(26,21,18,0.02)]">
      <button 
        onClick={() => onTabChange("discover")} 
        className={`flex flex-col items-center gap-1 smooth-transition ${
          activeTab === "discover" ? "text-serena-gold scale-[1.02]" : "text-serena-charcoal/70 hover:text-serena-gold"
        }`}
        aria-label="Descubrir Looks"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M9 2.25a.75.75 0 0 1 .75.75v1.506a6.002 6.002 0 0 1 4.5 4.5H15.75a.75.75 0 0 1 0 1.5h-1.506a6.002 6.002 0 0 1-4.5 4.5V15.75a.75.75 0 0 1-1.5 0v-1.506a6.002 6.002 0 0 1-4.5-4.5H2.25a.75.75 0 0 1 0-1.5h1.506a6.002 6.002 0 0 1 4.5-4.5V3a.75.75 0 0 1 .75-.75Zm-.75 5.25a4.5 4.5 0 0 0-4.5 4.5 4.5 4.5 0 0 0 4.5 4.5 4.5 4.5 0 0 0 4.5-4.5 4.5 4.5 0 0 0-4.5-4.5Z" clipRule="evenodd" />
        </svg>
        <span className="text-[10px] font-semibold tracking-wider font-ui uppercase">Descubrir</span>
      </button>

      <button 
        onClick={() => onTabChange("fit")} 
        className={`relative flex flex-col items-center gap-1 smooth-transition ${
          activeTab === "fit" ? "text-serena-gold scale-[1.02]" : "text-serena-charcoal/70 hover:text-serena-gold"
        }`}
        aria-label="Perfil Mi Fit"
      >
        {isFitApplied && (
          <div className="absolute top-0 right-1 w-2.5 h-2.5 bg-serena-gold rounded-full border border-serena-cream animate-pulse"></div>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1-1.622-3.395m3.02 0a15.998 15.998 0 0 0 3.388-1.62M9.53 9.53c.399 0 .78-.078 1.128-.22a3 3 0 0 0-1.128-5.78 4.5 4.5 0 0 0-2.245 8.4c.348-.142.729-.22 1.128-.22ZM16.122 9.53c0-.399-.078-.78-.22-1.128a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.246 4.5 4.5 0 0 0 8.4-2.246c0-.398-.078-.779-.22-1.128Zm0 0a15.996 15.996 0 0 0 3.395-1.622m-5.018-.025a15.994 15.994 0 0 1-1.622-3.395m3.02 0a15.998 15.998 0 0 0 3.388-1.62M16.122 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.996 15.996 0 0 0 3.395-1.622m-5.018-.025a15.998 15.998 0 0 1-1.622-3.389m3.02 0a15.998 15.998 0 0 0 3.388-1.62Z" />
        </svg>
        <span className="text-[10px] font-semibold tracking-wider font-ui uppercase">Mi Fit</span>
      </button>

      <button 
        onClick={() => onTabChange("favorites")} 
        className={`flex flex-col items-center gap-1 smooth-transition ${
          activeTab === "favorites" ? "text-serena-gold scale-[1.02]" : "text-serena-charcoal/70 hover:text-serena-gold"
        }`}
        aria-label="Mis Favoritos"
      >
        <span className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          {_hasHydrated && favoritesCount > 0 && (
            <span className="absolute -top-1 -right-2.5 bg-serena-gold text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-bounce">
              {favoritesCount}
            </span>
          )}
        </span>
        <span className="text-[10px] font-semibold tracking-wider font-ui uppercase">Favoritos</span>
      </button>
    </nav>
  );
}

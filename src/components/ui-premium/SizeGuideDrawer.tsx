"use client";

interface SizeGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideDrawer({ isOpen, onClose }: SizeGuideDrawerProps) {
  return (
    <div 
      className={`fixed inset-x-0 bottom-0 max-w-[420px] mx-auto h-[650px] bg-serena-cream rounded-t-[30px] shadow-[0_-15px_40px_rgba(26,21,18,0.15)] border-t border-serena-blush/30 z-50 transform smooth-transition flex flex-col ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 py-5 border-b border-serena-blush/20">
        <h3 className="font-editorial text-lg font-bold text-serena-charcoal flex items-center gap-2">
          🩰 Guía de Talles Serena
        </h3>
        <button 
          onClick={onClose} 
          className="text-serena-charcoal hover:opacity-60 transition-opacity"
          aria-label="Cerrar Guía"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll text-xs text-serena-charcoal/80 leading-relaxed font-ui">
        
        {/* Intro Emocional */}
        <div className="bg-serena-silk p-4 rounded-2xl border border-serena-blush/30">
          <p>
            En Serena sabemos que la comodidad es clave. Mídete con una cinta métrica sin ajustar y encuentra tu correspondencia perfecta. Si tienes dudas, nuestra asesora te guiará con gusto por WhatsApp.
          </p>
        </div>

        {/* Tabla Corpiño */}
        <div>
          <h4 className="font-editorial text-sm font-bold text-serena-charcoal mb-3">Medidas de Corpiño (Superior)</h4>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-serena-blush/20 border-b border-serena-blush/30 text-serena-gold font-bold">
                <th className="py-2.5">Talle</th>
                <th className="py-2.5">Busto (cm)</th>
                <th className="py-2.5">Bajo Busto (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-serena-blush/10">
              <tr>
                <td className="py-2.5 font-bold">85</td>
                <td className="py-2.5">81 - 85 cm</td>
                <td className="py-2.5">68 - 72 cm</td>
              </tr>
              <tr className="bg-serena-silk/25">
                <td className="py-2.5 font-bold">90</td>
                <td className="py-2.5">86 - 90 cm</td>
                <td className="py-2.5">73 - 77 cm</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold">95</td>
                <td className="py-2.5">91 - 95 cm</td>
                <td className="py-2.5">78 - 82 cm</td>
              </tr>
              <tr className="bg-serena-silk/25">
                <td className="py-2.5 font-bold">100</td>
                <td className="py-2.5">96 - 100 cm</td>
                <td className="py-2.5">83 - 87 cm</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold">105</td>
                <td className="py-2.5">101 - 105 cm</td>
                <td className="py-2.5">88 - 92 cm</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabla Bombacha */}
        <div>
          <h4 className="font-editorial text-sm font-bold text-serena-charcoal mb-3">Medidas de Bombacha (Inferior)</h4>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-serena-blush/20 border-b border-serena-blush/30 text-serena-gold font-bold">
                <th className="py-2.5">Talle</th>
                <th className="py-2.5">Cadera (cm)</th>
                <th className="py-2.5">Equivalencia Pantalón</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-serena-blush/10">
              <tr>
                <td className="py-2.5 font-bold">S</td>
                <td className="py-2.5">85 - 90 cm</td>
                <td className="py-2.5">Talle 34 - 36</td>
              </tr>
              <tr className="bg-serena-silk/25">
                <td className="py-2.5 font-bold">M</td>
                <td className="py-2.5">91 - 96 cm</td>
                <td className="py-2.5">Talle 38 - 40</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold">L</td>
                <td className="py-2.5">97 - 102 cm</td>
                <td className="py-2.5">Talle 42 - 44</td>
              </tr>
              <tr className="bg-serena-silk/25">
                <td className="py-2.5 font-bold">XL</td>
                <td className="py-2.5">103 - 108 cm</td>
                <td className="py-2.5">Talle 46 - 48</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Button Action */}
      <div className="p-6 border-t border-serena-blush/20 bg-serena-cream">
        <button 
          onClick={onClose} 
          className="w-full bg-serena-charcoal text-white text-xs font-semibold py-4 rounded-2xl uppercase tracking-wider hover:opacity-90 smooth-transition active:scale-[0.98]"
        >
          Entendido, Volver
        </button>
      </div>
    </div>
  );
}

"use client";

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDrawer({ isOpen, onClose }: HelpDrawerProps) {
  const contactAsesora = () => {
    const phone = "543874022233";
    const msg = "✨ ¡Hola! Necesito asesoramiento personalizado para elegir mi talle ideal en Serena Intimates. ¿Me ayudan? 🩰";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div 
      className={`fixed inset-x-0 bottom-0 max-w-[420px] mx-auto h-[500px] bg-serena-cream rounded-t-[30px] shadow-[0_-15px_40px_rgba(26,21,18,0.15)] border-t border-serena-blush/30 z-50 transform smooth-transition flex flex-col ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 py-5 border-b border-serena-blush/20">
        <h3 className="font-editorial text-lg font-bold text-serena-charcoal flex items-center gap-2">
          🔒 Confianza & Asistencia
        </h3>
        <button 
          onClick={onClose} 
          className="text-serena-charcoal hover:opacity-60 transition-opacity"
          aria-label="Cerrar Ayuda"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scroll text-xs text-serena-charcoal/80 leading-relaxed font-ui">
        
        <div className="space-y-2">
          <h4 className="font-editorial text-sm font-bold text-serena-charcoal flex items-center gap-1.5">
            <span>📦</span> Empaque 100% Discreto
          </h4>
          <p>
            Todos tus pedidos se entregan en cajas o bolsas de seguridad totalmente neutras, sin logos externos ni referencias al contenido, garantizando tu privacidad absoluta desde nuestro taller hasta tu puerta.
          </p>
        </div>

        <div className="space-y-2 border-t border-serena-blush/15 pt-4">
          <h4 className="font-editorial text-sm font-bold text-serena-charcoal flex items-center gap-1.5">
            <span>🩰</span> Cambios y Garantía de Ajuste
          </h4>
          <p>
            ¿No te quedó como esperabas? No te preocupes. Ofrecemos cambios de talle totalmente gratuitos a domicilio en Salta Capital dentro de los 15 días de recibida la compra. Queremos que te sientas cómoda y segura.
          </p>
        </div>

        <div className="space-y-2 border-t border-serena-blush/15 pt-4">
          <h4 className="font-editorial text-sm font-bold text-serena-charcoal flex items-center gap-1.5">
            <span>💬</span> Asistencia Humana Directa
          </h4>
          <p>
            ¿Necesitas ayuda para elegir tu modelo o medirte? Haz clic abajo para chatear directamente con nuestra asesora personalizada y armar tu look ideal.
          </p>
        </div>

      </div>

      {/* Action CTA */}
      <div className="p-6 border-t border-serena-blush/20 bg-serena-cream/50 flex gap-2">
        <button 
          onClick={contactAsesora} 
          className="flex-1 bg-serena-gold text-white text-xs font-semibold py-4 rounded-2xl shadow-md uppercase tracking-wider hover:opacity-90 smooth-transition flex items-center justify-center gap-1.5"
        >
          <span>💬 Hablar con Asesora</span>
        </button>
      </div>
    </div>
  );
}

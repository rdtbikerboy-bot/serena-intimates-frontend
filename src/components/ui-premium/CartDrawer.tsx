'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Hook oficial para el App Router de Next.js

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems?: any[]; // Duck-typing estructural temporal para independizar el componente
}

export default function CartDrawer({ isOpen, onClose, cartItems = [] }: CartDrawerProps) {
  const router = useRouter(); // Instanciación del enrutador para sanar el error de referencia

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push('/checkout'); // Navegación segura hacia la orquestación de pago
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white p-6 shadow-xl flex flex-col justify-between">

          {/* Encabezado del Carrito Premium */}
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-semibold text-neutral-800 tracking-wide uppercase">
              Tu Carrito Premium
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Cerrar carrito"
            >
              ✕
            </button>
          </div>

          {/* Listado de Productos Inyectados */}
          <div className="flex-1 overflow-y-auto py-4">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                <p className="text-sm">Tu bolsa de compras está vacía.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cartItems.map((item: any, index: number) => (
                  <li key={item.id || index} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h4 className="font-medium text-neutral-700">{item.name || 'Prenda Serena'}</h4>
                      <p className="text-xs text-neutral-400">Talle: {item.size || 'S'} | Color: {item.color || 'Negro'}</p>
                    </div>
                    <span className="font-semibold text-neutral-800">
                      ${item.price || '0.00'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Acciones de Checkout Blindadas */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-base font-medium text-neutral-900 mb-4">
              <p>Subtotal Estimado</p>
              <p>
                ${cartItems.reduce((acc: number, item: any) => acc + (item.price || 0), 0).toFixed(2)}
              </p>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400 mb-4">
              Envíos premium con empaque privado y discreto a todo el país.
            </p>
            <button
              onClick={handleCheckout}
              className="w-full bg-neutral-900 py-3 text-sm font-semibold text-white tracking-widest uppercase hover:bg-neutral-800 transition-colors rounded-none"
            >
              Iniciar Orden de Compra
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
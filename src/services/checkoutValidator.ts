// src/services/checkoutValidator.ts
"use client";

export interface CheckoutData {
  customerName: string;
  phone: string;
  city: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validador del Formulario de Checkout.
 * Aplica reglas sanitarias básicas para asegurar la veracidad de la información de entrega.
 */
export function validateCheckoutData(data: CheckoutData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.customerName?.trim()) {
    errors.customerName = "El nombre es obligatorio para procesar el pedido";
  } else if (data.customerName.trim().length < 3) {
    errors.customerName = "El nombre ingresado debe ser un nombre real válido";
  }

  if (!data.phone?.trim()) {
    errors.phone = "El teléfono celular es obligatorio para el envío por WhatsApp";
  } else {
    // Limpieza básica de caracteres comunes para validar longitud mínima aceptable en Argentina
    const cleanPhone = data.phone.replace(/[\s\-()+]/g, "");
    if (cleanPhone.length < 10) {
      errors.phone = "Por favor, ingresa un número de teléfono válido con código de área (ej: 3874XXXXXX)";
    }
  }

  if (!data.city?.trim()) {
    errors.city = "La dirección de envío o localidad de entrega es obligatoria";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
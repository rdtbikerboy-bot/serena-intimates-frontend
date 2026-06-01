// src/services/checkoutValidator.ts
"use client";

/**
 * Simple validation of checkout customer data.
 * Returns a clean errors object and a boolean flag indicating overall validity.
 */
export interface CheckoutData {
  customerName: string;
  phone: string;
  city: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateCheckoutData(data: CheckoutData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.customerName?.trim()) {
    errors.customerName = "Nombre es obligatorio";
  }
  if (!data.phone?.trim()) {
    errors.phone = "Teléfono es obligatorio";
  }
  if (!data.city?.trim()) {
    errors.city = "Ciudad es obligatoria";
  }
  // Additional validation rules (e.g., phone format) can be added here.

  return { isValid: Object.keys(errors).length === 0, errors };
}

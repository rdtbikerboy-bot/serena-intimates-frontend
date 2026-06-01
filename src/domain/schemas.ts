// =====================================================================
// SCHEMAS.TS — ESQUEMAS DE VALIDACIÓN CON ZOD (NÚCLEO DOMINIO REUTILIZABLE)
// =====================================================================
// Esquemas de validación en tiempo de compilación y de ejecución,
// vinculables a React Hook Form y reutilizables en Server-side API.
// =====================================================================

import { z } from "zod";

// 1. Validadores de Tipos de Dominio
export const productBrandSchema = z.string();
export const productCategorySchema = z.enum([
  "romantico",
  "atrevido",
  "novia",
  "comfy",
  "minimalista",
  "premium",
]);
export const productMoodSchema = z.enum([
  "dia-a-dia",
  "comodo-y-suave",
  "noche-especial",
  "invisible",
  "elegancia-minimalista",
  "sensual-delicado",
  "bridal",
  "lounge",
]);
export const supportLevelSchema = z.enum(["bajo", "medio", "alto"]);
export const transparencySchema = z.enum(["ninguna", "baja", "alta"]);

// 2. Esquema de Carga Rápida de Looks (Fase 9 Comercial 🇧🇷)
export const quickLoadProductSchema = z.object({
  title: z
    .string()
    .min(3, { message: "El título del look debe tener al menos 3 caracteres." })
    .max(100, { message: "El título no puede exceder los 100 caracteres." }),
  description: z
    .string()
    .min(5, { message: "Ingresa una breve descripción de seda para el look." })
    .max(500),
  brand: productBrandSchema,
  category: productCategorySchema,
  mood: productMoodSchema,
  color: z.string().min(2, { message: "Especifica el tono o paleta de color." }),
  supportLevel: supportLevelSchema,
  transparency: transparencySchema,
  immediateAvailability: z.boolean(),
  
  // Variables Financieras de Importación (Pricing)
  costUsd: z.coerce
    .number()
    .positive({ message: "El costo FOB neto en USD debe ser mayor a 0." }),
  referenceExchangeRate: z.coerce
    .number()
    .positive({ message: "La cotización del dólar ARS debe ser un valor positivo." }),
  gainMargin: z.coerce
    .number()
    .positive({ message: "El multiplicador de margen debe ser positivo (ej. 2.2)." }),
  price: z.coerce
    .number()
    .positive({ message: "El precio de venta en pesos debe ser mayor a 0." }), // Editable por asesora antes de publicar

  imageUrl: z.string().url({ message: "Ingresa una URL válida de imagen." }).or(z.string()),
  
  // Variantes de Talles granular (Stock Map)
  stockMap: z.record(
    z.string(), 
    z.number().min(0, { message: "El stock no puede ser negativo." })
  )
});

// Tipo inferido para Carga Rápida
export type QuickLoadProductInput = z.infer<typeof quickLoadProductSchema>;

// 3. Esquema de Pricing y Ajuste Global de Cotizaciones (Protección Inflacionaria)
export const globalPricingSchema = z.object({
  exchangeRate: z.coerce
    .number()
    .positive({ message: "La cotización debe ser mayor a 0." }),
  gainMargin: z.coerce
    .number()
    .positive({ message: "El margen debe ser un valor positivo." }),
});

export type GlobalPricingInput = z.infer<typeof globalPricingSchema>;

// 4. Esquema de Suscripción a Waitlist (Lista de Espera)
export const waitlistSubscriptionSchema = z.object({
  variantId: z.string().uuid({ message: "ID de variante inválido." }),
  clientName: z
    .string()
    .min(3, { message: "Ingresa el nombre completo de la clienta." })
    .max(80),
  whatsappNumber: z
    .string()
    .min(8, { message: "El número de WhatsApp debe tener al menos 8 dígitos." })
    .max(25)
    .regex(/^\+?[0-9\s\-]+$/, { message: "El número de teléfono contiene caracteres inválidos." })
});

export type WaitlistSubscriptionInput = z.infer<typeof waitlistSubscriptionSchema>;

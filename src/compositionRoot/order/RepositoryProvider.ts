// src/compositionRoot/order/RepositoryProvider.ts

import { OrderRepository } from "@/domain/order/order.repository";
import { SupabaseOrderRepository } from "@/infrastructure/order/supabaseOrder.repository";
import { LocalOrderRepository } from "@/infrastructure/order/localOrder.repository";

let cachedOrderRepository: OrderRepository | null = null;

/**
 * Función auxiliar para evaluar si las variables de entorno de Supabase están activas.
 */
function isSupabaseConfigured(): boolean {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ""
  );
}

/**
 * Composition Root - Proveedor Central de Inyección de Dependencias para Órdenes.
 * Retorna dinámicamente el repositorio correcto garantizando total conformidad con el contrato del dominio.
 */
export function provideOrderRepository(): OrderRepository {
  if (!cachedOrderRepository) {
    cachedOrderRepository = isSupabaseConfigured()
      ? new SupabaseOrderRepository(null) // Reemplazar con cliente de Supabase real si se requiere instanciación explícita
      : new LocalOrderRepository();
  }
  return cachedOrderRepository;
}
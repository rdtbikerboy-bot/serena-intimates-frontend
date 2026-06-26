// src/compositionRoot/product/ProductRepositoryProvider.ts

import { ProductRepository } from "@/domain/product/product.repository";
import { SupabaseProductRepository } from "@/infrastructure/product/supabaseProduct.repository";

let cachedRepository: ProductRepository | null = null;

/**
 * Composition Root - Proveedor centralizado de inyección de dependencias para Productos.
 * Asegura que los Casos de Uso obtengan la implementación correcta sin conocer la base de datos de origen.
 */
export function provideProductRepository(): ProductRepository {
    if (!cachedRepository) {
        // Aquí se inyectaría el cliente configurado de Supabase real del proyecto.
        // ej: const supabase = getSupabaseClient();
        cachedRepository = new SupabaseProductRepository(null);
    }
    return cachedRepository;
}
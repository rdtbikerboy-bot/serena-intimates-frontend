// src/infrastructure/product/product.mapper.ts

import { Product } from "@/domain/product/product.entity";
import { ProductVariant, Category } from "@/domain/product/product.valueObjects";

/**
 * Estructura relacional exacta para la tabla `products` en Supabase.
 */
export type SupabaseProductRecord = {
    id: string;
    title: string;
    description: string;
    base_price: number;
    currency: string;
    is_active: boolean;
    categories: Category[];   // Almacenado como JSONB estructurado
    images: string[];          // Array de strings de Supabase Storage
    variants: ProductVariant[]; // Almacenado como JSONB con las dimensiones 3D paramétricas
    created_at: string;
};

/**
 * Mapeador de Infraestructura: Traduce la Entidad pura de Dominio a Registros de Base de Datos.
 */
export function toSupabase(product: Product): SupabaseProductRecord {
    return {
        id: product.id,
        title: product.title,
        description: product.description,
        base_price: product.basePrice,
        currency: product.currency,
        is_active: product.isActive,
        categories: product.categories,
        images: product.images,
        variants: product.variants,
        created_at: product.createdAt.toISOString(),
    };
}

/**
 * Mapeador de Infraestructura: Reconstruye de forma segura la Entidad de Dominio desde Supabase.
 */
export function fromSupabase(record: SupabaseProductRecord): Product {
    return new Product({
        id: record.id,
        title: record.title,
        description: record.description,
        basePrice: record.base_price,
        currency: record.currency,
        isActive: record.is_active,
        categories: record.categories,
        images: record.images,
        variants: record.variants.map((v: any) => ({
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock,
            threeDMetrics: {
                baseBustCm: v.threeDMetrics?.baseBustCm,
                baseUnderbustCm: v.threeDMetrics?.baseUnderbustCm,
                baseWaistCm: v.threeDMetrics?.baseWaistCm,
                baseHipsCm: v.threeDMetrics?.baseHipsCm,
                stretchFactor: v.threeDMetrics?.stretchFactor ?? 1.0,
                gltfModelUrl: v.threeDMetrics?.gltfModelUrl
            }
        })),
        createdAt: new Date(record.created_at),
    });
}
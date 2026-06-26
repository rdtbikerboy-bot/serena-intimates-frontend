// src/infrastructure/product/supabaseProduct.repository.ts

import { ProductRepository } from "@/domain/product/product.repository";
import { Product } from "@/domain/product/product.entity";
import { fromSupabase, toSupabase, SupabaseProductRecord } from "./product.mapper";

/**
 * Implementación de Infraestructura del repositorio de Productos usando Supabase.
 * Mantiene la UI y el Dominio totalmente aislados de las queries de la base de datos.
 */
export class SupabaseProductRepository implements ProductRepository {
    private readonly tableName = "products";

    // Simulamos el cliente de Supabase. Reemplazar por tu cliente inyectado real de la app (ej: import { supabase } from '../supabaseClient')
    private supabaseClient: any;

    constructor(supabaseInstance?: any) {
        this.supabaseClient = supabaseInstance;
    }

    async findById(id: string): Promise<Product | null> {
        // Lógica de infraestructura encapsulada
        if (!this.supabaseClient) return null;

        const { data, error } = await this.supabaseClient
            .from(this.tableName)
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;
        return fromSupabase(data as SupabaseProductRecord);
    }

    async findAllActive(): Promise<Product[]> {
        if (!this.supabaseClient) {
            // Fallback defensivo para que la app no rompa mientras configuras tus credenciales de Supabase
            return [];
        }

        const { data, error } = await this.supabaseClient
            .from(this.tableName)
            .select("*")
            .eq("is_active", true);

        if (error || !data) return [];
        return data.map((record: any) => fromSupabase(record as SupabaseProductRecord));
    }

    async save(product: Product): Promise<Product> {
        if (!this.supabaseClient) return product;

        const record = toSupabase(product);
        const { error } = await this.supabaseClient
            .from(this.tableName)
            .upsert(record);

        if (error) {
            throw new Error(`[Infrastructure Error] Error al persistir el producto: ${error.message}`);
        }

        return product;
    }
}
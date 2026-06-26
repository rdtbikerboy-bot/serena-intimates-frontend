// src/infrastructure/order/supabaseOrder.repository.ts

import { OrderRepository } from "@/domain/order/order.repository";
import { Order } from "@/domain/order/order.entity";
import { toSupabase, fromSupabase, SupabaseOrderRecord } from "./order.mapper";

/**
 * Repositorio de Infraestructura: Implementación oficial usando Supabase PostgreSQL.
 * Satisface las demandas de la interfaz de dominio aislando las queries de la UI.
 */
export class SupabaseOrderRepository implements OrderRepository {
  private readonly tableName = "orders";
  private supabaseClient: any; // Instancia inyectada en el Composition Root

  constructor(supabaseInstance?: any) {
    this.supabaseClient = supabaseInstance;
  }

  async insert(order: Order): Promise<Order> {
    if (!this.supabaseClient) return order;

    const record = toSupabase(order);
    const { error } = await this.supabaseClient
      .from(this.tableName)
      .insert(record);

    if (error) {
      throw new Error(`[Infrastructure Error] Error al insertar orden: ${error.message}`);
    }
    return order;
  }

  async update(order: Order): Promise<Order> {
    if (!this.supabaseClient) return order;

    const record = toSupabase(order);
    const { error } = await this.supabaseClient
      .from(this.tableName)
      .update(record)
      .eq("id", order.id);

    if (error) {
      throw new Error(`[Infrastructure Error] Error al actualizar orden: ${error.message}`);
    }
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    if (!this.supabaseClient) return null;

    const { data, error } = await this.supabaseClient
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return fromSupabase(data as SupabaseOrderRecord);
  }

  async findAll(): Promise<Order[]> {
    if (!this.supabaseClient) return [];

    const { data, error } = await this.supabaseClient
      .from(this.tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((record: any) => fromSupabase(record as SupabaseOrderRecord));
  }
}
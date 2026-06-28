// src/infrastructure/customer/supabaseCustomer.repository.ts
import { CustomerRepository } from "@/domain/customer/repositories/customer.repository";
import { Customer } from "@/domain/customer/entities/Customer";
import { CustomerMapper, SupabaseCustomerRecord } from "./customer.mapper";
import { serenaLogger } from "@/core/logger";

/**
 * Repositorio de Infraestructura: SupabaseCustomerRepository.
 * Centraliza la persistencia elástica de perfiles corporales en la base de datos distribuida.
 */
export class SupabaseCustomerRepository implements CustomerRepository {
    private readonly tableName = "customers";

    constructor(private readonly supabaseClient: any) { }

    async findById(id: string): Promise<Customer | null> {
        if (!this.supabaseClient) return null;

        try {
            const { data, error } = await this.supabaseClient
                .from(this.tableName)
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                serenaLogger.info(`[Infrastructure] Cliente ${id} no encontrado en Supabase.`);
                return null;
            }

            return CustomerMapper.toDomain(data as SupabaseCustomerRecord);
        } catch (err: any) {
            serenaLogger.error(`[Infrastructure Error] Fallo al buscar cliente ${id}:`, { error: err.message });
            return null;
        }
    }

    async save(customer: Customer): Promise<Customer> {
        if (!this.supabaseClient) return customer;

        const record = CustomerMapper.toPersistence(customer);

        const { error } = await this.supabaseClient
            .from(this.tableName)
            .upsert(record);

        if (error) {
            throw new Error(`[Supabase Infrastructure Error] No se pudo guardar el cliente: ${error.message}`);
        }

        serenaLogger.info(`[Infrastructure] Perfil morfológico de cliente ${customer.id} persistido exitosamente.`);
        return customer;
    }
}
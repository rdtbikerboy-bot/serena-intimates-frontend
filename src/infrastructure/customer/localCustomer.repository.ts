// src/infrastructure/customer/localCustomer.repository.ts
import { CustomerRepository } from "@/domain/customer/repositories/customer.repository";
import { Customer } from "@/domain/customer/entities/Customer";
import { CustomerMapper } from "./customer.mapper";

/**
 * Repositorio de Infraestructura Local (Fallback en memoria / LocalStorage).
 * Garantiza que la experiencia del probador 3D sea fluida incluso si la conexión falla.
 */
export class LocalCustomerRepository implements CustomerRepository {
    private readonly storageKey = "serena_local_customer_profile";

    async findById(id: string): Promise<Customer | null> {
        if (typeof window === "undefined") return null;

        const rawData = localStorage.getItem(`${this.storageKey}_${id}`);
        if (!rawData) return null;

        try {
            const parsedRecord = JSON.parse(rawData);
            return CustomerMapper.toDomain(parsedRecord);
        } catch {
            return null;
        }
    }

    async save(customer: Customer): Promise<Customer> {
        if (typeof window === "undefined") return customer;

        const record = CustomerMapper.toPersistence(customer);
        localStorage.setItem(`${this.storageKey}_${customer.id}`, JSON.stringify(record));
        return customer;
    }
}
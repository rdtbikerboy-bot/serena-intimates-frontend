// src/domain/customer/repositories/customer.repository.ts
import { Customer } from "../entities/Customer";

/**
 * Contrato de Dominio (Interface): CustomerRepository.
 * Declara las operaciones inmutables para persistencia de Clientes.
 */
export interface CustomerRepository {
    findById(id: string): Promise<Customer | null>;
    save(customer: Customer): Promise<Customer>;
}
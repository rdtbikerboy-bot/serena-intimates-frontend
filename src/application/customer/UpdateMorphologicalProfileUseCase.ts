// src/application/customer/UpdateMorphologicalProfileUseCase.ts

import { CustomerRepository } from '@/domain/customer/repositories/customer.repository';
import { BodyMeasurements, FitPreference } from '@/domain/customer/values/BodyMeasurements';
import { serenaLogger } from '@/core/logger';

export interface UpdateProfileInput {
    customerId: string;
    bust: number;
    underbust: number;
    waist: number;
    hips: number;
    preference: FitPreference;
}

/**
 * Caso de Uso de Aplicación: Actualizar el Perfil Morfológico del Cliente.
 * Apunta con precisión a la carpeta de infraestructura /repositories/.
 */
export class UpdateMorphologicalProfileUseCase {
    constructor(private readonly customerRepository: CustomerRepository) {
        serenaLogger.info("UpdateMorphologicalProfileUseCase inicializado.");
    }

    async execute(input: UpdateProfileInput): Promise<void> {
        try {
            serenaLogger.info(`Procesando actualización morfológica para CustomerID: ${input.customerId}`);

            // 1. Instanciación Segura del Value Object
            const measurements = BodyMeasurements.create({
                bust: input.bust,
                underbust: input.underbust,
                waist: input.waist,
                hips: input.hips,
                preference: input.preference,
            });

            // 2. Recuperación del Agregado Raíz
            const customer = await this.customerRepository.findById(input.customerId);
            if (!customer) {
                throw new Error(`[Application Error] Cliente con ID ${input.customerId} no encontrado.`);
            }

            // 3. Mutación de Dominio
            customer.updateMorphologicalProfile(measurements);

            // 4. Persistencia
            await this.customerRepository.save(customer);

            serenaLogger.info(`Perfil morfológico guardado con éxito total para: ${customer.fullName}`);
        } catch (error: any) {
            serenaLogger.error("Error crítico en el Caso de Uso de Perfil Morfológico", { error: error.message });
            throw error;
        }
    }
}


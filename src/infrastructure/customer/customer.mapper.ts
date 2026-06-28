// src/infrastructure/customer/customer.mapper.ts
import { Customer } from "@/domain/customer/entities/Customer";
import { BodyMeasurements } from "@/domain/customer/values/BodyMeasurements";

export interface SupabaseCustomerRecord {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    created_at: string;
    morphological_profile?: {
        bust: number;
        underbust: number;
        waist: number;
        hips: number;
        preference: 'SNUG' | 'REGULAR' | 'LOOSE';
        measured_at: string;
    } | null;
}

/**
 * Data Mapper: CustomerMapper.
 * Transforma estructuras persistidas crudas a Entidades de Dominio puras.
 */
export class CustomerMapper {
    public static toDomain(record: SupabaseCustomerRecord): Customer {
        const customer = Customer.create({
            firstName: record.first_name,
            lastName: record.last_name,
            phoneNumber: record.phone_number,
            createdAt: new Date(record.created_at)
        }, record.id);

        if (record.morphological_profile) {
            const profile = BodyMeasurements.create({
                bust: record.morphological_profile.bust,
                underbust: record.morphological_profile.underbust,
                waist: record.morphological_profile.waist,
                hips: record.morphological_profile.hips,
                preference: record.morphological_profile.preference,
                measuredAt: new Date(record.morphological_profile.measured_at)
            });
            customer.updateMorphologicalProfile(profile);
        }

        return customer;
    }

    public static toPersistence(customer: Customer): any {
        const profile = customer.morphologicalProfile;
        return {
            id: customer.id,
            first_name: customer.firstName,
            last_name: customer.lastName,
            phone_number: customer.phoneNumber,
            created_at: customer.createdAt.toISOString(),
            morphological_profile: profile ? {
                bust: profile.bust,
                underbust: profile.underbust,
                waist: profile.waist,
                hips: profile.hips,
                preference: profile.preference,
                measured_at: profile.measuredAt.toISOString()
            } : null
        };
    }
}
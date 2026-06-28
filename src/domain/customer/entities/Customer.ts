// src/domain/customer/entities/Customer.ts
import { BodyMeasurements } from "../values/BodyMeasurements";

export interface CustomerProps {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    createdAt?: Date;
}

/**
 * Agregado Raíz (Entity): Customer.
 * Representa a la clienta dentro del ecosistema Serena Intimates.
 */
export class Customer {
    private _morphologicalProfile: BodyMeasurements | null = null;

    private constructor(
        private readonly props: CustomerProps,
        public readonly id: string
    ) {
        this.props.createdAt = props.createdAt ?? new Date();
    }

    public static create(props: CustomerProps, id: string): Customer {
        if (!props.firstName || !props.lastName) {
            throw new Error("[Domain Error] El nombre y apellido de la clienta son obligatorios.");
        }
        return new Customer(props, id);
    }

    public updateMorphologicalProfile(measurements: BodyMeasurements): void {
        this._morphologicalProfile = measurements;
    }

    public get firstName(): string { return this.props.firstName; }
    public get lastName(): string { return this.props.lastName; }
    public get fullName(): string { return `${this.props.firstName} ${this.props.lastName}`; }
    public get phoneNumber(): string { return this.props.phoneNumber; }
    public get createdAt(): Date { return this.props.createdAt!; }
    public get morphologicalProfile(): BodyMeasurements | null { return this._morphologicalProfile; }
}
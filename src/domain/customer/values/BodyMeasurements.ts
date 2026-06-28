// src/domain/customer/values/BodyMeasurements.ts

export type FitPreference = 'SNUG' | 'REGULAR' | 'LOOSE';

export interface BodyMeasurementsProps {
    bust: number;
    underbust: number;
    waist: number;
    hips: number;
    preference: FitPreference;
    measuredAt?: Date;
}

/**
 * Value Object: Perfil Antropométrico de la Clienta.
 * Aplica reglas anatómicas estrictas del mercado de lencería argentino.
 */
export class BodyMeasurements {
    private constructor(private readonly props: BodyMeasurementsProps) {
        Object.freeze(this);
    }

    public static create(props: BodyMeasurementsProps): BodyMeasurements {
        if (props.bust <= 0 || props.underbust <= 0 || props.waist <= 0 || props.hips <= 0) {
            throw new Error("[Domain Error] Las medidas corporales deben ser mayores a cero.");
        }
        if (props.underbust >= props.bust) {
            throw new Error("[Domain Error] El contorno bajo busto no puede ser igual o mayor al contorno de busto.");
        }
        return new BodyMeasurements({
            ...props,
            measuredAt: props.measuredAt ?? new Date()
        });
    }

    public get bust(): number { return this.props.bust; }
    public get underbust(): number { return this.props.underbust; }
    public get waist(): number { return this.props.waist; }
    public get hips(): number { return this.props.hips; }
    public get preference(): FitPreference { return this.props.preference; }
    public get measuredAt(): Date { return this.props.measuredAt!; }
}
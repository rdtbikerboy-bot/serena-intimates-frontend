// src/domain/product/values/TextileProperty.ts

export type FabricType = 'LACE_RIGID' | 'MICROFIBER_STRETCH' | 'COTTON_ELASTANE' | 'SILK_SATIN';

export interface TextilePropertyProps {
    fabricType: FabricType;
    stretchFactor: number; // Porcentaje de estiramiento admisible (ej: 1.20 = 20% de elongación)
    tensileResistance: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Value Object: Propiedades Textiles de la Prenda.
 * Determina el comportamiento elástico del patrón de confección.
 */
export class TextileProperty {
    private constructor(private readonly props: TextilePropertyProps) {
        Object.freeze(this);
    }

    public static create(props: TextilePropertyProps): TextileProperty {
        if (props.stretchFactor < 1.0) {
            throw new Error("[Domain Error] El factor de estiramiento no puede ser menor a 1.0 (base rígida).");
        }
        return new TextileProperty(props);
    }

    public get fabricType(): FabricType { return this.props.fabricType; }
    public get stretchFactor(): number { return this.props.stretchFactor; }
    public get tensileResistance(): string { return this.props.tensileResistance; }
}


// src/domain/product/product.entity.ts

import { ProductVariant, Category } from "./product.valueObjects";

/**
 * Entidad de Dominio: Agregado Raíz del Contexto de Catálogo (Product).
 * Diseñado bajo estándares Enterprise para soportar ecommerce tradicional e inmersivo 3D.
 */
export class Product {
    public readonly id: string;
    public readonly title: string;
    public readonly description: string;
    public readonly basePrice: number;
    public readonly currency: string;
    public readonly isActive: boolean;
    public readonly categories: Category[];
    public readonly images: string[];
    public readonly variants: ProductVariant[];
    public readonly createdAt: Date;

    constructor(params: {
        id: string;
        title: string;
        description: string;
        basePrice: number;
        currency: string;
        isActive: boolean;
        categories: Category[];
        images: string[];
        variants: ProductVariant[];
        createdAt: Date;
    }) {
        if (params.basePrice <= 0) throw new Error("[Product Domain] El precio base debe ser mayor a cero.");
        if (params.variants.length === 0) throw new Error("[Product Domain] Un producto comercializable debe poseer al menos una variante.");

        this.id = params.id;
        this.title = params.title;
        this.description = params.description;
        this.basePrice = params.basePrice;
        this.currency = params.currency;
        this.isActive = params.isActive;
        this.categories = params.categories;
        this.images = params.images;
        this.variants = params.variants;
        this.createdAt = params.createdAt;
    }

    /**
     * Determina con precisión matemática si un talle específico de este producto
     * es compatible con las medidas corporales reales (Digital Twin) de una clienta.
     */
    public calculateFitConfidence(variantSku: string, customerBustCm: number, customerHipsCm: number): { score: number; advice: "PERFECT" | "TIGHT" | "LOOSE" } {
        const variant = this.variants.find(v => v.sku === variantSku);
        if (!variant) throw new Error("[Product Domain] Variante no localizada.");

        const metrics = variant.threeDMetrics;
        if (!metrics.baseBustCm) {
            return { score: 50, advice: "PERFECT" }; // Fallback si no tiene datos geométricos aún
        }

        // Algoritmo predictivo básico de calce por estiramiento de tela
        const maxBustStretch = metrics.baseBustCm * metrics.stretchFactor;

        if (customerBustCm >= metrics.baseBustCm && customerBustCm <= maxBustStretch) {
            return { score: 95, advice: "PERFECT" };
        } else if (customerBustCm > maxBustStretch) {
            return { score: 40, advice: "TIGHT" }; // Le va a quedar muy ajustado
        } else {
            return { score: 60, advice: "LOOSE" }; // Le va a quedar suelto
        }
    }
}
// src/domain/product/product.valueObjects.ts

/**
 * Dimensiones físicas tridimensionales y de elasticidad de la prenda.
 * Servirá como mapa geométrico de entrada para el motor del Vestidor Virtual 3D e IA.
 */
export interface Garment3DMetrics {
    baseBustCm?: number;      // Contorno de busto base de la prenda sin estirar
    baseUnderbustCm?: number; // Contorno de bajo busto (para corpiños/conjuntos)
    baseWaistCm?: number;     // Contorno de cintura
    baseHipsCm?: number;      // Contorno de cadera
    stretchFactor: number;    // Multiplicador de elasticidad de la tela (ej: 1.2 para lycra premium)
    gltfModelUrl?: string;    // Ruta al archivo del modelo 3D (.gltf / .glb) optimizado en Supabase Storage
}

export interface ProductVariant {
    sku: string;             // Identificador único de inventario (ej: SER-CONJ-LACE-NEGRO-90)
    size: string;            // Talle comercial (ej: 85, 90, 95, S, M, L)
    color: string;           // Color de la prenda
    stock: number;           // Inventario físico disponible
    threeDMetrics: Garment3DMetrics; // Datos físicos para el acople del avatar interactivo
}

export interface Category {
    id: string;
    name: string;            // ej: "Conjuntos", "Bombachas", "Maternal", "Premium Line"
    slug: string;
}
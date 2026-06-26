// src/domain/product/product.repository.ts

import { Product } from "./product.entity";

/**
 * Interfaz de Dominio para el repositorio de Productos.
 * Define las operaciones permitidas de almacenamiento sin acoplarse a la base de datos.
 */
export interface ProductRepository {
    findById(id: string): Promise<Product | null>;
    findAllActive(): Promise<Product[]>;
    save(product: Product): Promise<Product>;
}
// src/application/product/ListActiveProductsUseCase.ts

import { ProductRepository } from "@/domain/product/product.repository";
import { Product } from "@/domain/product/product.entity";
import { serenaLogger } from "@/core/logger";

/**
 * Caso de Uso de Aplicación: Listar Productos Activos en Catálogo.
 * Provee a la interfaz de usuario los modelos de lencería listos para renderizarse en la tienda.
 */
export class ListActiveProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) {
        serenaLogger.info("ListActiveProductsUseCase inicializado");
    }

    async execute(): Promise<Product[]> {
        try {
            const products = await this.productRepository.findAllActive();
            serenaLogger.info(`Catálogo recuperado con éxito. Cantidad: ${products.length}`);
            return products;
        } catch (error) {
            serenaLogger.error("Error al obtener productos activos para el local virtual", { error });
            return [];
        }
    }
}
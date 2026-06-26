// src/services/orderStatusService.ts

import { provideOrderRepository } from "@/compositionRoot/order/RepositoryProvider";
import { MarkWhatsappOpenedUseCase } from "@/application/order/usecases/MarkWhatsappOpenedUseCase";
import { serenaLogger } from "@/core/logger";

/**
 * Servicio de Orquestación Visual para los Estados de las Órdenes.
 * Encapsula la captura de excepciones de infraestructura protegiendo la UI.
 */
class OrderStatusService {
  /**
   * Registra en la base de datos la apertura del gateway de WhatsApp de forma segura.
   * @param orderId Identificador único de la orden (UUID).
   */
  async markWhatsappOpened(orderId: string): Promise<void> {
    try {
      const repository = provideOrderRepository();
      const useCase = new MarkWhatsappOpenedUseCase(repository);

      serenaLogger.info("Ejecutando MarkWhatsappOpenedUseCase desde la interfaz", { orderId });
      await useCase.execute(orderId);
    } catch (error) {
      // Captura y loggeo tolerante a fallos: Evita interrumpir la experiencia de la clienta si falla la red
      serenaLogger.error("Fallo no crítico al registrar apertura de WhatsApp en BD", { error, orderId });
    }
  }
}

export const orderStatusService = new OrderStatusService();
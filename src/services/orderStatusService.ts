import { provideOrderRepository } from "@/compositionRoot/order/RepositoryProvider";
import { MarkWhatsappOpenedUseCase } from "@/application/order/usecases/MarkWhatsappOpenedUseCase";
import { serenaLogger } from "@/core/logger";

class OrderStatusService {
  async markWhatsappOpened(orderId: string): Promise<void> {
    const repository = provideOrderRepository();
    const useCase = new MarkWhatsappOpenedUseCase(repository);
    await useCase.execute(orderId);
  }
}

export const orderStatusService = new OrderStatusService();

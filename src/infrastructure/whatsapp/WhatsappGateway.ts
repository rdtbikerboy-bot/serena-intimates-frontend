// src/infrastructure/whatsapp/WhatsappGateway.ts
export interface WhatsappGateway {
  /**
   * Opens WhatsApp with a pre‑filled message.
   * The implementation must construct the final wa.me URL and invoke window.open.
   */
  open(message: string): void;
}

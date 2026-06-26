// src/infrastructure/whatsapp/BrowserWhatsappGateway.ts
import { WhatsappGateway } from "./WhatsappGateway";

/**
 * Concrete implementation for browsers. Constructs the wa.me URL and opens it via window.open.
 */
export class BrowserWhatsappGateway implements WhatsappGateway {
  constructor(private readonly number: string) {}

  open(message: string): void {
    const waLink = `https://wa.me/${this.number}?text=${encodeURIComponent(message)}`;
    if (typeof window !== "undefined") {
      window.open(waLink, "_blank");
    }
  }
}

import { describe, it, expect } from "vitest";
import { clientRateLimiter } from "./rateLimiter";

describe("Anti-Spam Rate Limiter (rateLimiter.ts)", () => {
  it("debe permitir el primer disparo táctil", () => {
    expect(clientRateLimiter.canTrigger("test_action_first")).toBe(true);
  });

  it("debe bloquear disparos inmediatos dentro del rango de cooldown", () => {
    clientRateLimiter.canTrigger("spam_action", 2000);
    // Debe bloquear el segundo click inmediato
    expect(clientRateLimiter.canTrigger("spam_action", 2000)).toBe(false);
  });

  it("debe permitir ejecutar de nuevo si se especifica un cooldown de 0", () => {
    clientRateLimiter.canTrigger("immediate_action", 0);
    expect(clientRateLimiter.canTrigger("immediate_action", 0)).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { 
  roundToBoutiquePrice, 
  calculateSuggestedPrice, 
  calculateNetProfitPercent 
} from "./pricing";

describe("Motor de Precios e Importación (pricing.ts)", () => {
  describe("Redondeo Estético (roundToBoutiquePrice)", () => {
    it("debe retornar 0 para valores menores o iguales a cero", () => {
      expect(roundToBoutiquePrice(0)).toBe(0);
      expect(roundToBoutiquePrice(-100)).toBe(0);
    });

    it("debe redondear al millar o quinientos pesos más cercanos para valores altos (> $20,000)", () => {
      // 33243 / 500 = 66.486 -> Math.round = 66 -> * 500 = 33000
      expect(roundToBoutiquePrice(33243)).toBe(33000);
      // 21890 / 500 = 43.78 -> Math.round = 44 -> * 500 = 22000
      expect(roundToBoutiquePrice(21890)).toBe(22000);
    });

    it("debe redondear a las centenas más cercanas para valores medianos ($10,000 - $20,000)", () => {
      expect(roundToBoutiquePrice(15234)).toBe(15200);
      expect(roundToBoutiquePrice(18976)).toBe(19000);
    });

    it("debe redondear a los $50 más cercanos para valores bajos (<= $10,000)", () => {
      expect(roundToBoutiquePrice(5423)).toBe(5400);
      expect(roundToBoutiquePrice(5434)).toBe(5450);
      expect(roundToBoutiquePrice(123)).toBe(100);
    });
  });

  describe("Cálculo de Precios Sugeridos (calculateSuggestedPrice)", () => {
    it("debe calcular el precio sugerido con parámetros explícitos y redondearlo", () => {
      // Costo FOB: 15 USD, Dólar: 1000 ARS, Margen: 2.2 -> 15 * 1000 * 2.2 = 33000
      expect(calculateSuggestedPrice(15, 1000, 2.2)).toBe(33000);
    });

    it("debe usar valores por defecto si no se especifican dólar ni margen", () => {
      const price = calculateSuggestedPrice(10);
      expect(price).toBeGreaterThan(0);
    });
  });

  describe("Cálculo de Margen de Utilidad Neto (calculateNetProfitPercent)", () => {
    it("debe calcular el ROI porcentual sobre precio minorista de forma exacta", () => {
      // Costo FOB: 10 USD, Dólar: 1000 ARS -> Costo ARS: 10000. Precio venta: 20000 ARS
      // Utilidad: 10000 ARS. ROI: (10000 / 20000) * 100 = 50.0%
      expect(calculateNetProfitPercent(10, 1000, 20000)).toBe(50);
    });

    it("debe retornar 0 si el costo de importación evaluado es menor o igual a 0", () => {
      expect(calculateNetProfitPercent(0, 1000, 20000)).toBe(0);
      expect(calculateNetProfitPercent(10, 0, 20000)).toBe(0);
    });
  });
});

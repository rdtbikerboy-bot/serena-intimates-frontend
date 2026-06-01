import { describe, it, expect } from "vitest";
import { Product } from "@/core/types";
import { 
  calculateProductAffinity, 
  sortProductsBySerenaMemory 
} from "./affinity";

// Mock Products
const mockProductA: Product = {
  id: "uuid-prod-a",
  title: "Bustier Soft Silk",
  description: "Un look romántico delicado.",
  price: 32000,
  category: "romantico",
  imageUrl: "https://images.unsplash.com/photo-a",
  brand: "Valisere",
  color: "Negro",
  supportLevel: "medio",
  transparency: "baja",
  immediateAvailability: true,
  mood: "dia-a-dia",
  collections: ["romantico"],
  badges: []
};

const mockProductB: Product = {
  id: "uuid-prod-b",
  title: "Conjunto Carla Noir",
  description: "Soporte alto y encaje premium.",
  price: 45000,
  category: "premium",
  imageUrl: "https://images.unsplash.com/photo-b",
  brand: "Hope",
  color: "Rojo",
  supportLevel: "alto",
  transparency: "alta",
  immediateAvailability: true,
  mood: "noche-especial",
  collections: ["premium"],
  badges: []
};

describe("Motor de Afinidad Memoria Serena 70/30 (affinity.ts)", () => {
  describe("Cálculo de Afinidad de Look (calculateProductAffinity)", () => {
    it("debe retornar un objeto AffinityResult", () => {
      const result = calculateProductAffinity(
        mockProductA,
        [],
        null,
        {},
        {},
        42
      );
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
      expect(result.breakdown).toBeDefined();
    });

    it("debe aumentar la afinidad si el talle de busto y soporte coinciden perfectamente", () => {
      const scoreHighSupport = calculateProductAffinity(
        mockProductB,
        [],
        { busto: "95", bombacha: "90" },
        {},
        {},
        42
      ).totalScore;

      const scoreMedSupport = calculateProductAffinity(
        mockProductA,
        [],
        { busto: "95", bombacha: "90" },
        {},
        {},
        42
      ).totalScore;

      expect(scoreHighSupport).toBeGreaterThan(scoreMedSupport);
    });

    it("debe aumentar la afinidad si la clienta interactúa con la marca o categoría", () => {
      const scoreNoViews = calculateProductAffinity(
        mockProductA,
        [],
        null,
        {},
        {},
        123
      ).totalScore;

      const scoreWithBrandViews = calculateProductAffinity(
        mockProductA,
        [],
        null,
        { Valisere: 5 },
        {},
        123
      ).totalScore;

      expect(scoreWithBrandViews).toBeGreaterThan(scoreNoViews);
    });

    it("debe incrementar el score si la prenda está en la wishlist (favoritos)", () => {
      const scoreNoFavorite = calculateProductAffinity(mockProductA, [], null, {}, {}, 10).totalScore;
      const scoreIsFavorite = calculateProductAffinity(mockProductA, [mockProductA.title], null, {}, {}, 10).totalScore;
      expect(scoreIsFavorite).toBeGreaterThan(scoreNoFavorite);
    });
  });

  describe("Ordenamiento del Feed (sortProductsBySerenaMemory)", () => {
    it("debe ordenar descendientemente priorizando looks con mayor afinidad", () => {
      const products = [mockProductA, mockProductB];
      const sorted = sortProductsBySerenaMemory(
        products,
        [mockProductB.title], // B es favorito
        null,
        {},
        {},
        99
      );

      // El producto B debe ser ordenado primero en la lista
      expect(sorted[0].id).toBe(mockProductB.id);
      expect(sorted[0]._affinity).toBeDefined();
    });
  });
});

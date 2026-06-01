import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./useCartStore";

describe("Zustand Stores - Cart & Memory (stores.test.ts)", () => {
  beforeEach(() => {
    // Resetear carrito antes de cada test para evitar contaminación
    useCartStore.getState().clearCart();
  });

  it("debe agregar un look con talle al carrito", () => {
    useCartStore.getState().addItem(
      { id: "prod-test-cart", title: "Bralette Rose Silk", imageUrl: "https://images.unsplash.com/photo-1" },
      "90",
      28000
    );
    const items = useCartStore.getState().cartItems;
    
    expect(items.length).toBe(1);
    expect(items[0].title).toBe("Bralette Rose Silk");
    expect(items[0].size).toBe("90");
    expect(items[0].price).toBe(28000);
  });

  it("debe remover un look del carrito", () => {
    useCartStore.getState().addItem(
      { id: "prod-test-cart", title: "Bralette Rose Silk", imageUrl: "https://images.unsplash.com/photo-1" },
      "90",
      28000
    );
    useCartStore.getState().removeItem("prod-test-cart", "90");
    const items = useCartStore.getState().cartItems;

    expect(items.length).toBe(0);
  });

  it("debe calcular el subtotal correctamente", () => {
    useCartStore.getState().addItem(
      { id: "prod-1", title: "Look A", imageUrl: "https://images.unsplash.com/photo-1" },
      "85",
      10000
    );
    useCartStore.getState().addItem(
      { id: "prod-2", title: "Look B", imageUrl: "https://images.unsplash.com/photo-2" },
      "95",
      15000
    );

    const total = useCartStore.getState().getSubtotal();
    expect(total).toBe(25000);
  });
});

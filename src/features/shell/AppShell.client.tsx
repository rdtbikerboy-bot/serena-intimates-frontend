"use client";

import { Header } from "@/components/ui-premium/Header";
import { TabBar } from "@/components/ui-premium/TabBar";
import { CartDrawer } from "@/components/ui-premium/CartDrawer";
import { HelpDrawer } from "@/components/ui-premium/HelpDrawer";
import { SizeGuideDrawer } from "@/components/ui-premium/SizeGuideDrawer";
import { ProductDrawer } from "@/components/ui-premium/ProductDrawer";
import { ExpressProductDrawer } from "@/components/ui-premium/ExpressProductDrawer";
import { TurnoDrawer } from "@/components/ui-premium/TurnoDrawer";
import { CatalogGrid } from "@/features/catalog/CatalogGrid";
import { useUIStore } from "@/store/useUIStore";

export default function AppShell() {
  const selectedProduct = useUIStore(s => s.selectedProduct);
  const setSelectedProduct = useUIStore(s => s.setSelectedProduct);
  const expressProduct = useUIStore(s => s.expressProduct);
  const setExpressProduct = useUIStore(s => s.setExpressProduct);

  return (
    <>
      <Header />
      <TabBar activeTab="discover" onTabChange={() => { }} isFitApplied={false} favoritesCount={0} />

      {/* Contenido principal */}
      <main className="flex-1 px-4 pt-4 pb-28">
        <CatalogGrid />
      </main>

      {/* Drawers */}
      <CartDrawer />
      <HelpDrawer isOpen={false} onClose={() => { }} />
      <SizeGuideDrawer isOpen={false} onClose={() => { }} />
      <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      {expressProduct && (
        <ExpressProductDrawer
          product={expressProduct}
          onClose={() => setExpressProduct(null)}
          onPublish={async () => setExpressProduct(null)}
        />
      )}
      <TurnoDrawer />
    </>
  );
}
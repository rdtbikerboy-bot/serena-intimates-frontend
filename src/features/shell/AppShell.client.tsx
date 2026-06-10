"use client";

import { Header } from "@/components/ui-premium/Header";
import { TabBar } from "@/components/ui-premium/TabBar";
import { CartDrawer } from "@/components/ui-premium/CartDrawer";
import { HelpDrawer } from "@/components/ui-premium/HelpDrawer";
import { SizeGuideDrawer } from "@/components/ui-premium/SizeGuideDrawer";
import { ProductDrawer } from "@/components/ui-premium/ProductDrawer";
import { ExpressProductDrawer } from "@/components/ui-premium/ExpressProductDrawer";
import { TurnoDrawer } from "@/components/ui-premium/TurnoDrawer";

export default function AppShell() {
  return (
    <>
      <Header />
      <TabBar />
      {/* Drawers */}
      <CartDrawer />
      <HelpDrawer isOpen={false} onClose={() => {}} />
      <SizeGuideDrawer isOpen={false} onClose={() => {}} />
      <ProductDrawer />
      <ExpressProductDrawer />
      <TurnoDrawer />
    </>
  );
}

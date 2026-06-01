import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Serena Intimates — Lencería Premium & Ajuste Perfecto",
  description: "Descubre lencería fina diseñada con elegancia editorial y ajuste perfecto no bloqueante. Compra con discreción absoluta y coordina por WhatsApp.",
  keywords: "lencería premium, corpiños, bombachas, novias, comfy, Salta, Serena Intimates, whatsapp checkout",
  authors: [{ name: "Serena Intimates" }],
  openGraph: {
    title: "Serena Intimates — Lencería Premium Brasilera",
    description: "Boutique digital de lencería fina y ajuste perfecto. Diseños de seda y encaje importado en Salta.",
    url: "https://serenaintimates.com",
    siteName: "Serena Intimates",
    images: [
      {
        url: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Serena Intimates — Boutique Premium",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Serena Intimates",
    description: "Lencería fina brasilera y ajuste perfecto en Salta.",
    images: ["https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=1200&auto=format&fit=crop"],
  },
  manifest: "/manifest.json",
};

import Providers from "@/services/providers";
// import { ErrorBoundary } from "@/components/ui-premium/ErrorBoundary";
// import { Toaster } from "sonner";
// import { SplashScreen } from "@/components/ui-premium/SplashScreen";
// import { WebVitals } from "@/components/ui-premium/WebVitals";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Serena Intimates",
              "image": "https://serenaintimates.com/images/logo.png",
              "description": "Boutique digital de lencería fina y ajuste perfecto en Salta.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Salta",
                "addressRegion": "Salta",
                "addressCountry": "AR"
              },
              "telephone": "+543874022233",
              "priceRange": "$$"
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-serena-silk text-serena-charcoal font-ui">
        {/* <WebVitals /> */}
        {/* <ErrorBoundary> */}
          <Providers>
            {/* <SplashScreen> */}
              {children}
            {/* </SplashScreen> */}
            {/* <Toaster /> */}
          </Providers>
        {/* </ErrorBoundary> */}
      </body>
    </html>
  );
}

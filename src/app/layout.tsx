import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { CartSidebar } from "@/components/ui/CartSidebar";
import { ThemeInjector } from "@/components/landing/ThemeInjector";
import { MetaPixel } from "@/components/tracking/MetaPixel";
import { GoogleAnalytics } from "@/components/tracking/GoogleAnalytics";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Home Stock | Muebles de Diseño",
  description: "Descubrí muebles únicos que transforman espacios. Diseño exclusivo, calidad premium y atención personalizada. Visitá nuestro showroom.",
  keywords: "muebles, diseño, hogar, decoración, showroom, muebles de diseño, interiorismo, Buenos Aires",
  metadataBase: new URL("https://homestock.com.ar"),
  openGraph: {
    title: "Home Stock | Muebles de Diseño",
    description: "Descubrí muebles únicos que transforman espacios. Diseño exclusivo, calidad premium y atención personalizada.",
    url: "https://homestock.com.ar",
    siteName: "Home Stock",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Home Stock - Muebles de Diseño",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Stock | Muebles de Diseño",
    description: "Descubrí muebles únicos que transforman espacios. Diseño exclusivo, calidad premium.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased`}
      >
        <ThemeInjector />
        <CartProvider>
          <CompareProvider>
            {children}
            <CartSidebar />
          </CompareProvider>
        </CartProvider>
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

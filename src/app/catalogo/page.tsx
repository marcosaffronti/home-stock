import { Suspense } from "react";
import { CatalogoPage } from "@/components/pages/CatalogoPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo | Home Stock",
  description:
    "Explorá nuestro catálogo completo de muebles de diseño. Sillas, cabeceras, banquetas, mesas y más. Elegí tu tela y color.",
};

export default function Page() {
  return (
    <Suspense>
      <CatalogoPage />
    </Suspense>
  );
}

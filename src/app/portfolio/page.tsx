import { PortfolioPage } from "@/components/pages/PortfolioPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | Home Stock",
  description:
    "Conocé nuestros proyectos de diseño de interiores. Comedores, ambientes, showroom y más.",
};

export default function Page() {
  return <PortfolioPage />;
}
